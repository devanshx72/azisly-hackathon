import logging
from typing import List, Optional
from sqlalchemy.orm import Session

from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from ..config import MISTRAL_API_KEY, MISTRAL_MODEL

from ..constants import FACTORS, ACTIVITY_UNITS
from ..repositories import activity_repo, target_repo
from ..week_utils import get_current_iso_week_bounds, compute_week_pacing
from ..schemas import ChatMessage

logger = logging.getLogger(__name__)

SYSTEM_PROMPT_TEMPLATE = """You are Leafy 🌿, the official AI climate companion and carbon footprint guide for PlanetPulse.
PlanetPulse is a zero-authentication personal carbon footprint tracker built for the CODE2CAREER AI Hackathon (Track 2: Real-World AI Products, Climate Tech Brief).

### Your Personality & Style:
- Warm, encouraging, scientifically grounded, and concise.
- Use emojis thoughtfully (🌿, 🚗, ⚡, 🥗, 💡).
- Celebrate eco-friendly wins, offer practical high-impact sustainability advice, and help users understand their emissions and weekly pacing.
- Never shame the user for high emissions; use constructive, solution-oriented coaching (consistent with PlanetPulse's DP1 philosophy).

### PlanetPulse Domain Rules & Emission Factors:
Calculations follow fixed single-source-of-truth emission factors:
- 🚗 Car travel: 0.20 kg CO₂ per km
- 🚌 Bus travel: 0.08 kg CO₂ per km
- ✈️ Flight travel: 0.25 kg CO₂ per km
- ⚡ Electricity consumption: 0.80 kg CO₂ per kWh
- 🥗 Vegetarian meal: 0.50 kg CO₂ per meal
- 🥩 Non-vegetarian meal: 2.00 kg CO₂ per meal

### PlanetPulse Key Architecture & Decision Points:
1. Zero-Authentication: Identity is partitioned using client device keys (X-Device-Id header), defaulting to "default" so anyone can use it instantly without passwords or barriers.
2. DP1 (The Nudge & Rollover): When users exceed their weekly budget, PlanetPulse provides constructive warnings and an optional "Rollover Compensation" feature that deducts current week's excess from next week's budget to maintain long-term climate balance.
3. DP2 (Absurd Input Handling): Real-world physical threshold checks (e.g. car > 2000 km, flight > 15000 km, electricity > 500 kWh). If confirmed by the user, outlier entries are flagged and isolated from weekly budget calculations by default to prevent chart skewing.
4. DP3 (Week Boundary & Pacing): Fixed ISO-8601 calendar week (Monday 00:00 to Sunday 23:59). Pacing analyzes budget consumption % versus elapsed time % ("X days remaining").

{telemetry_context}

Always stay in character as Leafy. Provide clear, direct, and actionable answers. When asked about user's carbon footprint, reference their active telemetry above if provided.
"""


def format_user_telemetry(db: Optional[Session], device_id: str) -> str:
    """
    Extracts and formats live weekly carbon telemetry for device_id.
    """
    if not db:
        return "[No live telemetry database session available.]"

    try:
        # Category breakdown
        category_rows = activity_repo.get_category_aggregates(db=db, device_id=device_id)
        total_co2 = round(sum(item["co2_kg"] for item in category_rows), 2)
        total_activities = sum(item["activity_count"] for item in category_rows)

        # Weekly totals & pacing
        week_start, week_end = get_current_iso_week_bounds()
        week_totals = activity_repo.get_week_co2_totals(
            db=db,
            device_id=device_id,
            week_start=week_start,
            week_end=week_end,
        )

        target_record = target_repo.get_target(db=db, device_id=device_id)
        target_kg = target_record.target_kg if target_record else 30.0
        rollover_debt_kg = target_record.rollover_debt_kg if target_record else 0.0

        pacing_info = compute_week_pacing(
            week_co2_kg=week_totals["unflagged"],
            target_kg=target_kg,
            rollover_debt_kg=rollover_debt_kg,
        )

        # Recent activities
        recent_records = activity_repo.get_activities(db=db, device_id=device_id, limit=5)
        recent_str_list = []
        for r in recent_records:
            unit = ACTIVITY_UNITS.get(r.activity_type, "units")
            recent_str_list.append(
                f"- {r.activity_type}: {r.quantity} {unit} = {r.co2_kg:.2f} kg CO2 ({r.logged_at.strftime('%Y-%m-%d %H:%M')})"
            )
        recent_str = "\n".join(recent_str_list) if recent_str_list else "No activities logged yet."

        categories_summary = ", ".join(
            [f"{c['activity_type']}: {c['co2_kg']} kg ({c['activity_count']} entries)" for c in category_rows]
        ) or "None"

        return f"""### Active User Progress Context (Live Telemetry):
- Active Device ID: {device_id}
- Calendar Week: {pacing_info['week_start'].strftime('%Y-%m-%d')} to {pacing_info['week_end'].strftime('%Y-%m-%d')} (Day {pacing_info['day_of_week']}/7, {pacing_info['days_remaining']} days remaining)
- Weekly Target: {target_kg:.1f} kg CO₂ (Rollover Debt: {rollover_debt_kg:.1f} kg CO₂, Effective Budget: {pacing_info['effective_target_kg']:.1f} kg CO₂)
- Current Week's Emissions: {week_totals['unflagged']:.2f} kg CO₂ ({pacing_info['progress_percent']:.1f}% of budget consumed)
- Flagged Outlier CO₂ (Isolated): {week_totals['flagged']:.2f} kg CO₂
- Budget Pacing Status: {pacing_info['pacing_status']} ({pacing_info['pacing_message']})
- All-Time Total Footprint: {total_co2:.2f} kg CO₂ across {total_activities} logged activities
- Category Breakdown: {categories_summary}
- Recent Logged Activities:
{recent_str}
"""
    except Exception as e:
        logger.warning(f"Could not format user telemetry for Leafy: {e}")
        return f"[Live telemetry context could not be loaded: {str(e)}]"


def generate_chat_response(
    messages: List[ChatMessage],
    db: Optional[Session] = None,
    device_id: str = "default",
    include_progress: bool = True,
) -> tuple[str, str]:
    """
    Invokes ChatMistralAI with domain knowledge and user's active carbon telemetry.
    Returns (reply_text, model_name).
    """
    model_name = MISTRAL_MODEL or "open-mistral-7b"


    # Check API key
    if not MISTRAL_API_KEY:
        missing_key_reply = (
            "🌿 **Hi, I'm Leafy!** I'm your PlanetPulse AI climate companion.\n\n"
            "To activate my Mistral AI intelligence, please set your `MISTRAL_API_KEY` in the `backend/.env` file:\n"
            "```env\nMISTRAL_API_KEY=your_mistral_api_key_here\n```\n"
            "Once configured, restart the backend server and I'll be ready to analyze your weekly carbon budget and provide tailored climate advice!"
        )
        return missing_key_reply, model_name

    # Build telemetry context
    telemetry_context = ""
    if include_progress and db:
        telemetry_context = format_user_telemetry(db=db, device_id=device_id)

    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(telemetry_context=telemetry_context)

    # Convert messages
    langchain_messages = [SystemMessage(content=system_prompt)]
    for msg in messages:
        if msg.role == "user":
            langchain_messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            langchain_messages.append(AIMessage(content=msg.content))
        elif msg.role == "system":
            langchain_messages.append(SystemMessage(content=msg.content))

    try:
        llm = ChatMistralAI(
            model=model_name,
            temperature=0.3,
            max_retries=2,
            mistral_api_key=MISTRAL_API_KEY,
        )
        ai_msg = llm.invoke(langchain_messages)
        reply = ai_msg.content if isinstance(ai_msg.content, str) else str(ai_msg.content)
        return reply, model_name
    except Exception as exc:
        logger.error(f"Error calling Mistral AI: {exc}", exc_info=True)
        error_msg = f"🌿 **Leafy Encountered an Issue:**\n\nI couldn't reach the Mistral AI API ({str(exc)}). Please check that your `MISTRAL_API_KEY` is valid and has sufficient quota."
        return error_msg, model_name
