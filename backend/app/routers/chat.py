from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_device_id
from ..schemas import ChatRequest, ChatResponse
from ..services.chat_service import generate_chat_response

router = APIRouter(prefix="/api/chat", tags=["Chatbot"])


@router.post(
    "",
    response_model=ChatResponse,
    summary="Chat with Leafy, the PlanetPulse AI climate companion",
)
def chat_with_leafy(
    payload: ChatRequest,
    device_id: str = Depends(get_device_id),
    db: Session = Depends(get_db),
):
    """
    Conversational assistant endpoint powered by LangChain and Mistral AI.
    
    Leafy is aware of PlanetPulse's carbon calculations (car, bus, flight, electricity, meals),
    decision points (DP1 rollover, DP2 outlier isolation, DP3 pacing), and has real-time
    context of the active user's weekly carbon emissions progress and target budget.
    """
    reply, model = generate_chat_response(
        messages=payload.messages,
        db=db,
        device_id=device_id,
        include_progress=payload.include_progress,
    )
    return ChatResponse(reply=reply, model=model)
