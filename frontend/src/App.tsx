import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './layouts/MainLayout';

// Existing 10 pages
import { DashboardPage } from './pages/DashboardPage';
import { ConsumptionAnalyticsPage } from './pages/ConsumptionAnalyticsPage';
import { ZoneMonitoringPage } from './pages/ZoneMonitoringPage';
import { SectorAnalysisPage } from './pages/SectorAnalysisPage';
import { PredictionPage } from './pages/PredictionPage';
import { EnvironmentalAnalyticsPage } from './pages/EnvironmentalAnalyticsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';
import { DataManagementPage } from './pages/DataManagementPage';
import { SettingsPage } from './pages/SettingsPage';

// 5 New Advanced Modules
import { AssistantPage } from './pages/AssistantPage';
import { AnomalyDetectionPage } from './pages/AnomalyDetectionPage';
import { WaterBalancePage } from './pages/WaterBalancePage';
import { ReportGenerationPage } from './pages/ReportGenerationPage';
import { NotificationCenterPage } from './pages/NotificationCenterPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="consumption" element={<ConsumptionAnalyticsPage />} />
            <Route path="zones" element={<ZoneMonitoringPage />} />
            <Route path="sectors" element={<SectorAnalysisPage />} />
            <Route path="prediction" element={<PredictionPage />} />
            <Route path="environment" element={<EnvironmentalAnalyticsPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="model-performance" element={<ModelPerformancePage />} />
            <Route path="data-management" element={<DataManagementPage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* 5 New Modules */}
            <Route path="assistant" element={<AssistantPage />} />
            <Route path="anomalies" element={<AnomalyDetectionPage />} />
            <Route path="water-balance" element={<WaterBalancePage />} />
            <Route path="reports" element={<ReportGenerationPage />} />
            <Route path="notifications" element={<NotificationCenterPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
