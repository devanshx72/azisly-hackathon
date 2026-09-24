# PlanetPulse — Decision Points (DECISIONS.md)

This document records the architectural and product decisions for the three core Decision Points required by the Hackathon brief (Track 2 — Real-World AI Products, Climate Tech brief).

---

## DP1 — The Nudge: Behavior when Weekly Target is Crossed

### Decision
When a user crosses their weekly CO₂ target, the application displays a prominent, constructive alert banner and status badge rather than shaming or blocking the user. In addition, the user is offered a **rollover compensation option** allowing them to carry forward the excess footprint as a deduction from next week's budget, alongside actionable reduction tips.

### Reasoning
Psychological research in behavioral science and climate communication shows that shame or punitive mechanisms cause cognitive dissonance, leading users to abandon tracking apps altogether. Conversely, blocking the user prevents them from logging real-world emissions, violating data integrity and defeating the entire premise of an honest carbon tracker. Providing a clear, non-judgmental alert paired with an opt-in rollover mechanism treats the carbon budget like a real financial ledger: acknowledging overage honestly, keeping the user engaged, and providing a realistic path to redeem and balance their emissions in the subsequent cycle.

---

## DP2 — Absurd Input: Handling Unrealistic Quantities

### Decision
Inputs exceeding realistic physical thresholds for a single entry (e.g., >2,000 km for a car trip, >1,000 km for bus, >20,000 km for flights, >500 kWh for electricity, >10 meals) trigger an inline confirmation warning (*"That's an unusually large entry — did you mean this?"*). If the user confirms, the entry is saved with `flagged = true`. In the UI, flagged entries display an "Outlier" badge and are **excluded from the weekly target calculation by default**, with a toggle to inspect them.

### Reasoning
Silently clamping or capping values produces stored data that differs from what the user entered, degrading trust and obfuscating potential data issues. Outright rejection risks preventing legitimate extreme edge cases (e.g., an exceptional cross-country rally or commercial vehicle shift). Flagging with user confirmation preserves data truthfulness, prevents accidental typos from wrecking weekly visualizations and triggering false alarms, and gives full transparency over unusual records without restricting user autonomy.

---

## DP3 — The Week: Week Boundary & Mid-Week Progress Display

### Decision
A week is defined as a fixed **Monday 00:00 to Sunday 23:59** calendar week (ISO-8601). Mid-week progress is presented as a visual progress bar accompanied by a **daily pacing indicator and "X days left" status** (comparing percentage of CO₂ budget consumed against the percentage of the week elapsed).

### Reasoning
Rolling 7-day windows are difficult for users to reason about because the measurement window shifts every day, obscuring when emissions occurred and making budget planning unpredictable. A Monday-start calendar week matches standard human mental models for weekly planning (workdays vs. weekend). Furthermore, raw percentages without temporal context are misleading: utilizing 70% of a carbon budget by Tuesday is an urgent warning, whereas utilizing 70% by Saturday evening indicates disciplined restraint. Pairing the progress bar with a days-remaining pace indicator delivers immediate, intuitive urgency and clarity.
