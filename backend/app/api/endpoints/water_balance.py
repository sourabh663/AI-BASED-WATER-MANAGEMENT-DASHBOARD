from fastapi import APIRouter, Query
from typing import Optional
from app.services.water_balance_service import water_balance_service
from app.schemas.schemas import WaterBalanceResponse

router = APIRouter()

@router.get("/water-balance", response_model=WaterBalanceResponse, tags=["Water Balance"])
def get_water_balance(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    zone: Optional[str] = Query(None, description="Filter by Zone"),
    sector: Optional[str] = Query(None, description="Filter by Sector")
):
    """
    Computes municipal water balance comparing allocated supply, recorded consumption,
    and predicted demand. Identifies surpluses and deficits with documented calculations.
    """
    return water_balance_service.get_water_balance(
        start_date=start_date,
        end_date=end_date,
        zone=zone,
        sector=sector
    )
