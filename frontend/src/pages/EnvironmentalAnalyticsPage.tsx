import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Thermometer,
  CloudRain,
  Droplets,
  Waves,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Compass,
  Lightbulb
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import { api } from '../services/api';
import { EnvironmentalAnalyticsResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const EnvironmentalAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<EnvironmentalAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnvData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getEnvironmentalAnalytics();
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to fetch environmental analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvData();
  }, []);

  if (loading && !data) {
    return <LoadingSpinner message="Evaluating meteorological correlations and climatic sensitivity trends..." />;
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl">
        <h3 className="font-bold text-base">Error Loading Environmental Analytics</h3>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={fetchEnvData} className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold">
          Retry
        </button>
      </div>
    );
  }

  const { correlation_matrix, scatter_temp_vs_consumption, scatter_rainfall_vs_consumption, scatter_humidity_vs_consumption, scatter_reservoir_vs_demand, regression_slopes, analytical_insights } = data;

  const corrLabels: Record<string, string> = {
    Temperature_C: 'Temperature (°C)',
    Rainfall_mm: 'Rainfall (mm)',
    Humidity_Percent: 'Humidity (%)',
    Reservoir_Level_Percent: 'Reservoir (%)',
    Water_Consumption_MLD: 'Water Consumption',
    Next_Day_Demand_MLD: 'Next-Day Demand'
  };

  const getHeatmapColor = (val: number) => {
    if (val >= 0.7) return 'bg-cyan-600 text-white';
    if (val >= 0.3) return 'bg-cyan-100 text-cyan-900';
    if (val > 0) return 'bg-cyan-50 text-cyan-800';
    if (val <= -0.7) return 'bg-rose-600 text-white';
    if (val <= -0.3) return 'bg-rose-100 text-rose-900';
    if (val < 0) return 'bg-rose-50 text-rose-800';
    return 'bg-slate-50 text-slate-700';
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Environmental Analytics & Meteorological Correlation
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Evaluating the physiological and seasonal impact of temperature, rainfall, and humidity on municipal water demand.
        </p>
      </div>

      {/* Correlation Matrix Heatmap */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Pearson Correlation Coefficient Matrix (r)
            </h3>
            <p className="text-xs text-slate-500">
              Cross-correlation between environmental variables and consumption outcomes (-1.0 to +1.0)
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
            Statistical Analysis
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead>
              <tr>
                <th className="py-2.5 px-3 text-left font-bold text-slate-700">Variable</th>
                {Object.keys(correlation_matrix).map((k) => (
                  <th key={k} className="py-2.5 px-3 font-semibold text-slate-600">
                    {corrLabels[k] || k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.keys(correlation_matrix).map((rowKey) => (
                <tr key={rowKey}>
                  <td className="py-2.5 px-3 text-left font-bold text-slate-800 bg-slate-50">
                    {corrLabels[rowKey] || rowKey}
                  </td>
                  {Object.keys(correlation_matrix[rowKey]).map((colKey) => {
                    const val = correlation_matrix[rowKey][colKey];
                    return (
                      <td key={colKey} className={`py-2.5 px-3 font-mono font-bold ${getHeatmapColor(val)}`}>
                        {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4 Scatter Plots Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter 1: Temperature vs Water Consumption */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-cyan-800">
                <Thermometer className="w-4 h-4 text-cyan-600" />
                Temperature vs. Water Consumption
              </h4>
              <p className="text-xs text-slate-500">
                Slope: +{regression_slopes.temp_slope_mld_per_celsius} MLD / &deg;C
              </p>
            </div>
            <span className="text-[11px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
              r = +{correlation_matrix['Temperature_C']?.['Water_Consumption_MLD']}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="temperature" name="Temperature" unit="°C" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="number" dataKey="consumption" name="Consumption" unit=" MLD" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Scatter name="Observations" data={scatter_temp_vs_consumption} fill="#0ea5e9" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter 2: Rainfall vs Water Consumption */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-blue-900">
                <CloudRain className="w-4 h-4 text-blue-600" />
                Rainfall vs. Water Consumption
              </h4>
              <p className="text-xs text-slate-500">
                Slope: {regression_slopes.rainfall_slope_mld_per_mm} MLD / mm
              </p>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              r = {correlation_matrix['Rainfall_mm']?.['Water_Consumption_MLD']}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="rainfall" name="Rainfall" unit=" mm" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="number" dataKey="consumption" name="Consumption" unit=" MLD" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Scatter name="Observations" data={scatter_rainfall_vs_consumption} fill="#0284c7" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter 3: Humidity vs Water Consumption */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-indigo-900">
                <Droplets className="w-4 h-4 text-indigo-600" />
                Humidity vs. Water Consumption
              </h4>
              <p className="text-xs text-slate-500">
                Slope: {regression_slopes.humidity_slope_mld_per_percent} MLD / %
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              r = {correlation_matrix['Humidity_Percent']?.['Water_Consumption_MLD']}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="humidity" name="Humidity" unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="number" dataKey="consumption" name="Consumption" unit=" MLD" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Scatter name="Observations" data={scatter_humidity_vs_consumption} fill="#6366f1" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scatter 4: Reservoir Level vs Next-Day Demand */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-emerald-900">
                <Waves className="w-4 h-4 text-emerald-600" />
                Reservoir Level vs. Demand
              </h4>
              <p className="text-xs text-slate-500">
                Slope: {regression_slopes.reservoir_slope_mld_per_percent} MLD / %
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              r = {correlation_matrix['Reservoir_Level_Percent']?.['Next_Day_Demand_MLD']}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="reservoir" name="Reservoir" unit="%" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="number" dataKey="demand" name="Next-Day Demand" unit=" MLD" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Scatter name="Observations" data={scatter_reservoir_vs_demand} fill="#10b981" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Explanatory Scientific Insights: Correlation vs Causation (Section 10 Requirement) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Compass className="w-5 h-5 text-cyan-600" />
          <h3 className="font-bold text-slate-900 text-base">
            Scientific Insights & Correlation vs. Causation Analysis
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analytical_insights.map((ins, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-100/60 px-2 py-0.5 rounded">
                  {ins.analysis_type}
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-2">{ins.title}</h4>
                <p className="text-xs text-slate-700 font-semibold mt-1.5">{ins.finding}</p>
              </div>
              <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-200/60">
                {ins.notes}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
