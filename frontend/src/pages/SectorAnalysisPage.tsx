import React, { useState, useEffect } from 'react';
import {
  PieChart as PieIcon,
  BarChart3,
  Layers,
  Users,
  Home,
  Building2,
  Factory,
  Tractor,
  GraduationCap,
  TrendingUp,
  Percent
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
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
import { SectorAnalyticsResponse, SectorItem } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { KPICard } from '../components/KPICard';

const SECTOR_ICONS: Record<string, any> = {
  Residential: Home,
  Commercial: Building2,
  Industrial: Factory,
  Agriculture: Tractor,
  Institutional: GraduationCap
};

const SECTOR_COLORS: Record<string, string> = {
  Residential: '#0284c7', // Sky Blue
  Commercial: '#06b6d4',  // Cyan
  Industrial: '#f59e0b',  // Amber
  Agriculture: '#10b981', // Emerald
  Institutional: '#8b5cf6' // Purple
};

export const SectorAnalysisPage: React.FC = () => {
  const [data, setData] = useState<SectorAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState('All');

  const fetchSectorData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getSectorAnalytics({
        zone: selectedZone === 'All' ? undefined : selectedZone
      });
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to fetch sector analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectorData();
  }, [selectedZone]);

  if (loading && !data) {
    return <LoadingSpinner message="Evaluating consumption dynamics across the 5 municipal sectors..." />;
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl">
        <h3 className="font-bold text-base">Error Loading Sector Analytics</h3>
        <p className="text-sm mt-1">{error}</p>
        <div className="flex gap-3 mt-4">
          <button onClick={fetchSectorData} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition">
            Retry Connection
          </button>
          <button
            onClick={() => {
              import('../services/fallbackService').then((m) => {
                setData(m.fallbackService.getSectorAnalytics());
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

  const { sectors_breakdown, highest_consuming_sector, lowest_consuming_sector, daily_sector_trends, sector_per_capita } = data;

  const totalCityUsage = sectors_breakdown.reduce((acc, s) => acc + s.total_consumption_mld, 0);

  return (
    <div className="space-y-6">
      {/* Title & Zone Quick Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sector-Wise Water Consumption Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown across Agriculture, Commercial, Industrial, Institutional, and Residential sectors.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-xs">
          <span className="text-slate-500 font-semibold">Filter by Zone:</span>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
          >
            {['All', 'Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'].map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Top Consumer Sector"
          value={highest_consuming_sector}
          subtitle="Highest volumetric share"
          icon={Factory}
          colorTheme="amber"
        />
        <KPICard
          title="Most Efficient Sector"
          value={lowest_consuming_sector}
          subtitle="Lowest total draw"
          icon={GraduationCap}
          colorTheme="emerald"
        />
        <KPICard
          title="Total Analyzed Volume"
          value={totalCityUsage}
          unit="MLD"
          subtitle="All 5 sectors combined"
          icon={Layers}
          colorTheme="blue"
        />
        <KPICard
          title="Sectors Evaluated"
          value={sectors_breakdown.length}
          subtitle="Agriculture, Comm, Ind, Inst, Res"
          icon={PieIcon}
          colorTheme="indigo"
        />
      </div>

      {/* 5 Sector Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {sectors_breakdown.map((s) => {
          const Icon = SECTOR_ICONS[s.sector] || Building2;
          const color = SECTOR_COLORS[s.sector] || '#0284c7';
          return (
            <div
              key={s.sector}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm transition-all duration-200 card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold shadow-xs"
                      style={{ backgroundColor: color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{s.sector}</h4>
                      <span className="text-[10px] text-slate-400">Urban Sector</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {s.percentage_share}%
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total Usage</span>
                    <span className="font-bold text-slate-800">{s.total_consumption_mld.toLocaleString()} MLD</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Daily Average</span>
                    <span className="font-bold text-slate-800">{s.avg_consumption_mld.toLocaleString()} MLD</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Peak Surge</span>
                    <span className="font-bold text-amber-700">{s.max_consumption_mld.toLocaleString()} MLD</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Per Capita Usage</span>
                    <span className="font-bold text-cyan-700">{s.liters_per_capita_daily} L/day</span>
                  </div>
                </div>
              </div>

              {/* Share visual bar */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${s.percentage_share}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Sector Share Donut & Comparative Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie / Donut Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Sector Volumetric Contribution</h3>
            <p className="text-xs text-slate-500">Proportional breakdown of all municipal water draws</p>
          </div>

          <div className="h-64 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectors_breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="total_consumption_mld"
                  nameKey="sector"
                >
                  {sectors_breakdown.map((entry) => (
                    <Cell key={entry.sector} fill={SECTOR_COLORS[entry.sector] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString()} MLD`, 'Total Consumption']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {sectors_breakdown.map((s) => (
              <div key={s.sector} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SECTOR_COLORS[s.sector] || '#94a3b8' }} />
                  {s.sector}
                </span>
                <span className="font-bold text-slate-800">{s.percentage_share}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparative Bar Chart: Average & Max Demand by Sector */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Sector Comparison: Daily Average vs. Peak Load (MLD)</h3>
              <p className="text-xs text-slate-500">Baseline consumption vs maximum registered peak stress per sector</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              5 Urban Sectors
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectors_breakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="sector" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip formatter={(val: any) => [`${Number(val).toLocaleString()} MLD`]} contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="avg_consumption_mld" name="Daily Average (MLD)" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                <Bar dataKey="max_consumption_mld" name="Peak Load (MLD)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Note: Institutional sector reflects civic universities, hospitals, and municipal buildings.</span>
          </div>
        </div>
      </div>

      {/* Row 3: Daily Sector Trends Multi-Line Chart (Last 30 Days) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent 30-Day Multi-Sector Demand Trajectories (MLD)</h3>
            <p className="text-xs text-slate-500">Synchronous comparison of sector fluctuations across recent observation period</p>
          </div>
          <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-lg border border-cyan-100">
            30-Day Time Series
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily_sector_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} minTickGap={20} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              {['Agriculture', 'Industrial', 'Residential', 'Commercial', 'Institutional'].map((s) => (
                <Line
                  key={s}
                  type="monotone"
                  dataKey={s}
                  name={s}
                  stroke={SECTOR_COLORS[s] || '#64748b'}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
