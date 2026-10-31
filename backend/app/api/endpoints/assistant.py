from fastapi import APIRouter
from app.services.assistant_service import assistant_service
from app.schemas.schemas import ChatMessageRequest, ChatMessageResponse

router = APIRouter()

@router.post("/chat", response_model=ChatMessageResponse, tags=["AI Water Assistant"])
def chat_with_assistant(payload: ChatMessageRequest):
    """
    Conversational AI assistant querying live municipal telemetry, ML forecasts,
    and decision-support records to answer operator queries factually.
    """
    return assistant_service.answer_query(
        question=payload.message,
        context_zone=payload.context_zone,
        context_sector=payload.context_sector
    )

@router.get("/suggestions", tags=["AI Water Assistant"])
def get_suggested_questions():
    """
    Returns curated suggested questions for rapid municipal querying.
    """
    return {
        "suggestions": [
            "Which zone consumes the most water?",
            "Which sector has the highest demand?",
            "What is tomorrow's predicted demand?",
            "Which zone needs attention?",
            "What is the average reservoir level?",
            "How has consumption changed over the year?",
            "What recommendations should municipal authorities follow?",
            "Is there a water balance deficit anywhere?"
        ]
    }
