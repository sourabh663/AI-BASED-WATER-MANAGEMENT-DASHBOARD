from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.database.models import PredictionHistory
from app.schemas.schemas import (
    PredictionInput,
    PredictionResult,
    BatchPredictionRequest,
    BatchPredictionResponse,
    PredictionHistoryItem
)
from app.ml.pipeline import ml_pipeline

router = APIRouter()

@router.get("/model-info", tags=["AI Demand Prediction"])
def get_model_info():
    """
    Returns metadata about active ML models, feature importance, and performance status.
    """
    return {
        "active_model": ml_pipeline.active_model_name,
        "available_models": ["XGBoost Regressor", "Random Forest Regressor", "Persistence Baseline"],
        "trained_at": ml_pipeline.trained_at,
        "train_size": ml_pipeline.train_size,
        "test_size": ml_pipeline.test_size,
        "total_records": ml_pipeline.total_size,
        "features_count": len(ml_pipeline.feature_columns),
        "features": ml_pipeline.feature_columns,
        "top_features": ml_pipeline.feature_importances[:10],
        "active_metrics": ml_pipeline.metrics.get(ml_pipeline.active_model_name, {})
    }

@router.post("/predict", response_model=PredictionResult, tags=["AI Demand Prediction"])
def predict_water_demand(
    payload: PredictionInput,
    db: Session = Depends(get_db)
):
    """
    Predict next-day municipal water demand for a specific zone and sector.
    Saves prediction record into database history.
    """
    try:
        res = ml_pipeline.predict_single(
            data=payload.model_dump(),
            model_override=payload.model_override
        )

        # Log into SQLite DB
        hist_entry = PredictionHistory(
            prediction_date=payload.date,
            zone=payload.zone,
            sector=payload.sector,
            population=payload.population or 500000,
            temperature_c=payload.temperature_c,
            rainfall_mm=payload.rainfall_mm,
            humidity_percent=payload.humidity_percent,
            reservoir_level_percent=payload.reservoir_level_percent,
            water_supply_mld=payload.water_supply_mld,
            previous_day_consumption_mld=payload.previous_day_consumption_mld,
            water_consumption_mld=payload.water_consumption_mld,
            predicted_demand_mld=res["predicted_demand_mld"],
            model_used=res["model_used"],
            status=res["status"],
            historical_avg_mld=res["historical_avg_mld"],
            percent_diff_vs_hist=res["percentage_change_vs_historical"]
        )
        db.add(hist_entry)
        db.commit()

        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.post("/batch", response_model=BatchPredictionResponse, tags=["AI Demand Prediction"])
def predict_batch_demand(payload: BatchPredictionRequest):
    """
    Performs city-wide batch predictions across all 5 zones and 5 sectors (25 combinations)
    to facilitate municipal water allocation and balance calculations.
    """
    try:
        res = ml_pipeline.predict_batch_all(payload.model_dump())
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")

@router.get("/history", response_model=List[PredictionHistoryItem], tags=["AI Demand Prediction"])
def get_prediction_history(
    limit: int = Query(30, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Fetches logged historical predictions stored in SQLite.
    """
    records = db.query(PredictionHistory).order_by(PredictionHistory.id.desc()).limit(limit).all()
    return [
        PredictionHistoryItem(
            id=r.id,
            prediction_date=r.prediction_date,
            zone=r.zone,
            sector=r.sector,
            temperature_c=r.temperature_c,
            water_consumption_mld=r.water_consumption_mld,
            water_supply_mld=r.water_supply_mld,
            predicted_demand_mld=r.predicted_demand_mld,
            model_used=r.model_used,
            status=r.status,
            created_at=r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else ""
        )
        for r in records
    ]
