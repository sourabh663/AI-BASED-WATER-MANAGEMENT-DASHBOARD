from fastapi import APIRouter, Query
from typing import Optional
from app.services.analytics_service import analytics_service
from app.schemas.schemas import (
    ConsumptionAnalyticsResponse,
    SectorAnalyticsResponse,
    ZoneAnalyticsResponse,
    EnvironmentalAnalyticsResponse
)

router = APIRouter()

@router.get("/consumption", response_model=ConsumptionAnalyticsResponse, tags=["Analytics"])
def get_consumption_analytics(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    zone: Optional[str] = Query(None, description="Filter by Zone or 'All'"),
    sector: Optional[str] = Query(None, description="Filter by Sector or 'All'")
):
    """
    Returns daily, weekly, and monthly trends, day-of-week patterns,
    distribution histogram, peak and lowest demand records.
    """
    return analytics_service.get_consumption_analytics(
        start_date=start_date,
        end_date=end_date,
        zone=zone,
        sector=sector
    )

@router.get("/sectors", response_model=SectorAnalyticsResponse, tags=["Analytics"])
def get_sector_analytics(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    zone: Optional[str] = Query(None, description="Filter by Zone or 'All'")
):
    """
    Returns breakdown across the 5 sectors: Residential, Commercial,
    Industrial, Agriculture, and Institutional with per-capita metrics.
    """
    return analytics_service.get_sector_analytics(
        start_date=start_date,
        end_date=end_date,
        zone=zone
    )

@router.get("/zones", response_model=ZoneAnalyticsResponse, tags=["Analytics"])
def get_zone_analytics(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    sector: Optional[str] = Query(None, description="Filter by Sector or 'All'")
):
    """
    Returns individual zone cards for Zone A through Zone E,
    with demand status (Normal, Moderate, High, Critical) and documented rules.
    """
    return analytics_service.get_zone_analytics(
        start_date=start_date,
        end_date=end_date,
        sector=sector
    )

@router.get("/environment", response_model=EnvironmentalAnalyticsResponse, tags=["Analytics"])
def get_environmental_analytics(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    zone: Optional[str] = Query(None, description="Filter by Zone or 'All'"),
    sector: Optional[str] = Query(None, description="Filter by Sector or 'All'")
):
    """
    Returns correlation matrix, scatter plots, linear regression trends,
    and explanatory notes distinguishing correlation from causation.
    """
    return analytics_service.get_environmental_analytics(
        start_date=start_date,
        end_date=end_date,
        zone=zone,
        sector=sector
    )
