import axios from 'axios';
import {
  DashboardSummaryResponse,
  ConsumptionAnalyticsResponse,
  SectorAnalyticsResponse,
  ZoneAnalyticsResponse,
  EnvironmentalAnalyticsResponse,
  PredictionInput,
  PredictionResult,
  BatchPredictionResponse,
  PredictionHistoryItem,
  RecommendationResponse,
  ModelPerformanceResponse,
  DatasetOverviewResponse,
  PaginatedRecordsResponse,
  AnomalyResponse,
  WaterBalanceResponse,
  ChatMessageResponse,
  NotificationResponse,
  ReportGenerateResponse,
  DataQualityResponse,
  ModelVersionItem
} from '../types';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const api = {
  // System Health
  getHealth: async () => {
    const res = await client.get('/health');
    return res.data;
  },

  // Executive Dashboard Summary
  getDashboardSummary: async (params?: { start_date?: string; end_date?: string; zone?: string; sector?: string }): Promise<DashboardSummaryResponse> => {
    const res = await client.get<DashboardSummaryResponse>('/dashboard/summary', { params });
    return res.data;
  },

  // Consumption Analytics
  getConsumptionAnalytics: async (params?: { start_date?: string; end_date?: string; zone?: string; sector?: string }): Promise<ConsumptionAnalyticsResponse> => {
    const res = await client.get<ConsumptionAnalyticsResponse>('/analytics/consumption', { params });
    return res.data;
  },

  // Sector Analytics
  getSectorAnalytics: async (params?: { start_date?: string; end_date?: string; zone?: string }): Promise<SectorAnalyticsResponse> => {
    const res = await client.get<SectorAnalyticsResponse>('/analytics/sectors', { params });
    return res.data;
  },

  // Zone Analytics
  getZoneAnalytics: async (params?: { start_date?: string; end_date?: string; sector?: string }): Promise<ZoneAnalyticsResponse> => {
    const res = await client.get<ZoneAnalyticsResponse>('/analytics/zones', { params });
    return res.data;
  },

  // Environmental Analytics
  getEnvironmentalAnalytics: async (params?: { start_date?: string; end_date?: string; zone?: string; sector?: string }): Promise<EnvironmentalAnalyticsResponse> => {
    const res = await client.get<EnvironmentalAnalyticsResponse>('/analytics/environment', { params });
    return res.data;
  },

  // Anomaly Detection
  getAnomalies: async (contamination?: number, severity?: string, zone?: string, sector?: string): Promise<AnomalyResponse> => {
    const res = await client.get<AnomalyResponse>('/analytics/anomalies', { 
      params: { contamination, severity, zone, sector } 
    });
    return res.data;
  },

  // Water Balance Monitoring
  getWaterBalance: async (zone?: string, startDate?: string, endDate?: string): Promise<WaterBalanceResponse> => {
    const res = await client.get<WaterBalanceResponse>('/analytics/water-balance', { 
      params: { zone, start_date: startDate, end_date: endDate } 
    });
    return res.data;
  },

  // AI Water Assistant
  sendAssistantMessage: async (message: string, zone?: string, sector?: string): Promise<ChatMessageResponse> => {
    const res = await client.post<ChatMessageResponse>('/assistant/chat', { 
      message, 
      context_zone: zone, 
      context_sector: sector 
    });
    return res.data;
  },

  getAssistantSuggestions: async (): Promise<{ suggestions: string[] }> => {
    const res = await client.get<{ suggestions: string[] }>('/assistant/suggestions');
    return res.data;
  },

  // Report Generation
  generateReport: async (params?: { title?: string; date?: string; zone?: string; sector?: string; include_sections?: string[] }): Promise<ReportGenerateResponse> => {
    const res = await client.post<ReportGenerateResponse>('/reports/generate', params || {});
    return res.data;
  },

  // Notification Center
  getNotifications: async (unreadOnly?: boolean, priority?: string): Promise<NotificationResponse> => {
    const res = await client.get<NotificationResponse>('/notifications', {
      params: { unread_only: unreadOnly, priority }
    });
    return res.data;
  },

  markNotificationRead: async (id: number | string) => {
    const res = await client.post(`/notifications/${id}/read`);
    return res.data;
  },

  markAllNotificationsRead: async () => {
    const res = await client.post('/notifications/mark-all-read');
    return res.data;
  },

  // Prediction Endpoints
  getModelInfo: async () => {
    const res = await client.get('/prediction/model-info');
    return res.data;
  },

  predictDemand: async (payload: PredictionInput): Promise<PredictionResult> => {
    const res = await client.post<PredictionResult>('/prediction/predict', payload);
    return res.data;
  },

  predictBatch: async (payload: { date?: string; temperature_c?: number; rainfall_mm?: number; humidity_percent?: number; reservoir_level_percent?: number; model_override?: string }): Promise<BatchPredictionResponse> => {
    const res = await client.post<BatchPredictionResponse>('/prediction/batch', payload);
    return res.data;
  },

  getPredictionHistory: async (limit: number = 30): Promise<PredictionHistoryItem[]> => {
    const res = await client.get<PredictionHistoryItem[]>('/prediction/history', { params: { limit } });
    return res.data;
  },

  // Recommendations
  getRecommendations: async (): Promise<RecommendationResponse> => {
    const res = await client.get<RecommendationResponse>('/recommendations');
    return res.data;
  },

  updateRecommendationStatus: async (recId: string, status: string) => {
    const res = await client.post(`/recommendations/${recId}/status`, null, { params: { status } });
    return res.data;
  },

  // Model Performance
  getModelPerformance: async (): Promise<ModelPerformanceResponse> => {
    const res = await client.get<ModelPerformanceResponse>('/model/performance');
    return res.data;
  },

  getModelVersions: async (): Promise<ModelVersionItem[]> => {
    const res = await client.get<ModelVersionItem[]>('/model/versions');
    return res.data;
  },

  retrainModel: async () => {
    const res = await client.post('/model/train');
    return res.data;
  },

  // Data Management
  getDatasetOverview: async (): Promise<DatasetOverviewResponse> => {
    const res = await client.get<DatasetOverviewResponse>('/data/overview');
    return res.data;
  },

  getDataQuality: async (): Promise<DataQualityResponse> => {
    const res = await client.get<DataQualityResponse>('/data/quality');
    return res.data;
  },

  getDatasetRecords: async (params: {
    page?: number;
    page_size?: number;
    search?: string;
    zone?: string;
    sector?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
    sort_asc?: boolean;
  }): Promise<PaginatedRecordsResponse> => {
    const res = await client.get<PaginatedRecordsResponse>('/data/records', { params });
    return res.data;
  },

  previewCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/data/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  uploadDataset: async (formData: FormData) => {
    const res = await client.post('/data/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  resetDataset: async () => {
    const res = await client.post('/data/reset');
    return res.data;
  }
};

// Named exports for convenient direct imports
export const getAnomalies = api.getAnomalies;
export const getWaterBalance = api.getWaterBalance;
export const getNotifications = api.getNotifications;
export const markNotificationRead = api.markNotificationRead;
export const markAllNotificationsRead = api.markAllNotificationsRead;
export const getAssistantSuggestions = api.getAssistantSuggestions;
export const sendAssistantMessage = api.sendAssistantMessage;
export const generateReport = api.generateReport;
export const getDataQuality = api.getDataQuality;
export const previewCsv = api.previewCsv;
export const getModelVersions = api.getModelVersions;
export const updateRecommendationStatus = api.updateRecommendationStatus;
