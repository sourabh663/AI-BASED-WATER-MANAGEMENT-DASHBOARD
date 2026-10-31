import shutil
import tempfile
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Query

from app.services.data_service import data_service
from app.schemas.schemas import DatasetOverviewResponse, PaginatedRecordsResponse, DataQualityResponse

router = APIRouter()

@router.get("/quality", response_model=DataQualityResponse, tags=["Data Management"])
def get_dataset_quality():
    """
    Evaluates dataset quality scoring (completeness, uniqueness, validity, timeliness)
    across the active municipal dataset.
    """
    return data_service.get_data_quality_report()

@router.post("/preview", tags=["Data Management"])
async def preview_csv(file: UploadFile = File(...)):
    """
    Inspects an uploaded CSV file without committing, returning schema validity,
    row counts, and 5 sample rows for preview.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files (.csv) are accepted.")

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = Path(tmp.name)

        preview = data_service.preview_uploaded_csv(tmp_path, file.filename)
        tmp_path.unlink(missing_ok=True)
        return preview
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Preview failed: {str(e)}")

@router.get("/overview", response_model=DatasetOverviewResponse, tags=["Data Management"])
def get_dataset_overview():
    """
    Returns high-level statistics of the active dataset: row/column count,
    missing values, duplicate rows, date range, zones, and schema details.
    """
    return data_service.get_overview()

@router.get("/records", response_model=PaginatedRecordsResponse, tags=["Data Management"])
def get_dataset_records(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=5, le=100),
    search: Optional[str] = Query(None, description="Search zone, sector or date"),
    zone: Optional[str] = Query(None, description="Filter by Zone"),
    sector: Optional[str] = Query(None, description="Filter by Sector"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    sort_by: Optional[str] = Query("Date", description="Column to sort by"),
    sort_asc: bool = Query(False, description="Ascending sort order")
):
    """
    Returns paginated, searchable, and filtered dataset records.
    """
    return data_service.get_records(
        page=page,
        page_size=page_size,
        search=search,
        zone=zone,
        sector=sector,
        start_date=start_date,
        end_date=end_date,
        sort_by=sort_by,
        sort_asc=sort_asc
    )

@router.post("/upload", tags=["Data Management"])
async def upload_csv(file: UploadFile = File(...)):
    """
    Upload a replacement municipal CSV dataset.
    Validates required columns, formats, and re-triggers ML pipeline training.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files (.csv) are accepted.")

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = Path(tmp.name)

        result = data_service.validate_and_save_upload(tmp_path, file.filename)
        tmp_path.unlink(missing_ok=True)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload processing failed: {str(e)}")

@router.post("/reset", tags=["Data Management"])
def reset_dataset():
    """
    Resets the active dataset back to the original 9,075 municipal records.
    """
    return data_service.reset_to_original()
