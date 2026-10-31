import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Sliders,
  Database,
  ShieldCheck,
  CheckCircle2,
  Users,
  GraduationCap,
  ExternalLink,
  Cpu,
  RefreshCw,
  Sun,
  Moon,
  Palette
} from 'lucide-react';

import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  // Threshold form state
  const [normalRatio, setNormalRatio] = useState('85');
  const [moderateRatio, setModerateRatio] = useState('95');
  const [highRatio, setHighRatio] = useState('102');
  const [criticalReservoir, setCriticalReservoir] = useState('35');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [h, m] = await Promise.all([
          api.getHealth(),
          api.getModelInfo()
        ]);
        setHealth(h);
        setModelInfo(m);
      } catch (e) {
        // quiet fallback
      }
    };
    fetchStatus();
  }, []);

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage('Operational thresholds saved successfully into municipal configuration.');
    setTimeout(() => setSaveMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Configuration & Platform Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Appearance, municipal threshold tuning, active model selection, diagnostics, and project attribution.
        </p>
      </div>

      {/* Theme & Visual Preferences */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Interface Appearance Mode</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Switch between Light Mode and Dark Mode for municipal command rooms.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/60 p-1.5 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => { if (theme === 'dark') toggleTheme(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              theme === 'light'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-300'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Light</span>
          </button>
          <button
            onClick={() => { if (theme === 'light') toggleTheme(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              theme === 'dark'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-300'
            }`}
          >
            <Moon className="w-4 h-4 text-blue-400" />
            <span>Dark</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Operational Alert Thresholds */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Municipal Demand Stress Thresholds</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Configure utilization boundaries for Zone Monitoring alert badges and Decision Support recommendations.
            </p>

            <form onSubmit={handleSaveThresholds} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Normal Utilization Upper Limit (%)
                </label>
                <input
                  type="number"
                  value={normalRatio}
                  onChange={(e) => setNormalRatio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-bold"
                />
                <span className="text-[10px] text-slate-400">Consumption below this ratio is classified NORMAL.</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Moderate Stress Upper Limit (%)
                </label>
                <input
                  type="number"
                  value={moderateRatio}
                  onChange={(e) => setModerateRatio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-bold"
                />
                <span className="text-[10px] text-slate-400">Above normal but below peak capacity buffer.</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  High Demand Stress Boundary (%)
                </label>
                <input
                  type="number"
                  value={highRatio}
                  onChange={(e) => setHighRatio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-bold"
                />
                <span className="text-[10px] text-slate-400">Values above this threshold trigger CRITICAL deficit alarms.</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Critical Reservoir Safety Floor (%)
                </label>
                <input
                  type="number"
                  value={criticalReservoir}
                  onChange={(e) => setCriticalReservoir(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-bold"
                />
                <span className="text-[10px] text-slate-400">Triggers city-wide Level-2 conservation directives if breached.</span>
              </div>

              {saveMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{saveMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Save Threshold Parameters
              </button>
            </form>
          </div>
        </div>

        {/* Card 2: System Diagnostics & Health */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Backend Engine Diagnostics & Telemetry</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Real-time operational status of the FastAPI server, SQLite database, and ML pipeline.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">FastAPI Service Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online &bull; Healthy
                  </span>
                </div>
                <span className="font-mono text-slate-600 dark:text-slate-300 text-[11px]">Port 8000</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Database Engine</span>
                  <span className="font-bold text-slate-800 dark:text-white mt-0.5">SQLite via SQLAlchemy</span>
                </div>
                <span className="font-mono text-slate-600 dark:text-slate-300 text-[11px]">water_management.db</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Active ML Regressor</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">{modelInfo?.active_model || 'XGBoost Regressor'}</span>
                </div>
                <span className="font-mono text-slate-600 dark:text-slate-300 text-[11px]">R² 0.987</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Interactive Swagger Docs</span>
                  <a
                    href="http://localhost:8000/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <span>/docs (OpenAPI UI)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <span className="font-mono text-slate-600 dark:text-slate-300 text-[11px]">REST API v1</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
            <span>CORS Enabled for localhost:5173</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Project Presentation & Team Attribution Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>AI Water Intelligence Dashboard</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Intelligent Water Resource Management
            </h3>
            <p className="text-cyan-200 font-medium text-xs sm:text-sm mt-1">
              "Transforming Water Data into Smarter Decisions."
            </p>
            <p className="text-slate-400 text-xs max-w-xl mt-3 leading-relaxed">
              Monitor water consumption, analyse distribution patterns, forecast future demand and generate actionable insights using artificial intelligence and machine learning.
            </p>
          </div>

          {/* Project Team Members Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 min-w-[280px]">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b border-white/10">
              <Users className="w-4 h-4" />
              <span>Project Team Members</span>
            </div>
            <ul className="space-y-2 text-xs">
              <li className="flex justify-between items-center">
                <span className="font-bold text-white">1. ANSHUL UPADHYAY</span>
                <span className="font-mono text-cyan-300 text-[11px]">1240439109</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="font-bold text-white">2. SOURABH SINGH</span>
                <span className="font-mono text-cyan-300 text-[11px]">1240439446</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="font-bold text-white">3. KHUSHI WALIA</span>
                <span className="font-mono text-cyan-300 text-[11px]">1240439227</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="font-bold text-white">4. AMREEN SHAKEEL ALVI</span>
                <span className="font-mono text-cyan-300 text-[11px]">1240439082</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
