from fastapi import APIRouter, Query
from typing import Optional
from app.services.anomaly_service import anomaly_service
from app.schemas.schemas import AnomalyResponse

router = APIRouter()

@router.get("/anomalies", response_model=AnomalyResponse, tags=["Anomaly Detection"])
def get_consumption_anomalies(
    contamination: float = Query(0.03, ge=0.01, le=0.15, description="Expected contamination rate for Isolation Forest"),
    zone: Optional[str] = Query(None, description="Filter by Zone"),
    sector: Optional[str] = Query(None, description="Filter by Sector"),
    start_date: Optional[str] = Query(None, description="Start Date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End Date (YYYY-MM-DD)")
):
    """
    Detects unusual municipal consumption patterns using Isolation Forest and statistical Z-score
    deviation analysis across the historical observation records.
    """
    return anomaly_service.detect_anomalies(
        contamination=contamination,
        zone=zone,
        sector=sector,
        start_date=start_date,
        end_date=end_date
    )
