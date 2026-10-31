import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from app.database.session import Base

class DatasetMeta(Base):
    __tablename__ = "dataset_meta"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    row_count = Column(Integer, nullable=False)
    column_count = Column(Integer, nullable=False)
    date_range_start = Column(String(50), nullable=True)
    date_range_end = Column(String(50), nullable=True)
    zones_list = Column(String(255), nullable=True)
    sectors_list = Column(String(255), nullable=True)
    missing_values_count = Column(Integer, default=0)
    duplicate_rows_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

class ModelRecord(Base):
    __tablename__ = "model_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False) # e.g. "XGBoost Regressor"
    model_type = Column(String(50), nullable=False) # "xgboost", "random_forest", "baseline"
    version = Column(String(20), default="1.0.0")
    is_active = Column(Boolean, default=False)
    train_size = Column(Integer, nullable=False)
    test_size = Column(Integer, nullable=False)
    mae = Column(Float, nullable=False)
    rmse = Column(Float, nullable=False)
    r2 = Column(Float, nullable=False)
    feature_importance_json = Column(Text, nullable=True)
    hyperparameters_json = Column(Text, nullable=True)
    trained_at = Column(DateTime, default=datetime.datetime.utcnow)

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    prediction_date = Column(String(50), nullable=True)
    zone = Column(String(50), nullable=False)
    sector = Column(String(50), nullable=False)
    population = Column(Integer, nullable=False)
    temperature_c = Column(Float, nullable=False)
    rainfall_mm = Column(Float, nullable=False)
    humidity_percent = Column(Float, nullable=False)
    reservoir_level_percent = Column(Float, nullable=False)
    water_supply_mld = Column(Float, nullable=False)
    previous_day_consumption_mld = Column(Float, nullable=False)
    water_consumption_mld = Column(Float, nullable=False)
    predicted_demand_mld = Column(Float, nullable=False)
    model_used = Column(String(100), nullable=False)
    status = Column(String(50), default="NORMAL") # NORMAL, MODERATE, HIGH, CRITICAL
    historical_avg_mld = Column(Float, nullable=True)
    percent_diff_vs_hist = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String(100), unique=True, nullable=False)
    setting_value = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class NotificationRecord(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    priority = Column(String(50), default="INFO") # CRITICAL, HIGH, MEDIUM, INFO
    category = Column(String(100), default="SYSTEM") # DEMAND_SURGE, RESERVOIR_ALERT, ANOMALY, MODEL_TRAIN, ALLOCATION
    zone = Column(String(50), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class RecommendationStatusRecord(Base):
    __tablename__ = "recommendation_statuses"

    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(String(100), unique=True, nullable=False)
    status = Column(String(50), default="ACTIVE") # ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class ReportRecord(Base):
    __tablename__ = "report_logs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    report_type = Column(String(100), default="EXECUTIVE_SUMMARY")
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    zone_filter = Column(String(50), default="All")
    sector_filter = Column(String(50), default="All")
    summary_json = Column(Text, nullable=True)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
