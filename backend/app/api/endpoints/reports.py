from fastapi import APIRouter, Query
from typing import Optional
from app.services.report_service import report_service
from app.schemas.schemas import ReportGenerateRequest, ReportGenerateResponse

router = APIRouter()

@router.get("/generate", response_model=ReportGenerateResponse, tags=["Report Generation"])
def generate_report_get(
    title: Optional[str] = Query("Municipal Water Resources Comprehensive Report", description="Report title"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    zone: Optional[str] = Query("All", description="Zone filter"),
    sector: Optional[str] = Query("All", description="Sector filter")
):
    """
    Generates structured municipal water report with executive summary,
    zone/sector breakdowns, ML forecast evaluations, and prioritized recommendations.
    """
    return report_service.generate_report(
        title=title,
        start_date=start_date,
        end_date=end_date,
        zone=zone,
        sector=sector
    )

@router.post("/generate", response_model=ReportGenerateResponse, tags=["Report Generation"])
def generate_report_post(payload: ReportGenerateRequest):
    """
    Generates structured report from JSON payload parameters.
    """
    return report_service.generate_report(
        title=payload.title,
        start_date=payload.start_date,
        end_date=payload.end_date,
        zone=payload.zone,
        sector=payload.sector
    )
