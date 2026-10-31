import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Activity,
  Layers,
  Waves,
  Building,
  Factory,
  AlertTriangle,
  Lightbulb,
  Calendar,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Scale
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';

import { api } from '../services/api';
import { DashboardSummaryResponse } from '../types';
import { KPICard } from '../components/KPICard';
import { FilterBar } from '../components/FilterBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { HeroSection } from '../components/HeroSection';

const SECTOR_COLORS: Record<string, string> = {
  Residential: '#0284c7', // Sky Blue
  Commercial: '#06b6d4',  // Cyan
  Industrial: '#f59e0b',  // Amber
  Agriculture: '#10b981', // Emerald
  Institutional: '#8b5cf6' // Purple
};

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedSector, setSelectedSector] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSummary = async () => {
    try {
      setError(null);
      setIsRefreshing(true);
      const res = await api.getDashboardSummary({
        zone: selectedZone === 'All' ? undefined : selectedZone,
        sector: selectedSector === 'All' ? undefined : selectedSector,
        start_date: startDate || undefined,
        end_date: endDate || undefined
      });
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to fetch executive dashboard data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedZone, selectedSector, startDate, endDate]);

  const handleResetFilters = () => {
    setSelectedZone('All');
    setSelectedSector('All');
    setStartDate('');
    setEndDate('');
  };

  if (loading && !data) {
    return <LoadingSpinner message="Aggregating municipal telemetry and ML demand projections..." />;
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 p-6 rounded-2xl">
        <h3 className="font-bold text-base flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          Dashboard Synchronization Error
        </h3>
        <p className="text-sm mt-1">{error || 'An unexpected error occurred.'}</p>
        <div className="flex gap-3 mt-4">
          <button
            onClick={fetchSummary}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition"
          >
            Retry Connection
          </button>
          <button
            onClick={() => {
              import('../services/fallbackService').then((m) => {
                setData(m.fallbackService.getDashboardSummary());
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

  const { kpis, consumption_trend_daily, actual_vs_predicted_trend, sector_distribution, zone_comparison, high_demand_alerts, recent_anomalies, dataset_info } = data;

  return (
    <div className="space-y-8">
      {/* Redesigned Premium Hero Section */}
      <HeroSection
        totalConsumption={kpis.total_water_consumption_mld}
        totalSupply={kpis.total_water_supply_mld}
        predictedDemand={kpis.predicted_next_day_demand_mld}
        reservoirLevel={kpis.average_reservoir_level_percent}
        onExploreClick={() => {
          const el = document.getElementById('dashboard-metrics');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Command Center Controls & Telemetry */}
      <div id="dashboard-metrics" className="space-y-6 pt-2">
        {/* Quick Action Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Operational Telemetry & Municipal Balancing
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Filtered urban consumption, next-day ML forecasting, and distribution buffers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/water-balance"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl shadow-xs transition"
            >
              <Scale className="w-3.5 h-3.5 text-cyan-500" />
              <span>Water Balance</span>
            </Link>
            <Link
              to="/anomalies"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl shadow-xs transition"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span>AI Anomalies</span>
            </Link>
            <Link
              to="/prediction"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-sm transition-all"
            >
              <span>Run AI Prediction</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          selectedZone={selectedZone}
          selectedSector={selectedSector}
          startDate={startDate}
          endDate={endDate}
          onZoneChange={setSelectedZone}
          onSectorChange={setSelectedSector}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onReset={handleResetFilters}
          onRefresh={fetchSummary}
          isRefreshing={isRefreshing}
        />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Total Consumption"
          value={kpis.total_water_consumption_mld}
          unit="MLD"
          subtitle="Filtered Volume"
          icon={Droplets}
          colorTheme="blue"
        />
        <KPICard
          title="Total Supply"
          value={kpis.total_water_supply_mld}
          unit="MLD"
          subtitle={`Balance: +${kpis.net_water_balance_mld.toLocaleString()} MLD`}
          icon={Layers}
          colorTheme="cyan"
        />
        <KPICard
          title="Predicted Demand"
          value={kpis.predicted_next_day_demand_mld}
          unit="MLD"
          subtitle="ML Regression Forecast"
          icon={Activity}
          colorTheme="indigo"
        />
        <KPICard
          title="Avg Reservoir Level"
          value={`${kpis.average_reservoir_level_percent}%`}
          subtitle={kpis.average_reservoir_level_percent > 50 ? 'Nominal Capacity' : 'Conservation Mode'}
          icon={Waves}
          colorTheme={kpis.average_reservoir_level_percent > 45 ? 'emerald' : 'amber'}
        />
        <KPICard
          title="Highest Demand Zone"
          value={kpis.highest_consumption_zone}
          subtitle={`${kpis.highest_consumption_zone_mld.toLocaleString()} MLD Total`}
          icon={Building}
          colorTheme="amber"
        />
        <KPICard
          title="Highest Sector"
          value={kpis.highest_consumption_sector}
          subtitle={`${kpis.highest_consumption_sector_mld.toLocaleString()} MLD Total`}
          icon={Factory}
          colorTheme="rose"
        />
      </div>

      {/* High Demand Alerts (if any) */}
      {high_demand_alerts.length > 0 && (
        <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
              <span>Active High-Demand Zone Alerts ({high_demand_alerts.length})</span>
            </div>
            <Link to="/recommendations" className="text-xs font-semibold text-amber-800 dark:text-amber-300 hover:underline">
              Review Action Plan &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {high_demand_alerts.map((alt, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-amber-200/60 dark:border-amber-900/40 shadow-xs flex items-start gap-2.5">
                <StatusBadge status={alt.status} size="sm" />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 dark:text-white">{alt.zone}</span>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">{alt.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 1 Charts: Daily Trend & Actual vs Predicted */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Water Consumption Trend */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Daily Water Consumption & Supply Trend</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily MLD observations across selected filters</p>
            </div>
            <span className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-100 dark:border-cyan-800">
              TimeSeries Aggregation
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={consumption_trend_daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="consumptionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} minTickGap={25} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="consumption" name="Actual Consumption (MLD)" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#consumptionGrad)" />
                <Area type="monotone" dataKey="supply" name="Municipal Supply (MLD)" stroke="#06b6d4" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#supplyGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actual vs Predicted Demand Comparison */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Actual vs. ML Predicted Demand</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Validation of machine learning forecast accuracy</p>
            </div>
            <Link
              to="/model-performance"
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900"
            >
              Model Metrics &rarr;
            </Link>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={actual_vs_predicted_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} minTickGap={20} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="consumption" name="Actual Consumption" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="predicted_demand" name="ML Predicted Demand" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Sector Distribution & Zone Comparison & Water Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sector Distribution Donut */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Sector Consumption Share</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Breakdown across 5 municipal urban sectors</p>
          </div>

          <div className="h-64 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sector_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sector_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SECTOR_COLORS[entry.name] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toLocaleString()} MLD`, 'Total']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700">
            {sector_distribution.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SECTOR_COLORS[s.name] || '#94a3b8' }} />
                  {s.name}
                </span>
                <span className="font-bold text-slate-800 dark:text-white">{s.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zone-Wise Consumption Comparison */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col justify-between lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Zone Comparison: Consumption vs. Supply Allocation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total volume distribution and capacity buffer across Zones A-E</p>
            </div>
            <Link to="/zones" className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
              Detailed Zone View &rarr;
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zone_comparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="zone" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString()} MLD`]}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="consumption" name="Total Consumption (MLD)" fill="#0284c7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="supply" name="Water Supply Allocation (MLD)" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-5 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700 text-center">
            {zone_comparison.map((z) => (
              <div key={z.zone} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 text-[11px]">
                <div className="font-bold text-slate-800 dark:text-white">{z.zone}</div>
                <div className="mt-1">
                  <StatusBadge status={z.status} size="sm" showPulse={false} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Reservoir Trend & Quick Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reservoir Level Trend */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col justify-between lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Central Municipal Reservoir Level Trend (%)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Storage percentage telemetry with 35% critical threshold line</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800">
              Mean: {kpis.average_reservoir_level_percent}%
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={consumption_trend_daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="reservoirGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} minTickGap={25} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Reservoir Level']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="reservoir_level" name="Reservoir Level (%)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#reservoirGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Significant Anomalies */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recent Telemetry Anomalies</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Detected discrepancies exceeding &plusmn;12%</p>
            </div>
            <Link to="/anomalies" className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline">
              View All &rarr;
            </Link>
          </div>

          <div className="space-y-2.5 my-3 max-h-52 overflow-y-auto">
            {recent_anomalies.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No telemetry anomalies detected.</p>
            ) : (
              recent_anomalies.map((ano, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/70 dark:border-slate-700 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {ano.date}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      ano.type.includes('Deficit') 
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' 
                        : 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
                    }`}>
                      {ano.type}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>Usage: {ano.consumption} MLD</span>
                    <span>Variance: {ano.variance_mld > 0 ? `+${ano.variance_mld}` : ano.variance_mld} MLD</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Dataset Records:</span>
            <span className="font-bold text-slate-800 dark:text-white">{dataset_info.total_rows.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
