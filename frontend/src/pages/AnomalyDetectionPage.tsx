import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, ShieldAlert, Activity, Filter, Download, 
  RefreshCw, CheckCircle, Search, HelpCircle 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { getAnomalies } from '../services/api';
import { AnomalyItem, AnomalyResponse } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const AnomalyDetectionPage: React.FC = () => {
  const [data, setData] = useState<AnomalyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [contamination, setContamination] = useState(0.03);
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getAnomalies(
        contamination,
        selectedSeverity !== 'ALL' ? selectedSeverity : undefined,
        selectedZone !== 'ALL' ? selectedZone : undefined,
        selectedSector !== 'ALL' ? selectedSector : undefined
      );
      setData(res);
    } catch (err) {
      console.error('Failed to load anomalies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [contamination, selectedZone, selectedSector, selectedSeverity]);

  const handleExportCSV = () => {
    if (!data?.anomalies || data.anomalies.length === 0) return;
    const headers = ['Date', 'Zone', 'Sector', 'Actual_Consumption_MLD', 'Expected_Consumption_MLD', 'Anomaly_Score', 'Severity', 'Explanation'];
    const rows = data.anomalies.map(a => [
      a.date,
      a.zone,
      a.sector,
      a.actual_consumption_mld,
      a.expected_consumption_mld ?? a.water_supply_mld ?? 0,
      a.anomaly_score.toFixed(4),
      a.severity,
      `"${(a.explanation || a.reason || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `municipal_water_anomalies_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredList = (data?.anomalies || []).filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const reasonText = (item.explanation || item.reason || '').toLowerCase();
    return (
      item.zone.toLowerCase().includes(term) ||
      item.sector.toLowerCase().includes(term) ||
      item.date.includes(term) ||
      reasonText.includes(term)
    );
  });

  const severityPieData = data ? [
    { name: 'Critical', value: data.critical_count ?? data.severity_breakdown?.CRITICAL ?? 0, color: '#ef4444' },
    { name: 'High', value: data.high_count ?? data.severity_breakdown?.HIGH ?? 0, color: '#f97316' },
    { name: 'Elevated / Medium', value: (data.elevated_count ?? 0) + (data.severity_breakdown?.MEDIUM ?? 0), color: '#eab308' },
  ].filter(d => d.value > 0) : [];

  const zoneBarData = data ? Object.entries(data.zone_distribution || data.zone_breakdown || {}).map(([zone, count]) => ({
    zone,
    anomalies: count
  })) : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Anomaly & Outlier Detection</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                Isolation Forest + Z-Score
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Unsupervised machine learning model identifying consumption spikes, atypical demand patterns, and supply disparities.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            disabled={!data?.anomalies.length}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Total Evaluated</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {(data?.total_evaluated_records ?? 9075).toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Full municipal historical dataset</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Anomalies Detected</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {data?.total_anomalies ?? data?.total_anomalies_detected ?? 0}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Rate: {data ? (((data.total_anomalies ?? data.total_anomalies_detected ?? 0) / (data.total_evaluated_records ?? 9075)) * 100).toFixed(2) : 0}% of records
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Critical Severity</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {data?.critical_count ?? data?.severity_breakdown?.CRITICAL ?? 0}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Requiring immediate audit</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <span>Sensitivity Ratio</span>
            <Filter className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {(contamination * 100).toFixed(0)}%
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Isolation Forest contamination</p>
        </div>
      </div>

      {/* Sensitivity & Filters Bar */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="flex items-center justify-between mb-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Model Contamination Ratio: {(contamination * 100).toFixed(1)}%</span>
              <span className="text-slate-500 text-[11px]">(Expected Outlier Proportion)</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.08"
              step="0.01"
              value={contamination}
              onChange={(e) => setContamination(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Zone</label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Zones</option>
                <option value="Zone A">Zone A</option>
                <option value="Zone B">Zone B</option>
                <option value="Zone C">Zone C</option>
                <option value="Zone D">Zone D</option>
                <option value="Zone E">Zone E</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Sector</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Sectors</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Institutional">Institutional</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Severity</label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Anomalies Detected by Zone</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Total atypical occurrences flagged per municipal supply zone</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="zone" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                />
                <Bar dataKey="anomalies" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Breakdown Pie Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Severity Distribution</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Z-score magnitude classification</p>
          <div className="h-64 flex items-center justify-center">
            {severityPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {severityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} 
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-slate-400">No anomalies found</div>
            )}
          </div>
        </div>
      </div>

      {/* Anomalies Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Detected Anomaly Events</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredList.length} of {data?.total_anomalies ?? data?.total_anomalies_detected ?? 0} flagged records
            </p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search zone, sector, date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl pl-9 pr-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8">
            <LoadingSkeleton count={5} />
          </div>
        ) : filteredList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Zone</th>
                  <th className="px-5 py-3">Sector</th>
                  <th className="px-5 py-3 text-right">Consumption</th>
                  <th className="px-5 py-3 text-right">Expected</th>
                  <th className="px-5 py-3">Severity</th>
                  <th className="px-5 py-3">Reason / Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-800 dark:text-slate-200">
                {filteredList.slice(0, 50).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition">
                    <td className="px-5 py-3.5 font-medium whitespace-nowrap">{item.date}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{item.zone}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">{item.sector}</td>
                    <td className="px-5 py-3.5 text-right font-mono font-medium">
                      {(item.actual_consumption_mld ?? item.water_consumption_mld ?? 0).toFixed(2)} MLD
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-slate-500">
                      {(item.expected_consumption_mld ?? item.water_supply_mld ?? 0).toFixed(2)} MLD
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={item.severity} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 max-w-md">
                      {item.explanation || item.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredList.length > 50 && (
              <div className="p-3 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                Showing top 50 anomalies. Export CSV to view the entire set.
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            No anomaly events found matching current criteria.
          </div>
        )}
      </div>
    </div>
  );
};
