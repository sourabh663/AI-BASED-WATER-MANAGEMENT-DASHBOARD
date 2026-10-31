import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Users,
  Droplets,
  Layers,
  Waves,
  TrendingUp,
  AlertTriangle,
  Info,
  ShieldCheck,
  Building,
  CheckCircle2,
  RefreshCw,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import { api } from '../services/api';
import { fallbackService } from '../services/fallbackService';
import { ZoneAnalyticsResponse } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SchematicZoneMap } from '../components/SchematicZoneMap';

export const ZoneMonitoringPage: React.FC = () => {
  const [data, setData] = useState<ZoneAnalyticsResponse>(() => fallbackService.getZoneAnalytics());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const fetchZones = async () => {
    try {
      const res = await api.getZoneAnalytics();
      if (res) {
        setData(res);
        setError(null);
      }
    } catch (err: any) {
      console.warn('Zone telemetry note: retained baseline data.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  if (loading && !data) {
    return <LoadingSpinner message="Monitoring municipal distribution zones A through E..." />;
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 p-6 rounded-2xl">
        <h3 className="font-bold text-base">Error Loading Zone Telemetry</h3>
        <p className="text-sm mt-1">{error}</p>
        <div className="flex gap-3 mt-4">
          <button onClick={fetchZones} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition">
            Retry Connection
          </button>
          <button
            onClick={() => {
              import('../services/fallbackService').then((m) => {
                setData(m.fallbackService.getZoneAnalytics());
                setError(null);
              });
            }}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition"
          >
            Load Municipal Baseline
          </button>
        </div>
      </div>
    );
  }

  const { zones, high_demand_zones_identified, threshold_documentation, zone_comparison_metrics } = data;
  const activeZoneDetail = selectedZone ? zones.find(z => z.zone === selectedZone) : null;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Zone Telemetry & Municipal Distribution Monitoring
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational status, per-capita allocation, and load stress thresholds across Zones A-E.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {high_demand_zones_identified.length > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
              <span>High-Demand Stress: {high_demand_zones_identified.join(', ')}</span>
            </div>
          )}
          <button
            onClick={fetchZones}
            className="p-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Schematic Map & Distribution Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SchematicZoneMap
            zones={zones}
            selectedZone={selectedZone || undefined}
            onSelectZone={(z) => setSelectedZone(z === selectedZone ? null : z)}
          />
        </div>

        {/* Selected Zone Quick Drilldown Panel */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          {activeZoneDetail ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{activeZoneDetail.zone} Inspection</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Urban District Details</span>
                </div>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <span className="text-slate-500 dark:text-slate-400">Status</span>
                  <StatusBadge status={activeZoneDetail.demand_status} size="sm" />
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <span className="text-slate-500 dark:text-slate-400">Population</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeZoneDetail.population.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <span className="text-slate-500 dark:text-slate-400">Consumption</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeZoneDetail.total_consumption_mld.toLocaleString()} MLD</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <span className="text-slate-500 dark:text-slate-400">Supply</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeZoneDetail.total_supply_mld.toLocaleString()} MLD</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <span className="text-slate-500 dark:text-slate-400">Per Capita (LPCD)</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">{activeZoneDetail.liters_per_capita_daily} L/day</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <span className="text-slate-500 dark:text-slate-400">Utilization</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{activeZoneDetail.utilization_ratio}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 my-auto">
              <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30 text-cyan-500" />
              <p className="text-xs font-semibold">Click any zone node on the map</p>
              <p className="text-[11px] text-slate-400 mt-1">Select a zone node (A–E) to inspect targeted telemetry metrics</p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-400">
            Schematic network coordinates represent municipal pipe manifolds.
          </div>
        </div>
      </div>

      {/* 5 Dedicated Zone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {zones.map((z) => {
          const isSelected = selectedZone === z.zone;
          return (
            <div
              key={z.zone}
              onClick={() => setSelectedZone(isSelected ? null : z.zone)}
              className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'ring-2 ring-blue-500 border-blue-500 dark:border-blue-500'
                  : z.demand_status === 'CRITICAL'
                  ? 'border-rose-300 dark:border-rose-900 ring-2 ring-rose-100 dark:ring-rose-950/40'
                  : z.demand_status === 'HIGH'
                  ? 'border-amber-300 dark:border-amber-900 ring-2 ring-amber-50 dark:ring-amber-950/40'
                  : 'border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {z.zone.replace('Zone ', '')}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">{z.zone}</h3>
                      <span className="text-[10px] text-slate-400">Urban District</span>
                    </div>
                  </div>
                  <StatusBadge status={z.demand_status} size="sm" />
                </div>

                {/* Utilization Progress Bar */}
                <div className="my-4">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-500 dark:text-slate-400">Supply Utilization</span>
                    <span className={z.utilization_ratio > 95 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                      {z.utilization_ratio}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        z.utilization_ratio > 100
                          ? 'bg-rose-500'
                          : z.utilization_ratio > 95
                          ? 'bg-amber-500'
                          : z.utilization_ratio > 85
                          ? 'bg-sky-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, z.utilization_ratio)}%` }}
                    />
                  </div>
                </div>

                {/* Metrics List */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Population
                    </span>
                    <span className="font-bold text-slate-800 dark:text-white">{z.population.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-slate-400" />
                      Total Usage
                    </span>
                    <span className="font-bold text-slate-800 dark:text-white">{z.total_consumption_mld.toLocaleString()} MLD</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      Supply Allocation
                    </span>
                    <span className="font-bold text-slate-800 dark:text-white">{z.total_supply_mld.toLocaleString()} MLD</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Waves className="w-3.5 h-3.5 text-slate-400" />
                      Reservoir Level
                    </span>
                    <span className="font-bold text-slate-800 dark:text-white">{z.avg_reservoir_level_percent}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      Per Capita (LPCD)
                    </span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{z.liters_per_capita_daily} L/day</span>
                  </div>
                </div>
              </div>

              {/* 14-day Trend growth indicator */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>14-Day Shift</span>
                <span className={`font-bold flex items-center gap-0.5 ${z.two_week_trend_pct >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  <TrendingUp className="w-3 h-3" />
                  {z.two_week_trend_pct > 0 ? `+${z.two_week_trend_pct}%` : `${z.two_week_trend_pct}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zone Comparison Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Zone Comparison: Actual Consumption vs. Water Supply (MLD)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Comprehensive municipal supply balancing and buffer analysis</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg">
            5 Municipal Zones
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zone_comparison_metrics} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
              <XAxis dataKey="zone" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip 
                formatter={(val: any) => [`${Number(val).toLocaleString()} MLD`]} 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="total_consumption_mld" name="Total Water Consumption (MLD)" fill="#0284c7" radius={[6, 6, 0, 0]} />
              <Bar dataKey="total_supply_mld" name="Water Supply Capacity (MLD)" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Threshold Documentation Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Documented Municipal Demand Status Classification Criteria
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Zones are dynamically classified into four standardized municipal alert categories based on utilization ratio and reservoir security margins:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {threshold_documentation.threshold_rules.map((rule, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-800 dark:text-white">{rule.status}</span>
                  <StatusBadge status={rule.status} size="sm" showPulse={false} />
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-200">Trigger:</span> {rule.condition}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-600 pt-2 italic">
                {rule.implication}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
