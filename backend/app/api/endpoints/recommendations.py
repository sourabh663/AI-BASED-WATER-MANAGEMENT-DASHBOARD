from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import RecommendationStatusRecord
from app.services.recommendation_engine import recommendation_engine
from app.schemas.schemas import RecommendationResponse

router = APIRouter()

@router.get("", response_model=RecommendationResponse, tags=["AI Recommendations"])
def get_recommendations(db: Session = Depends(get_db)):
    """
    Returns prioritized operational water management recommendations
    synthesized from actual threshold breaches, reservoir metrics, and ML forecasts.
    Incorporates persistent user review statuses from database.
    """
    recs = recommendation_engine.generate_recommendations()
    # Check DB statuses
    statuses = {r.recommendation_id: r.status for r in db.query(RecommendationStatusRecord).all()}
    for item in recs["recommendations"]:
        if item["id"] in statuses:
            item["status"] = statuses[item["id"]]
        else:
            item["status"] = "ACTIVE"
    return recs

@router.post("/{rec_id}/status", tags=["AI Recommendations"])
def update_recommendation_status(
    rec_id: str,
    status: str = Query(..., description="ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED"),
    db: Session = Depends(get_db)
):
    """
    Updates operational action status for an AI recommendation (e.g. Acknowledged, Resolved, Dismissed).
    """
    valid_statuses = ["ACTIVE", "ACKNOWLEDGED", "RESOLVED", "DISMISSED"]
    norm = status.upper()
    if norm not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid_statuses}")

    existing = db.query(RecommendationStatusRecord).filter(
        RecommendationStatusRecord.recommendation_id == rec_id
    ).first()

    if existing:
        existing.status = norm
    else:
        new_rec = RecommendationStatusRecord(recommendation_id=rec_id, status=norm)
        db.add(new_rec)
    db.commit()
    return {"status": "success", "recommendation_id": rec_id, "new_status": norm}
