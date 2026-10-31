import React, { useState, useEffect } from 'react';
import { 
  Scale, Droplets, TrendingUp, TrendingDown, Info, 
  RefreshCw, Calendar, MapPin, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { getWaterBalance } from '../services/api';
import { WaterBalanceResponse } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const WaterBalancePage: React.FC = () => {
  const [data, setData] = useState<WaterBalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('ALL');

  const loadBalance = async () => {
    try {
      setLoading(true);
      const res = await getWaterBalance(selectedZone !== 'ALL' ? selectedZone : undefined);
      setData(res);
    } catch (err) {
      console.error('Failed to load water balance', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, [selectedZone]);

  const zoneChartData = data?.zones ? data.zones.map(z => ({
    zone: z.zone,
    supply: z.water_supply_mld,
    consumption: z.actual_consumption_mld,
    gap: z.gap_mld
  })) : [];

  const timeSeriesData = data?.daily_balance_trend ? data.daily_balance_trend.slice(-30).map(d => ({
    date: d.date.split('-').slice(1).join('/'),
    supply: d.supply,
    consumption: d.consumption,
    gap: d.net_gap
  })) : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Municipal Water Balance Monitoring</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300">
                Mass Balance Accounting
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              High-precision accounting of bulk treated supply vs recorded sector consumption across all 5 municipal zones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="ALL">All Zones (Aggregated)</option>
            <option value="Zone A">Zone A</option>
            <option value="Zone B">Zone B</option>
            <option value="Zone C">Zone C</option>
            <option value="Zone D">Zone D</option>
            <option value="Zone E">Zone E</option>
          </select>
          <button
            onClick={loadBalance}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Scientific Caution Banner */}
      <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-4 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
          <span className="font-semibold">Hydrological Accounting Clarification:</span> Water balance computes the delta between municipal bulk input supply and end-user meter aggregations. While a positive delta represents surplus available for distribution or storage, unmetered uses, transmission delays, and evaporation can contribute to differences. Because the dataset lacks pipe sensor data, this gap is strictly an administrative balance indicator, not physical pipe leakage.
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Total Water Supply</span>
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {data ? `${(data.total_water_supply_mld ?? data.total_supply_mld ?? 0).toLocaleString()} MLD` : '...'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Aggregated municipal supply</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Total Consumption</span>
            <TrendingUp className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {data ? `${(data.total_water_consumption_mld ?? data.total_consumption_mld ?? 0).toLocaleString()} MLD` : '...'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across 5 municipal sectors</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Net Accounting Balance</span>
            <Scale className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-2xl font-bold mt-2 ${
            ((data?.net_gap_mld ?? data?.total_gap_mld) || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {data ? `${(data.net_gap_mld ?? data.total_gap_mld ?? 0) >= 0 ? '+' : ''}${(data.net_gap_mld ?? data.total_gap_mld ?? 0).toLocaleString()} MLD` : '...'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Status: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{data?.overall_status || data?.balance_status || 'SURPLUS'}</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Balance Ratio</span>
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {data ? `${((1 - (data.net_gap_percentage ?? 0)) * 100).toFixed(1)}%` : '...'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Consumption / Supply ratio</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Balance Trend Area Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Daily Supply vs Consumption (Past 30 Days)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Volume comparison and net surplus tracking over time</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="consumptionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} 
                />
                <Legend />
                <Area type="monotone" dataKey="supply" name="Supply (MLD)" stroke="#3b82f6" fillOpacity={1} fill="url(#supplyGrad)" />
                <Area type="monotone" dataKey="consumption" name="Consumption (MLD)" stroke="#06b6d4" fillOpacity={1} fill="url(#consumptionGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone Comparison Bar Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Zone Supply vs Consumption Comparison</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Total volume allocation across all 5 municipal zones</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="zone" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} 
                />
                <Legend />
                <Bar dataKey="supply" name="Supply (MLD)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="consumption" name="Consumption (MLD)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Zone-by-Zone Breakdown Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Zone-by-Zone Accounting Breakdown</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Supply, consumption, and balance surplus/deficit statistics per zone
          </p>
        </div>

        {loading ? (
          <div className="p-8">
            <LoadingSkeleton count={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3">Zone</th>
                  <th className="px-6 py-3 text-right">Total Supply</th>
                  <th className="px-6 py-3 text-right">Total Consumption</th>
                  <th className="px-6 py-3 text-right">Net Gap</th>
                  <th className="px-6 py-3 text-right">Balance Ratio</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-800 dark:text-slate-200">
                {zoneChartData.map((item, idx) => {
                  const ratio = ((item.consumption / item.supply) * 100).toFixed(1);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{item.zone}</td>
                      <td className="px-6 py-4 text-right font-mono">{item.supply.toLocaleString()} MLD</td>
                      <td className="px-6 py-4 text-right font-mono">{item.consumption.toLocaleString()} MLD</td>
                      <td className={`px-6 py-4 text-right font-mono font-semibold ${
                        item.gap >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {item.gap >= 0 ? '+' : ''}{item.gap.toLocaleString()} MLD
                      </td>
                      <td className="px-6 py-4 text-right font-mono">{ratio}%</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          item.gap >= 0
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                        }`}>
                          {item.gap >= 0 ? 'SURPLUS' : 'DEFICIT'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
