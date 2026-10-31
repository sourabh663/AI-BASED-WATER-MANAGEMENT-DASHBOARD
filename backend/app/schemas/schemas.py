from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Prediction Schemas ---
class PredictionInput(BaseModel):
    zone: str = Field(..., description="Zone A, Zone B, Zone C, Zone D, or Zone E")
    sector: str = Field(..., description="Agriculture, Commercial, Industrial, Institutional, or Residential")
    date: Optional[str] = Field(default="2026-12-31", description="Prediction target date (YYYY-MM-DD)")
    population: Optional[int] = Field(default=None, description="Population of the zone/sector")
    temperature_c: float = Field(..., description="Temperature in Celsius")
    rainfall_mm: float = Field(..., ge=0.0, description="Rainfall in mm")
    humidity_percent: float = Field(..., ge=0.0, le=100.0, description="Humidity percentage")
    reservoir_level_percent: float = Field(..., ge=0.0, le=100.0, description="Reservoir level percentage")
    water_supply_mld: float = Field(..., ge=0.0, description="Water supply in MLD")
    previous_day_consumption_mld: float = Field(..., ge=0.0, description="Previous day consumption in MLD")
    water_consumption_mld: float = Field(..., ge=0.0, description="Current day consumption in MLD")
    model_override: Optional[str] = Field(default=None, description="Optionally force 'xgboost' or 'random_forest'")

class PredictionResult(BaseModel):
    predicted_demand_mld: float
    confidence_interval_low: float
    confidence_interval_high: float
    zone: str
    sector: str
    prediction_date: str
    model_used: str
    status: str # NORMAL, MODERATE, HIGH, CRITICAL
    status_reason: str
    historical_avg_mld: float
    percentage_change_vs_historical: float
    timestamp: str
    inputs_summary: Dict[str, Any]

class BatchPredictionRequest(BaseModel):
    date: Optional[str] = "2026-12-31"
    temperature_c: Optional[float] = 28.5
    rainfall_mm: Optional[float] = 0.0
    humidity_percent: Optional[float] = 60.0
    reservoir_level_percent: Optional[float] = 65.0
    model_override: Optional[str] = None
    custom_records: Optional[List[PredictionInput]] = None

class BatchPredictionItem(BaseModel):
    zone: str
    sector: str
    predicted_demand_mld: float
    water_supply_mld: float
    status: str
    deficit_or_surplus_mld: float
    historical_avg_mld: float

class BatchPredictionResponse(BaseModel):
    total_city_predicted_demand_mld: float
    total_city_water_supply_mld: float
    city_balance_mld: float
    high_demand_zones: List[str]
    critical_count: int
    high_count: int
    model_used: str
    timestamp: str
    predictions: List[BatchPredictionItem]

class PredictionHistoryItem(BaseModel):
    id: int
    prediction_date: Optional[str]
    zone: str
    sector: str
    temperature_c: float
    water_consumption_mld: float
    water_supply_mld: float
    predicted_demand_mld: float
    model_used: str
    status: str
    created_at: str

# --- Model Performance Schemas ---
class MetricItem(BaseModel):
    mae: float
    rmse: float
    r2: float
    training_time_seconds: Optional[float] = 0.0

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float

class ModelPerformanceResponse(BaseModel):
    active_model: str
    available_models: List[str]
    train_size: int
    test_size: int
    total_size: int
    active_metrics: MetricItem
    reference_metrics: MetricItem # From presentation slide 7
    comparison: Dict[str, MetricItem] # Baseline, Random Forest, XGBoost
    feature_importances: List[FeatureImportanceItem]
    actual_vs_predicted_sample: List[Dict[str, Any]]
    residual_distribution: List[Dict[str, Any]]
    trained_at: str

# --- Dashboard & KPI Schemas ---
class KPISummary(BaseModel):
    total_water_consumption_mld: float
    total_water_supply_mld: float
    predicted_next_day_demand_mld: float
    average_reservoir_level_percent: float
    highest_consumption_zone: str
    highest_consumption_zone_mld: float
    highest_consumption_sector: str
    highest_consumption_sector_mld: float
    net_water_balance_mld: float # supply - consumption
    water_loss_estimate_percent: float

class DashboardSummaryResponse(BaseModel):
    kpis: KPISummary
    consumption_trend_daily: List[Dict[str, Any]]
    actual_vs_predicted_trend: List[Dict[str, Any]]
    sector_distribution: List[Dict[str, Any]]
    zone_comparison: List[Dict[str, Any]]
    supply_vs_consumption: List[Dict[str, Any]]
    reservoir_level_trend: List[Dict[str, Any]]
    high_demand_alerts: List[Dict[str, Any]]
    recent_anomalies: List[Dict[str, Any]]
    dataset_info: Dict[str, Any]

# --- Analytics Schemas ---
class ConsumptionAnalyticsResponse(BaseModel):
    daily_trends: List[Dict[str, Any]]
    weekly_trends: List[Dict[str, Any]]
    monthly_trends: List[Dict[str, Any]]
    day_of_week_analysis: List[Dict[str, Any]]
    peak_demand_records: List[Dict[str, Any]]
    lowest_demand_records: List[Dict[str, Any]]
    distribution_histogram: List[Dict[str, Any]]
    summary_metrics: Dict[str, Any]

class SectorAnalyticsResponse(BaseModel):
    sectors_breakdown: List[Dict[str, Any]]
    highest_consuming_sector: str
    lowest_consuming_sector: str
    daily_sector_trends: List[Dict[str, Any]]
    sector_per_capita: List[Dict[str, Any]]

class ZoneAnalyticsResponse(BaseModel):
    zones: List[Dict[str, Any]]
    high_demand_zones_identified: List[str]
    threshold_documentation: Dict[str, Any]
    zone_comparison_metrics: List[Dict[str, Any]]

class EnvironmentalAnalyticsResponse(BaseModel):
    correlation_matrix: Dict[str, Dict[str, float]]
    scatter_temp_vs_consumption: List[Dict[str, Any]]
    scatter_rainfall_vs_consumption: List[Dict[str, Any]]
    scatter_humidity_vs_consumption: List[Dict[str, Any]]
    scatter_reservoir_vs_demand: List[Dict[str, Any]]
    regression_slopes: Dict[str, float]
    analytical_insights: List[Dict[str, str]]

# --- Recommendation Schemas ---
class RecommendationItem(BaseModel):
    id: str
    title: str
    priority: str # CRITICAL, HIGH, MEDIUM, LOW
    zone_or_sector: str
    category: str # SUPPLY_ALLOCATION, LEAKAGE_MONITORING, PEAK_MANAGEMENT, RESERVOIR_CONSERVATION, EFFICIENCY
    type: str # "ML-Generated Insight" | "Rule-Based Threshold"
    reason: str
    supporting_data: str
    suggested_action: str
    estimated_impact: Optional[str] = None
    status: Optional[str] = "ACTIVE"
    created_at: str

class RecommendationResponse(BaseModel):
    total_recommendations: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    recommendations: List[RecommendationItem]

# --- Data Management Schemas ---
class DatasetOverviewResponse(BaseModel):
    filename: str
    row_count: int
    column_count: int
    columns: List[Dict[str, str]]
    date_range_start: str
    date_range_end: str
    total_days: int
    zones: List[str]
    sectors: List[str]
    missing_values_count: int
    duplicate_rows_count: int
    is_original: bool

class PaginatedRecordsResponse(BaseModel):
    total_records: int
    page: int
    page_size: int
    total_pages: int
    records: List[Dict[str, Any]]

# --- Phase 3 Advanced Module Schemas ---

# 1. Anomaly Detection Schemas
class AnomalyItem(BaseModel):
    id: str
    date: str
    zone: str
    sector: str
    actual_consumption_mld: float
    expected_consumption_mld: float
    deviation_mld: float
    percentage_deviation: float
    anomaly_score: float
    severity: str # CRITICAL, HIGH, ELEVATED
    method: str # Isolation Forest & Z-Score
    explanation: str

class AnomalyResponse(BaseModel):
    total_anomalies: int
    critical_count: int
    high_count: int
    elevated_count: int
    contamination_rate: float
    anomalies: List[AnomalyItem]
    zone_distribution: Dict[str, int]
    sector_distribution: Dict[str, int]

# 2. Water Balance Monitoring Schemas
class WaterBalanceZoneItem(BaseModel):
    zone: str
    water_supply_mld: float
    actual_consumption_mld: float
    predicted_demand_mld: float
    gap_mld: float # supply - consumption
    gap_predicted_mld: float # supply - predicted
    utilization_rate: float
    balance_status: str # SURPLUS, DEFICIT, TIGHT_BUFFER
    population: int

class WaterBalanceSectorItem(BaseModel):
    sector: str
    water_supply_mld: float
    actual_consumption_mld: float
    gap_mld: float
    percentage_share: float

class WaterBalanceResponse(BaseModel):
    total_water_supply_mld: float
    total_water_consumption_mld: float
    total_predicted_demand_mld: float
    net_gap_mld: float
    net_gap_percentage: float
    overall_status: str # SURPLUS, DEFICIT, BALANCED
    explanation: str
    zones: List[WaterBalanceZoneItem]
    sectors: List[WaterBalanceSectorItem]
    daily_balance_trend: List[Dict[str, Any]]
    surplus_zones_count: int
    deficit_zones_count: int

# 3. AI Water Assistant Schemas
class ChatMessageRequest(BaseModel):
    message: str = Field(..., description="User question to the municipal AI assistant")
    context_zone: Optional[str] = "All"
    context_sector: Optional[str] = "All"

class ChatMessageResponse(BaseModel):
    reply: str
    suggested_followups: List[str]
    sources: List[str]
    metrics_referenced: Dict[str, Any]
    timestamp: str

# 4. Report Generation Schemas
class ReportGenerateRequest(BaseModel):
    title: Optional[str] = "Municipal Water Resources Comprehensive Report"
    include_sections: Optional[List[str]] = [
        "executive_summary", "consumption_analytics", "zone_monitoring",
        "sector_breakdown", "ml_forecasts", "model_performance", "recommendations"
    ]
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    zone: Optional[str] = "All"
    sector: Optional[str] = "All"

class ReportGenerateResponse(BaseModel):
    report_id: str
    title: str
    generated_at: str
    period_start: str
    period_end: str
    zone_filter: str
    sector_filter: str
    executive_summary: Dict[str, Any]
    consumption_highlights: Dict[str, Any]
    zone_metrics: List[Dict[str, Any]]
    sector_metrics: List[Dict[str, Any]]
    forecast_summary: Dict[str, Any]
    model_accuracy: Dict[str, Any]
    priority_recommendations: List[Dict[str, Any]]

# 5. Notification Center Schemas
class NotificationItem(BaseModel):
    id: int
    title: str
    message: str
    priority: str # CRITICAL, HIGH, MEDIUM, INFO
    category: str
    zone: Optional[str] = None
    is_read: bool
    created_at: str

class NotificationResponse(BaseModel):
    total_count: int
    unread_count: int
    critical_count: int
    notifications: List[NotificationItem]

# 6. Data Quality Schemas
class DataQualityResponse(BaseModel):
    overall_quality_score: float # 0 - 100
    completeness_score: float
    uniqueness_score: float
    validity_score: float
    timeliness_score: float
    total_records: int
    valid_records: int
    missing_cells: int
    duplicate_rows: int
    zero_or_negative_values: int
    outlier_count: int
    quality_grade: str # A+, A, B, C
    attribute_breakdown: List[Dict[str, Any]]
