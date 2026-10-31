import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Filter,
  BrainCircuit,
  SlidersHorizontal,
  ArrowRight,
  ShieldAlert,
  Droplets,
  Layers,
  Wrench,
  Sparkles,
  Check,
  XCircle,
  RefreshCw
} from 'lucide-react';

import { api, updateRecommendationStatus } from '../services/api';
import { RecommendationResponse, RecommendationItem } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';

export const RecommendationsPage: React.FC = () => {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [recStatuses, setRecStatuses] = useState<Record<string, string>>({});

  const fetchRecs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getRecommendations();
      setData(res);
      // Initialize statuses
      const statuses: Record<string, string> = {};
      res.recommendations.forEach(r => {
        statuses[r.id] = r.status || 'active';
      });
      setRecStatuses(statuses);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'acknowledged' | 'resolved' | 'dismissed' | 'active') => {
    try {
      setRecStatuses(prev => ({ ...prev, [id]: newStatus }));
      await updateRecommendationStatus(id, newStatus);
    } catch (err) {
      console.error('Failed to update recommendation status', err);
    }
  };

  if (loading && !data) {
    return <LoadingSpinner message="Synthesizing actionable municipal decision support recommendations..." />;
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 p-6 rounded-2xl">
        <h3 className="font-bold text-base">Error Loading Recommendations</h3>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={fetchRecs} className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold">
          Retry
        </button>
      </div>
    );
  }

  const { recommendations, critical_count, high_count, medium_count, low_count } = data;

  const filteredRecs = recommendations.filter((r) => {
    if (priorityFilter !== 'ALL' && r.priority !== priorityFilter) return false;
    if (typeFilter !== 'ALL') {
      if (typeFilter === 'ML' && !r.type.includes('ML')) return false;
      if (typeFilter === 'RULE' && !r.type.includes('Rule')) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>AI Decision Support System (DSS)</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Actionable Municipal Resource Recommendations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational directives derived from real stress thresholds, telemetry anomalies, and machine learning forecasts.
          </p>
        </div>

        <button
          onClick={fetchRecs}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-Synthesize</span>
        </button>
      </div>

      {/* Priority Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-rose-200 dark:border-rose-900 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase">Critical Priority</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{critical_count}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            !
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-amber-200 dark:border-amber-900 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">High Priority</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{high_count}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-sky-200 dark:border-sky-900 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase">Medium Priority</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{medium_count}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Low / Advisory</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{low_count}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider mr-1">Filter Priority:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                priorityFilter === p
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider mr-1">Source Type:</span>
          {['ALL', 'RULE', 'ML'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                typeFilter === t
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {t === 'ALL' ? 'All Directives' : t === 'RULE' ? 'Rule-Based Threshold' : 'ML-Generated Insight'}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendation Action Cards List */}
      <div className="space-y-4">
        {filteredRecs.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 text-slate-500 text-xs">
            No recommendations match the chosen priority and source filters.
          </div>
        ) : (
          filteredRecs.map((rec) => {
            const currentStatus = recStatuses[rec.id] || 'active';
            const isResolved = currentStatus === 'resolved';
            const isAck = currentStatus === 'acknowledged';
            const isDismissed = currentStatus === 'dismissed';
            const isML = rec.type.includes('ML');

            return (
              <div
                key={rec.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border shadow-sm transition-all duration-200 ${
                  rec.priority === 'CRITICAL'
                    ? 'border-rose-200 dark:border-rose-900/60 ring-1 ring-rose-50 dark:ring-rose-950/30'
                    : rec.priority === 'HIGH'
                    ? 'border-amber-200 dark:border-amber-900/60 ring-1 ring-amber-50 dark:ring-amber-950/30'
                    : 'border-slate-200/80 dark:border-slate-700'
                } ${isResolved ? 'opacity-50 bg-slate-50/50 dark:bg-slate-800/40' : isAck ? 'border-l-4 border-l-blue-500' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      rec.priority === 'CRITICAL'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        : rec.priority === 'HIGH'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                        : 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400'
                    }`}>
                      {isML ? <BrainCircuit className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] text-slate-400 font-semibold">{rec.id}</span>
                        <StatusBadge status={rec.priority} size="sm" />
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isML
                            ? 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800'
                            : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                        }`}>
                          {rec.type}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                          Target: <strong>{rec.zone_or_sector}</strong>
                        </span>
                        {currentStatus !== 'active' && (
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isResolved
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : isAck
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                          }`}>
                            {currentStatus}
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{rec.title}</h3>
                    </div>
                  </div>

                  {/* Operational Status Action Buttons */}
                  <div className="flex items-center gap-2 self-start">
                    {currentStatus !== 'acknowledged' && !isResolved && (
                      <button
                        onClick={() => handleStatusChange(rec.id, 'acknowledged')}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                        <span>Acknowledge</span>
                      </button>
                    )}
                    {currentStatus !== 'resolved' && (
                      <button
                        onClick={() => handleStatusChange(rec.id, 'resolved')}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}
                    {currentStatus !== 'active' && (
                      <button
                        onClick={() => handleStatusChange(rec.id, 'active')}
                        className="px-2.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                        title="Reopen"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>

                {/* Directive Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Analytical Cause / Reason</span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{rec.reason}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/60 dark:border-slate-700">
                    <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Supporting Telemetry Data</span>
                    <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">{rec.supporting_data}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-800">
                    <span className="text-cyan-800 dark:text-cyan-300 font-bold uppercase text-[10px] block mb-1">Actionable Operational Step</span>
                    <p className="text-cyan-950 dark:text-cyan-100 font-bold leading-relaxed">{rec.suggested_action}</p>
                    {rec.estimated_impact && (
                      <div className="mt-2 text-[11px] text-cyan-800 dark:text-cyan-300 font-semibold border-t border-cyan-200/50 dark:border-cyan-800/50 pt-1">
                        Impact: {rec.estimated_impact}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
