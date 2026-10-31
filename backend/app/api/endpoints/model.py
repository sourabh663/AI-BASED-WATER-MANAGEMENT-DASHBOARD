from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import json

from app.database.session import get_db
from app.database.models import ModelRecord
from app.schemas.schemas import ModelPerformanceResponse
from app.ml.pipeline import ml_pipeline

router = APIRouter()

@router.get("/performance", response_model=ModelPerformanceResponse, tags=["Model Performance"])
def get_model_performance():
    """
    Returns complete independently calculated evaluation metrics (MAE, RMSE, R²),
    model comparison against persistence baseline, feature importance rankings,
    actual vs predicted test data, and residual distribution histogram.
    """
    try:
        return ml_pipeline.get_performance_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch model performance: {str(e)}")

@router.post("/train", tags=["Model Performance"])
def retrain_model(db: Session = Depends(get_db)):
    """
    Triggers chronological retraining of Random Forest, XGBoost, and Baseline models.
    Updates active model records in SQLite database.
    """
    try:
        summary = ml_pipeline.train_models()
        
        # Save evaluation entry in database
        active_metric = summary["active_metrics"]
        rec = ModelRecord(
            model_name=summary["active_model"],
            model_type="xgboost" if "xgboost" in summary["active_model"].lower() else "random_forest",
            version="1.1.0",
            is_active=True,
            train_size=summary["train_size"],
            test_size=summary["test_size"],
            mae=active_metric["mae"],
            rmse=active_metric["rmse"],
            r2=active_metric["r2"],
            feature_importance_json=json.dumps(summary["feature_importances"][:10]),
            hyperparameters_json=json.dumps({"n_estimators": 160, "split": "chronological_80_20"})
        )
        db.add(rec)
        db.commit()

        return {
            "status": "success",
            "message": "Models successfully retrained on current dataset.",
            "performance": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model retraining failed: {str(e)}")

@router.get("/versions", tags=["Model Performance"])
def get_model_versions(db: Session = Depends(get_db)):
    """
    Returns audit trail of trained model versions, performance metrics, and training timestamps from SQLite.
    """
    records = db.query(ModelRecord).order_by(ModelRecord.id.desc()).limit(15).all()
    if not records:
        # Return currently active runtime model as initial version
        summary = ml_pipeline.get_performance_summary()
        return [{
            "id": 1,
            "model_name": summary["active_model"],
            "version": "1.0.0",
            "mae": summary["active_metrics"]["mae"],
            "rmse": summary["active_metrics"]["rmse"],
            "r2": summary["active_metrics"]["r2"],
            "trained_at": summary["trained_at"],
            "is_active": True
        }]
    return [
        {
            "id": r.id,
            "model_name": r.model_name,
            "version": r.version,
            "mae": r.mae,
            "rmse": r.rmse,
            "r2": r.r2,
            "trained_at": r.trained_at.strftime("%Y-%m-%d %H:%M:%S") if r.trained_at else "",
            "is_active": r.is_active
        }
        for r in records
    ]
