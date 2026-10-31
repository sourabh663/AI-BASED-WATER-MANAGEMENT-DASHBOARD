export interface KPISummary {
  total_water_consumption_mld: number;
  total_water_supply_mld: number;
  predicted_next_day_demand_mld: number;
  average_reservoir_level_percent: number;
  highest_consumption_zone: string;
  highest_consumption_zone_mld: number;
  highest_consumption_sector: string;
  highest_consumption_sector_mld: number;
  net_water_balance_mld: number;
  water_loss_estimate_percent: number;
}

export interface DashboardSummaryResponse {
  kpis: KPISummary;
  consumption_trend_daily: Array<{
    date: string;
    consumption: number;
    supply: number;
    predicted_demand: number;
    temperature: number;
    reservoir_level: number;
  }>;
  actual_vs_predicted_trend: Array<{
    date: string;
    consumption: number;
    predicted_demand: number;
  }>;
  sector_distribution: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  zone_comparison: Array<{
    zone: string;
    consumption: number;
    supply: number;
    population: number;
    avg_reservoir: number;
    status: 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  }>;
  supply_vs_consumption: Array<{
    zone: string;
    consumption: number;
    supply: number;
  }>;
  reservoir_level_trend: Array<{
    date: string;
    reservoir_level: number;
  }>;
  high_demand_alerts: Array<{
    zone: string;
    status: string;
    message: string;
    consumption_mld: number;
    supply_mld: number;
  }>;
  recent_anomalies: Array<{
    date: string;
    type: string;
    consumption: number;
    supply: number;
    variance_mld: number;
  }>;
  dataset_info: {
    filtered_rows: number;
    total_rows: number;
    date_min: string;
    date_max: string;
  };
}

export interface ConsumptionAnalyticsResponse {
  daily_trends: Array<{
    date: string;
    consumption: number;
    supply: number;
    predicted: number;
    temperature: number;
    rainfall: number;
  }>;
  weekly_trends: Array<{
    week_start: string;
    avg_consumption: number;
    total_consumption: number;
    peak_consumption: number;
    avg_supply: number;
  }>;
  monthly_trends: Array<{
    month: string;
    avg_consumption: number;
    total_consumption: number;
    peak_consumption: number;
    avg_supply: number;
    avg_temp: number;
  }>;
  day_of_week_analysis: Array<{
    day: string;
    mean_consumption: number;
    max_consumption: number;
    is_weekend: boolean;
  }>;
  peak_demand_records: Array<{
    date: string;
    zone: string;
    sector: string;
    consumption_mld: number;
    supply_mld: number;
    temperature: number;
    rainfall: number;
  }>;
  lowest_demand_records: Array<{
    date: string;
    zone: string;
    sector: string;
    consumption_mld: number;
    supply_mld: number;
    temperature: number;
    rainfall: number;
  }>;
  distribution_histogram: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  summary_metrics: {
    mean_daily_consumption: number;
    median_daily_consumption: number;
    std_daily_consumption: number;
    max_daily_consumption: number;
    min_daily_consumption: number;
    total_records_analyzed: number;
  };
}

export interface SectorItem {
  sector: string;
  total_consumption_mld: number;
  avg_consumption_mld: number;
  max_consumption_mld: number;
  min_consumption_mld: number;
  total_supply_mld: number;
  percentage_share: number;
  avg_population: number;
  liters_per_capita_daily: number;
  demand_to_supply_ratio: number;
}

export interface SectorAnalyticsResponse {
  sectors_breakdown: SectorItem[];
  highest_consuming_sector: string;
  lowest_consuming_sector: string;
  daily_sector_trends: Array<Record<string, any>>;
  sector_per_capita: Array<{
    sector: string;
    liters_per_person_day: number;
    total_population: number;
  }>;
}

export interface ZoneItem {
  zone: string;
  population: number;
  total_consumption_mld: number;
  total_supply_mld: number;
  avg_consumption_mld: number;
  avg_supply_mld: number;
  avg_predicted_demand_mld: number;
  avg_reservoir_level_percent: number;
  demand_status: 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  badge_color: 'emerald' | 'blue' | 'amber' | 'red';
  utilization_ratio: number;
  surplus_deficit_mld: number;
  liters_per_capita_daily: number;
  two_week_trend_pct: number;
}

export interface ZoneAnalyticsResponse {
  zones: ZoneItem[];
  high_demand_zones_identified: string[];
  threshold_documentation: {
    metrics_evaluated: string[];
    threshold_rules: Array<{
      status: string;
      condition: string;
      implication: string;
    }>;
  };
  zone_comparison_metrics: ZoneItem[];
}

export interface EnvironmentalAnalyticsResponse {
  correlation_matrix: Record<string, Record<string, number>>;
  scatter_temp_vs_consumption: Array<{ temperature: number; consumption: number; zone: string }>;
  scatter_rainfall_vs_consumption: Array<{ rainfall: number; consumption: number; zone: string }>;
  scatter_humidity_vs_consumption: Array<{ humidity: number; consumption: number; zone: string }>;
  scatter_reservoir_vs_demand: Array<{ reservoir: number; demand: number; zone: string }>;
  regression_slopes: {
    temp_slope_mld_per_celsius: number;
    rainfall_slope_mld_per_mm: number;
    humidity_slope_mld_per_percent: number;
    reservoir_slope_mld_per_percent: number;
  };
  analytical_insights: Array<{
    title: string;
    finding: string;
    analysis_type: string;
    notes: string;
  }>;
}

export interface PredictionInput {
  zone: string;
  sector: string;
  date?: string;
  population?: number;
  temperature_c: number;
  rainfall_mm: number;
  humidity_percent: number;
  reservoir_level_percent: number;
  water_supply_mld: number;
  previous_day_consumption_mld: number;
  water_consumption_mld: number;
  model_override?: string;
}

export interface PredictionResult {
  predicted_demand_mld: number;
  confidence_interval_low: number;
  confidence_interval_high: number;
  zone: string;
  sector: string;
  prediction_date: string;
  model_used: string;
  status: 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  status_reason: string;
  historical_avg_mld: number;
  percentage_change_vs_historical: number;
  timestamp: string;
  inputs_summary: Record<string, any>;
}

export interface BatchPredictionItem {
  zone: string;
  sector: string;
  predicted_demand_mld: number;
  water_supply_mld: number;
  status: string;
  deficit_or_surplus_mld: number;
  historical_avg_mld: number;
}

export interface BatchPredictionResponse {
  total_city_predicted_demand_mld: number;
  total_city_water_supply_mld: number;
  city_balance_mld: number;
  high_demand_zones: string[];
  critical_count: number;
  high_count: number;
  model_used: string;
  timestamp: string;
  predictions: BatchPredictionItem[];
}

export interface PredictionHistoryItem {
  id: number;
  prediction_date?: string;
  zone: string;
  sector: string;
  temperature_c: number;
  water_consumption_mld: number;
  water_supply_mld: number;
  predicted_demand_mld: number;
  model_used: string;
  status: string;
  created_at: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  zone_or_sector: string;
  category: string;
  type: string;
  reason: string;
  supporting_data: string;
  suggested_action: string;
  estimated_impact?: string;
  status?: string;
  created_at: string;
}

export interface RecommendationResponse {
  total_recommendations: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  recommendations: RecommendationItem[];
}

export interface MetricItem {
  mae: number;
  rmse: number;
  r2: number;
  training_time_seconds?: number;
}

export interface ModelPerformanceResponse {
  active_model: string;
  available_models: string[];
  train_size: number;
  test_size: number;
  total_size: number;
  active_metrics: MetricItem;
  reference_metrics: MetricItem & { persistence?: MetricItem; [key: string]: any };
  comparison: Record<string, MetricItem>;
  feature_importances: Array<{ feature: string; importance: number }>;
  actual_vs_predicted_sample: Array<{
    date: string;
    zone: string;
    sector: string;
    actual: number;
    predicted: number;
    error: number;
    baseline: number;
  }>;
  residual_distribution: Array<{
    bin_label: string;
    bin_center: number;
    count: number;
  }>;
  trained_at: string;
}

export interface DatasetOverviewResponse {
  filename: string;
  row_count: number;
  column_count: number;
  columns: Array<{ name: string; type: string; sample: string }>;
  date_range_start: string;
  date_range_end: string;
  total_days: number;
  zones: string[];
  sectors: string[];
  missing_values_count: number;
  duplicate_rows_count: number;
  is_original: boolean;
}

export interface PaginatedRecordsResponse {
  total_records: number;
  page: number;
  page_size: number;
  total_pages: number;
  records: Array<Record<string, any>>;
}

// --- New Phase 3 Advanced Module Interfaces ---

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
  suggestedFollowUps?: string[];
}

export interface AnomalyItem {
  id: string;
  date: string;
  zone: string;
  sector: string;
  actual_consumption_mld: number;
  expected_consumption_mld?: number;
  deviation_mld?: number;
  percentage_deviation?: number;
  anomaly_score: number;
  severity: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MEDIUM';
  method?: string;
  explanation?: string;
  water_consumption_mld?: number;
  water_supply_mld?: number;
  reason?: string;
}

export interface AnomalyResponse {
  total_anomalies: number;
  critical_count: number;
  high_count: number;
  elevated_count: number;
  contamination_rate: number;
  anomalies: AnomalyItem[];
  zone_distribution: Record<string, number>;
  sector_distribution: Record<string, number>;
  total_evaluated_records?: number;
  total_anomalies_detected?: number;
  severity_breakdown?: Record<string, number>;
  zone_breakdown?: Record<string, number>;
}

export interface WaterBalanceZoneItem {
  zone: string;
  water_supply_mld: number;
  actual_consumption_mld: number;
  predicted_demand_mld: number;
  gap_mld: number;
  gap_predicted_mld: number;
  utilization_rate: number;
  balance_status: 'SURPLUS' | 'DEFICIT' | 'TIGHT_BUFFER';
  population: number;
}

export interface WaterBalanceSectorItem {
  sector: string;
  water_supply_mld: number;
  actual_consumption_mld: number;
  gap_mld: number;
  percentage_share: number;
}

export interface WaterBalanceResponse {
  total_water_supply_mld: number;
  total_water_consumption_mld: number;
  total_predicted_demand_mld: number;
  net_gap_mld: number;
  net_gap_percentage: number;
  overall_status: 'SURPLUS' | 'DEFICIT' | 'BALANCED' | 'TIGHT_BUFFER';
  explanation: string;
  zones: WaterBalanceZoneItem[];
  sectors: WaterBalanceSectorItem[];
  daily_balance_trend: Array<{
    date: string;
    supply: number;
    consumption: number;
    predicted_demand: number;
    net_gap: number;
    is_deficit: boolean;
  }>;
  surplus_zones_count: number;
  deficit_zones_count: number;
  total_supply_mld?: number;
  total_consumption_mld?: number;
  total_gap_mld?: number;
  balance_status?: string;
  balance_ratio_percent?: number;
  zone_breakdown?: Record<string, { supply_mld: number; consumption_mld: number; gap_mld: number }>;
  daily_balance?: Array<{ date: string; supply_mld: number; consumption_mld: number; gap_mld: number }>;
}

export interface ChatMessageResponse {
  reply: string;
  suggested_followups: string[];
  sources: string[];
  metrics_referenced: Record<string, any>;
  timestamp: string;
  response?: string;
  source?: string;
  suggestedFollowUps?: string[];
}

export interface NotificationItem {
  id: number | string;
  title: string;
  message: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO' | 'NORMAL';
  category: string;
  zone?: string;
  is_read: boolean;
  created_at?: string;
  timestamp?: string;
  link?: string;
}

export interface NotificationResponse {
  total_count: number;
  unread_count: number;
  critical_count: number;
  notifications: NotificationItem[];
}

export interface ReportGenerateResponse {
  report_id: string;
  title: string;
  generated_at: string;
  period_start: string;
  period_end: string;
  zone_filter: string;
  sector_filter: string;
  executive_summary: {
    total_water_consumption_mld: number;
    total_water_supply_mld: number;
    net_balance_mld: number;
    average_reservoir_level_pct: number;
    highest_demand_zone: string;
    highest_demand_sector: string;
    operational_status: string;
    summary_statement: string;
  };
  consumption_highlights: {
    daily_average_mld: number;
    anomalies_detected: number;
  };
  zone_metrics: Array<any>;
  sector_metrics: Array<any>;
  forecast_summary: {
    active_model: string;
    next_day_demand_mld: number;
    accuracy_r2: number;
    mean_absolute_error_mld: number;
    root_mean_squared_error_mld: number;
    assessment: string;
  };
  model_accuracy: MetricItem;
  priority_recommendations: Array<any>;
  date?: string;
  zone?: string;
  sector?: string;
  summary?: any;
  sector_breakdown?: Record<string, number>;
  predictions?: any[];
  recommendations?: any[];
}

export interface DataQualityResponse {
  overall_quality_score: number;
  completeness_score: number;
  uniqueness_score: number;
  validity_score: number;
  timeliness_score: number;
  total_records: number;
  valid_records: number;
  missing_cells: number;
  duplicate_rows: number;
  zero_or_negative_values: number;
  outlier_count: number;
  quality_grade: string;
  attribute_breakdown: Array<{
    column: string;
    data_type: string;
    completeness_pct: number;
    unique_values_count: number;
    sample_value: string;
  }>;
  grade?: string;
  completeness_percent?: number;
  validity_percent?: number;
  uniqueness_percent?: number;
  outlier_ratio_percent?: number;
}

export interface ModelVersionItem {
  id: number;
  model_name: string;
  version: string;
  mae: number;
  rmse: number;
  r2: number;
  trained_at: string;
  is_active: boolean;
  version_id?: string;
  dataset_records?: number;
  created_at?: string;
}
