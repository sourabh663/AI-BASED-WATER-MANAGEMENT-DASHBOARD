from fastapi import APIRouter, Query
from typing import Optional
from app.services.analytics_service import analytics_service
from app.schemas.schemas import DashboardSummaryResponse

router = APIRouter()

@router.get("/summary", response_model=DashboardSummaryResponse, tags=["Executive Dashboard"])
def get_dashboard_summary(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    zone: Optional[str] = Query(None, description="Filter by Zone A, B, C, D, E or 'All'"),
    sector: Optional[str] = Query(None, description="Filter by Sector or 'All'")
):
    """
    Returns executive KPIs, daily consumption trends, actual vs predicted demand,
    zone comparisons, sector breakdowns, reservoir trends, and real-time alerts.
    """
    data = analytics_service.get_dashboard_summary(
        start_date=start_date,
        end_date=end_date,
        zone=zone,
        sector=sector
    )
    return data
