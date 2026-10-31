import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  Layers,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Flame,
  Snowflake,
  PieChart as PieIcon
} from 'lucide-react';
import {
  AreaChart,
  Area,
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
import { ConsumptionAnalyticsResponse } from '../types';
import { FilterBar } from '../components/FilterBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { KPICard } from '../components/KPICard';

export const ConsumptionAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<ConsumptionAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedSector, setSelectedSector] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      setIsRefreshing(true);
      const res = await api.getConsumptionAnalytics({
        zone: selectedZone === 'All' ? undefined : selectedZone,
        sector: selectedSector === 'All' ? undefined : selectedSector,
        start_date: startDate || undefined,
        end_date: endDate || undefined
      });
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to fetch consumption analytics');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedZone, selectedSector, startDate, endDate]);

  const handleReset = () => {
    setSelectedZone('All');
    setSelectedSector('All');
    setStartDate('');
    setEndDate('');
  };

  if (loading && !data) {
    return <LoadingSpinner message="Calculating granular consumption trends, peaks, and distributions..." />;
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl">
        <h3 className="font-bold text-base">Error Loading Consumption Analytics</h3>
        <p className="text-sm mt-1">{error}</p>
        <button onClick={fetchAnalytics} className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold">
          Retry
        </button>
      </div>
    );
  }

  const { daily_trends, weekly_trends, monthly_trends, day_of_week_analysis, peak_demand_records, lowest_demand_records, distribution_histogram, summary_metrics } = data;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Consumption Analytics & Historical Patterns
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed temporal distribution, periodic seasonality, and peak-demand stress records.
          </p>
        </div>

        {/* Granularity Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(['daily', 'weekly', 'monthly'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                granularity === g
                  ? 'bg-white text-cyan-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {g}
            </button>
          ))}
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
        onReset={handleReset}
        onRefresh={fetchAnalytics}
        isRefreshing={isRefreshing}
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Daily Mean Demand"
          value={summary_metrics.mean_daily_consumption}
          unit="MLD"
          subtitle="Average daily volume"
          icon={TrendingUp}
          colorTheme="blue"
        />
        <KPICard
          title="Daily Median Demand"
          value={summary_metrics.median_daily_consumption}
          unit="MLD"
          subtitle="50th percentile baseline"
          icon={Layers}
          colorTheme="cyan"
        />
        <KPICard
          title="Peak Historical Day"
          value={summary_metrics.max_daily_consumption}
          unit="MLD"
          subtitle="Highest observed surge"
          icon={Flame}
          colorTheme="amber"
        />
        <KPICard
          title="Lowest Observed Day"
          value={summary_metrics.min_daily_consumption}
          unit="MLD"
          subtitle="Minimum baseline load"
          icon={Snowflake}
          colorTheme="emerald"
        />
      </div>

      {/* Primary Trend Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm capitalize">
              {granularity} Consumption Dynamics (MLD)
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated historical consumption curve across chosen municipal scope
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
            {granularity === 'daily' ? `${daily_trends.length} Days` : granularity === 'weekly' ? `${weekly_trends.length} Weeks` : `${monthly_trends.length} Months`}
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {granularity === 'daily' ? (
              <AreaChart data={daily_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="consumArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} minTickGap={25} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="consumption" name="Actual Consumption (MLD)" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#consumArea)" />
                <Area type="monotone" dataKey="supply" name="Water Supply Allocation (MLD)" stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            ) : granularity === 'weekly' ? (
              <BarChart data={weekly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week_start" tick={{ fontSize: 11, fill: '#64748b' }} minTickGap={20} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="avg_consumption" name="Weekly Avg Consumption (MLD)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="peak_consumption" name="Weekly Peak Load (MLD)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={monthly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="avg_consumption" name="Monthly Avg Consumption (MLD)" fill="#0284c7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="peak_consumption" name="Monthly Peak Load (MLD)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Day of Week Analysis & Distribution Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Day of Week Analysis */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Day-of-Week Seasonality Patterns</h3>
            <p className="text-xs text-slate-500">Comparison of weekday baseline vs weekend load shift</p>
          </div>

          <div className="h-64 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={day_of_week_analysis} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="mean_consumption" name="Mean Demand (MLD)" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                <Bar dataKey="max_consumption" name="Peak Day Demand (MLD)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            <span className="font-bold text-slate-800">Operational Note:</span> Peak weekday municipal demand consistently concentrates around Tuesday-Thursday due to concurrent industrial and institutional operations.
          </div>
        </div>

        {/* Consumption Distribution Histogram */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Consumption Frequency Distribution</h3>
            <p className="text-xs text-slate-500">Distribution histogram of daily consumption across observations</p>
          </div>

          <div className="h-64 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution_histogram} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#64748b' }} angle={-20} textAnchor="end" height={45} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="count" name="Days Count" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-100 text-xs text-cyan-900">
            <span className="font-bold">Standard Deviation:</span> &plusmn;{summary_metrics.std_daily_consumption} MLD. The unimodal curve demonstrates stable municipal operational baselines.
          </div>
        </div>
      </div>

      {/* Row 3: Peak vs Lowest Demand Historical Observations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Demand Records Table */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-amber-900">
              <Flame className="w-4 h-4 text-amber-500" />
              Highest Peak Demand Historical Records
            </h3>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              Top 8 Surges
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Zone</th>
                  <th className="py-2 px-3">Sector</th>
                  <th className="py-2 px-3">Consumption</th>
                  <th className="py-2 px-3">Temp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {peak_demand_records.map((r, i) => (
                  <tr key={i} className="hover:bg-amber-50/40">
                    <td className="py-2 px-3 font-semibold text-slate-800">{r.date}</td>
                    <td className="py-2 px-3">{r.zone}</td>
                    <td className="py-2 px-3">{r.sector}</td>
                    <td className="py-2 px-3 font-bold text-amber-700">{r.consumption_mld} MLD</td>
                    <td className="py-2 px-3">{r.temperature}&deg;C</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lowest Demand Records Table */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-sky-900">
              <Snowflake className="w-4 h-4 text-sky-500" />
              Lowest Water Demand Observations
            </h3>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-sky-100 text-sky-800">
              Top 8 Minimums
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Zone</th>
                  <th className="py-2 px-3">Sector</th>
                  <th className="py-2 px-3">Consumption</th>
                  <th className="py-2 px-3">Rainfall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {lowest_demand_records.map((r, i) => (
                  <tr key={i} className="hover:bg-sky-50/40">
                    <td className="py-2 px-3 font-semibold text-slate-800">{r.date}</td>
                    <td className="py-2 px-3">{r.zone}</td>
                    <td className="py-2 px-3">{r.sector}</td>
                    <td className="py-2 px-3 font-bold text-sky-700">{r.consumption_mld} MLD</td>
                    <td className="py-2 px-3">{r.rainfall} mm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
