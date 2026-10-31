import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Layers,
  Thermometer,
  CloudRain,
  Droplets,
  Waves,
  Calendar,
  Building2,
  Users,
  Send,
  CheckCircle2,
  AlertTriangle,
  History,
  Grid3X3,
  Download,
  RotateCcw,
  Gauge
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import { api } from '../services/api';
import {
  PredictionInput,
  PredictionResult,
  BatchPredictionResponse,
  PredictionHistoryItem,
  ModelPerformanceResponse
} from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';

const ZONES = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'];
const SECTORS = ['Agriculture', 'Commercial', 'Industrial', 'Institutional', 'Residential'];

export const PredictionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'history'>('single');

  // Single Prediction Form State
  const [form, setForm] = useState<PredictionInput>({
    zone: 'Zone A',
    sector: 'Residential',
    date: '2026-12-31',
    population: 500000,
    temperature_c: 28.5,
    rainfall_mm: 0.0,
    humidity_percent: 55.0,
    reservoir_level_percent: 68.0,
    water_supply_mld: 260.0,
    previous_day_consumption_mld: 245.0,
    water_consumption_mld: 252.0,
    model_override: undefined
  });

  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [predictError, setPredictError] = useState<string | null>(null);

  // Batch Prediction State
  const [batchParams, setBatchParams] = useState({
    date: '2026-12-31',
    temperature_c: 29.0,
    rainfall_mm: 0.0,
    humidity_percent: 58.0,
    reservoir_level_percent: 65.0,
    model_override: undefined as string | undefined
  });
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchPredictionResponse | null>(null);

  // History & Validation Chart State
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [modelPerf, setModelPerf] = useState<ModelPerformanceResponse | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [hist, perf] = await Promise.all([
        api.getPredictionHistory(25),
        api.getModelPerformance()
      ]);
      setHistory(hist);
      setModelPerf(perf);
    } catch (e) {
      // quiet fallback
    }
  };

  const handlePredictSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPredicting(true);
    setPredictError(null);
    try {
      const res = await api.predictDemand(form);
      setPredictionResult(res);
      // Refresh history list
      const updatedHist = await api.getPredictionHistory(25);
      setHistory(updatedHist);
    } catch (err: any) {
      setPredictError(err?.response?.data?.detail || 'Machine learning prediction failed. Please check inputs.');
    } finally {
      setIsPredicting(false);
    }
  };

  const handleRunBatch = async () => {
    setBatchLoading(true);
    try {
      const res = await api.predictBatch(batchParams);
      setBatchResult(res);
    } catch (err: any) {
      alert('Batch prediction failed: ' + (err?.response?.data?.detail || err.message));
    } finally {
      setBatchLoading(false);
    }
  };

  const handleAutoFillRealistic = () => {
    // Populate with realistic operational baseline for chosen zone/sector
    const zoneMultipliers: Record<string, number> = {
      'Zone A': 1.15,
      'Zone B': 1.05,
      'Zone C': 1.0,
      'Zone D': 0.9,
      'Zone E': 0.95
    };
    const sectorBases: Record<string, number> = {
      Agriculture: 320,
      Industrial: 240,
      Residential: 180,
      Commercial: 140,
      Institutional: 90
    };
    const mult = zoneMultipliers[form.zone] || 1.0;
    const base = sectorBases[form.sector] || 200;
    const cons = Math.round(base * mult * 10) / 10;
    const prev = Math.round(cons * 0.98 * 10) / 10;
    const sup = Math.round(cons * 1.05 * 10) / 10;

    setForm({
      ...form,
      temperature_c: 29.5,
      rainfall_mm: 0.0,
      humidity_percent: 52.0,
      reservoir_level_percent: 64.0,
      water_supply_mld: sup,
      previous_day_consumption_mld: prev,
      water_consumption_mld: cons
    });
  };

  const exportBatchCSV = () => {
    if (!batchResult) return;
    const headers = 'Zone,Sector,Predicted_Demand_MLD,Water_Supply_MLD,Status,Surplus_Deficit_MLD\n';
    const rows = batchResult.predictions.map(
      (p) => `${p.zone},${p.sector},${p.predicted_demand_mld},${p.water_supply_mld},${p.status},${p.deficit_or_surplus_mld}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `water_batch_predictions_${batchParams.date}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold mb-2">
            <BrainCircuit className="w-3.5 h-3.5 text-cyan-600" />
            <span>Core AI Engine &bull; Next-Day Regression Forecast</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            AI Demand Prediction & Municipal Allocation Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Predict next-day municipal water consumption using validated XGBoost & Random Forest regressors.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'single' ? 'bg-white text-cyan-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Single Zone Forecast
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'batch' ? 'bg-white text-cyan-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            City-Wide Batch Matrix (25)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'history' ? 'bg-white text-cyan-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            History & Model Curves
          </button>
        </div>
      </div>

      {/* TAB 1: SINGLE PREDICTION FORM */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Prediction Input Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Forecast Input Parameters</h3>
                <p className="text-xs text-slate-500">Provide zone, sector, weather, and operational metrics</p>
              </div>
              <button
                type="button"
                onClick={handleAutoFillRealistic}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-xl transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>Auto-Fill Realistic Values</span>
              </button>
            </div>

            <form onSubmit={handlePredictSingle} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Zone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Zone</label>
                  <select
                    value={form.zone}
                    onChange={(e) => setForm({ ...form, zone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none font-semibold text-slate-800"
                  >
                    {ZONES.map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>

                {/* Sector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Urban Sector</label>
                  <select
                    value={form.sector}
                    onChange={(e) => setForm({ ...form, sector: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none font-semibold text-slate-800"
                  >
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Prediction Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Forecast Target Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none font-semibold text-slate-800"
                  />
                </div>

                {/* Model Override */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Model Selection</label>
                  <select
                    value={form.model_override || ''}
                    onChange={(e) => setForm({ ...form, model_override: e.target.value || undefined })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none font-semibold text-slate-800"
                  >
                    <option value="">Best Model (XGBoost Regressor - Default)</option>
                    <option value="random_forest">Random Forest Regressor</option>
                  </select>
                </div>
              </div>

              {/* Environmental Variables */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Environmental Variables</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Temp (&deg;C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.temperature_c}
                      onChange={(e) => setForm({ ...form, temperature_c: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Rainfall (mm)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.rainfall_mm}
                      onChange={(e) => setForm({ ...form, rainfall_mm: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Humidity (%)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={form.humidity_percent}
                      onChange={(e) => setForm({ ...form, humidity_percent: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Reservoir (%)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={form.reservoir_level_percent}
                      onChange={(e) => setForm({ ...form, reservoir_level_percent: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Operational Consumption Variables */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Operational Baseline (MLD)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Water Supply (MLD)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.water_supply_mld}
                      onChange={(e) => setForm({ ...form, water_supply_mld: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Previous Day Usage (MLD)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.previous_day_consumption_mld}
                      onChange={(e) => setForm({ ...form, previous_day_consumption_mld: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Current Day Usage (MLD)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.water_consumption_mld}
                      onChange={(e) => setForm({ ...form, water_consumption_mld: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>
              </div>

              {predictError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{predictError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isPredicting}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isPredicting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Executing ML Regression Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Predict Next-Day Demand (MLD)</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Prediction Result Display Card */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            {predictionResult ? (
              <div className="bg-white rounded-2xl p-6 border border-cyan-200 shadow-md ring-2 ring-cyan-100 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">Forecast Output</span>
                      <h4 className="font-extrabold text-slate-900 text-base">
                        {predictionResult.zone} &bull; {predictionResult.sector}
                      </h4>
                    </div>
                    <StatusBadge status={predictionResult.status} size="md" />
                  </div>

                  <div className="my-5 p-5 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50/80 border border-cyan-100 text-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Predicted Next-Day Water Demand</span>
                    <div className="text-4xl font-black text-slate-900 my-1 font-sans">
                      {predictionResult.predicted_demand_mld} <span className="text-lg font-bold text-cyan-700">MLD</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      95% Confidence Interval: <strong className="text-slate-700">{predictionResult.confidence_interval_low} - {predictionResult.confidence_interval_high} MLD</strong>
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Model Engine:</span>
                      <span className="font-bold text-slate-800">{predictionResult.model_used}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Historical Sector Avg:</span>
                      <span className="font-bold text-slate-800">{predictionResult.historical_avg_mld} MLD</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Deviation vs Historical:</span>
                      <span className={`font-bold ${predictionResult.percentage_change_vs_historical >= 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {predictionResult.percentage_change_vs_historical > 0 ? `+${predictionResult.percentage_change_vs_historical}%` : `${predictionResult.percentage_change_vs_historical}%`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Evaluation Timestamp:</span>
                      <span className="font-mono text-[11px] text-slate-600">{predictionResult.timestamp}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600">
                    <span className="font-bold text-slate-800">Dispatch Assessment:</span> {predictionResult.status_reason}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>SQLite Telemetry Logged</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[350px]">
                <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center mb-4">
                  <BrainCircuit className="w-8 h-8 text-cyan-600" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">Ready for Demand Inference</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Configure the zone, sector, and weather parameters on the left and click "Predict Next-Day Demand" to run the regression model.
                </p>
                <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-left w-full text-xs text-slate-600">
                  <span className="font-bold text-slate-700">Model Pipeline:</span> Features are normalized with time series chronological lag alignment, preventing target leakage.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BATCH PREDICTION MATRIX */}
      {activeTab === 'batch' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                City-Wide Batch Forecast Matrix (5 Zones &times; 5 Sectors = 25 Cells)
              </h3>
              <p className="text-xs text-slate-500">
                Simultaneously project next-day water demand for all 25 municipal divisions to check total city balance.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunBatch}
                disabled={batchLoading}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>{batchLoading ? 'Simulating 25 Divisions...' : 'Run All 25 Forecasts'}</span>
              </button>

              {batchResult && (
                <button
                  onClick={exportBatchCSV}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>
          </div>

          {/* Meteorological Settings for Batch */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Forecast Weather Temp:</span>
              <div className="font-bold text-slate-800 mt-0.5">{batchParams.temperature_c}&deg;C</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Forecast Rainfall:</span>
              <div className="font-bold text-slate-800 mt-0.5">{batchParams.rainfall_mm} mm</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Relative Humidity:</span>
              <div className="font-bold text-slate-800 mt-0.5">{batchParams.humidity_percent}%</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Central Reservoir Level:</span>
              <div className="font-bold text-slate-800 mt-0.5">{batchParams.reservoir_level_percent}%</div>
            </div>
          </div>

          {/* Batch City Summary Banner */}
          {batchResult && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Total City Demand</span>
                <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {batchResult.total_city_predicted_demand_mld.toLocaleString()} MLD
                </div>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Total City Supply</span>
                <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {batchResult.total_city_water_supply_mld.toLocaleString()} MLD
                </div>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Projected Net Balance</span>
                <div className={`text-xl font-extrabold mt-0.5 ${batchResult.city_balance_mld >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {batchResult.city_balance_mld > 0 ? `+${batchResult.city_balance_mld.toLocaleString()}` : batchResult.city_balance_mld.toLocaleString()} MLD
                </div>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Stressed Divisions</span>
                <div className="text-xl font-extrabold text-amber-700 mt-0.5">
                  {batchResult.critical_count + batchResult.high_count} Alert Cells
                </div>
              </div>
            </div>
          )}

          {/* Batch Prediction Table */}
          {batchResult ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Zone</th>
                    <th className="py-2.5 px-3">Sector</th>
                    <th className="py-2.5 px-3">Predicted Demand</th>
                    <th className="py-2.5 px-3">Supply Allocation</th>
                    <th className="py-2.5 px-3">Margin / Balance</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {batchResult.predictions.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{p.zone}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{p.sector}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{p.predicted_demand_mld} MLD</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{p.water_supply_mld} MLD</td>
                      <td className={`py-2.5 px-3 font-mono font-semibold ${p.deficit_or_surplus_mld >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {p.deficit_or_surplus_mld > 0 ? `+${p.deficit_or_surplus_mld}` : p.deficit_or_surplus_mld} MLD
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={p.status} size="sm" showPulse={false} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Click "Run All 25 Forecasts" to generate city-wide batch predictions.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PREDICTION HISTORY & VALIDATION CURVES */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Actual vs Predicted on Test Set */}
          {modelPerf && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Chronological Test Set: Actual vs. Forecasted Demand</h3>
                  <p className="text-xs text-slate-500">Out-of-sample chronological evaluation (R&sup2; = {modelPerf.active_metrics.r2})</p>
                </div>
                <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-100">
                  {modelPerf.active_model}
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={modelPerf.actual_vs_predicted_sample} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} minTickGap={25} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Line type="monotone" dataKey="actual" name="Actual Observed Demand" stroke="#0f172a" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="predicted" name="ML Predicted Demand" stroke="#06b6d4" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* SQLite Prediction History Table */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-600" />
                Persistent SQLite Prediction History Log
              </h3>
              <span className="text-xs text-slate-500 font-medium">Last {history.length} records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Zone</th>
                    <th className="py-2.5 px-3">Sector</th>
                    <th className="py-2.5 px-3">Input Temp</th>
                    <th className="py-2.5 px-3">Recent Usage</th>
                    <th className="py-2.5 px-3">Predicted Demand</th>
                    <th className="py-2.5 px-3">Model Engine</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">
                        No predictions logged in SQLite database yet.
                      </td>
                    </tr>
                  ) : (
                    history.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{h.created_at}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{h.zone}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{h.sector}</td>
                        <td className="py-2.5 px-3">{h.temperature_c}&deg;C</td>
                        <td className="py-2.5 px-3">{h.water_consumption_mld} MLD</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-cyan-700">{h.predicted_demand_mld} MLD</td>
                        <td className="py-2.5 px-3 text-slate-500">{h.model_used}</td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={h.status} size="sm" showPulse={false} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
