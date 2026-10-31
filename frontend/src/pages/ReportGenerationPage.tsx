import React, { useState } from 'react';
import { 
  FileText, Printer, Download, Sparkles, CheckSquare, 
  Calendar, Building2, MapPin, Layers, Award, Clock 
} from 'lucide-react';
import { generateReport } from '../services/api';
import { ReportGenerateResponse } from '../types';

export const ReportGenerationPage: React.FC = () => {
  const [title, setTitle] = useState('Executive Municipal Water Resources Brief');
  const [selectedDate, setSelectedDate] = useState('2024-12-30');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [includeSections, setIncludeSections] = useState({
    summary: true,
    sectors: true,
    predictions: true,
    recommendations: true,
    anomalies: true
  });
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportGenerateResponse | null>(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await generateReport({
        title,
        date: selectedDate,
        zone: selectedZone !== 'ALL' ? selectedZone : undefined,
        sector: selectedSector !== 'ALL' ? selectedSector : undefined,
        include_sections: Object.entries(includeSections)
          .filter(([_, v]) => v)
          .map(([k]) => k)
      });
      setReport(res);
    } catch (err) {
      console.error('Failed to generate report', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `water_intelligence_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header - hide on print */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Executive Report Generation</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                Print & PDF Ready
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Compile comprehensive water management reports for municipal directors and water resource committees.
            </p>
          </div>
        </div>

        {report && (
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        )}
      </div>

      {/* Report Generator Controls - hide on print */}
      <div className="print:hidden bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-500" />
          Report Parameters & Scope
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              Report Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              Evaluation Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
              Zone Filter
            </label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Zones</option>
              <option value="Zone A">Zone A</option>
              <option value="Zone B">Zone B</option>
              <option value="Zone C">Zone C</option>
              <option value="Zone D">Zone D</option>
              <option value="Zone E">Zone E</option>
            </select>
          </div>
        </div>

        {/* Section toggles */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">
            Sections to Include
          </label>
          <div className="flex flex-wrap gap-4 text-xs text-slate-700 dark:text-slate-300">
            {Object.entries({
              summary: 'Executive Summary',
              sectors: 'Sector Breakdown',
              predictions: 'Demand Predictions',
              recommendations: 'Actionable Recommendations',
              anomalies: 'Critical Outliers'
            }).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSections[key as keyof typeof includeSections]}
                  onChange={(e) => setIncludeSections(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm rounded-xl transition shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Synthesizing Report...' : 'Generate Executive Report'}</span>
        </button>
      </div>

      {/* Rendered Report Preview / Printable Canvas */}
      {report ? (
        <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-8 sm:p-12 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg space-y-8 print:shadow-none print:border-none print:p-0 print:m-0 print:text-black">
          {/* Municipal / Platform Header */}
          <div className="border-b border-slate-200 dark:border-slate-700 pb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest font-bold text-blue-600 dark:text-blue-400 mb-1">
                AI Water Intelligence Platform &bull; Municipal Water Analytics
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white print:text-black">
                {report.title}
              </h1>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Project: AI Water Intelligence Dashboard ("Transforming Water Data into Smarter Decisions.")
              </div>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div><span className="font-semibold text-slate-700 dark:text-slate-300">Generated:</span> {new Date(report.generated_at).toLocaleString()}</div>
              <div><span className="font-semibold text-slate-700 dark:text-slate-300">Period:</span> {report.period_start} to {report.period_end}</div>
              <div><span className="font-semibold text-slate-700 dark:text-slate-300">Scope:</span> {report.zone_filter} | {report.sector_filter}</div>
            </div>
          </div>

          {/* Section: Executive Summary & KPIs */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1. Executive Summary & Core Metrics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400">Total Consumption</div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {(report.executive_summary?.total_water_consumption_mld ?? 0).toFixed(1)} MLD
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400">Total Supply</div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {(report.executive_summary?.total_water_supply_mld ?? 0).toFixed(1)} MLD
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400">Net Accounting Gap</div>
                <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  +{(report.executive_summary?.net_balance_mld ?? 0).toFixed(1)} MLD
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400">Avg Reservoir Level</div>
                <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
                  {(report.executive_summary?.average_reservoir_level_pct ?? 0).toFixed(1)}%
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {report.executive_summary?.summary_statement || `Municipal supply stood at ${report.executive_summary?.total_water_supply_mld?.toFixed(1)} MLD against recorded consumption of ${report.executive_summary?.total_water_consumption_mld?.toFixed(1)} MLD.`}
            </p>
          </div>

          {/* Section: Sector Breakdown */}
          {report.sector_metrics && report.sector_metrics.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2. Sector Consumption Breakdown
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Sector</th>
                      <th className="px-4 py-2.5 text-right">Consumption (MLD)</th>
                      <th className="px-4 py-2.5 text-right">Share (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
                    {report.sector_metrics.map((s, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2.5 font-medium">{s.sector}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{(s.actual_consumption_mld ?? s.consumption ?? 0).toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold">{(s.percentage_share ?? s.share ?? 0).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: AI Forecasts */}
          {report.forecast_summary && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                3. Next-Day AI Demand Predictions & Accuracy
              </h2>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-800 dark:text-white">Active Model: {report.forecast_summary.active_model}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    MAE: {report.forecast_summary.mean_absolute_error_mld?.toFixed(3)} MLD &bull; RMSE: {report.forecast_summary.root_mean_squared_error_mld?.toFixed(3)} MLD &bull; R²: {report.forecast_summary.accuracy_r2?.toFixed(4)}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{report.forecast_summary.assessment}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
                    {report.forecast_summary.next_day_demand_mld?.toFixed(2)} MLD
                  </div>
                  <div className="text-[10px] text-slate-400">Aggregated Next-Day Forecast</div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Operational Recommendations */}
          {report.priority_recommendations && report.priority_recommendations.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                4. Actionable Decision Recommendations
              </h2>
              <div className="space-y-2">
                {report.priority_recommendations.map((rec, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700 text-xs flex items-start gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' :
                      rec.priority === 'HIGH' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                    }`}>
                      {rec.priority}
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{rec.action || rec.title}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{rec.rationale || rec.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report Footer / Engineering Team */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Project Engineering Team:</span> Anshul Upadhyay, Sourabh Singh, Khushi Walia, Amreen Shakeel Alvi
            </div>
            <div className="text-[11px]">
              Intelligent Municipal Water Management System
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-slate-200 dark:border-slate-700 text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-500" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Report Generated Yet</h3>
          <p className="text-xs text-slate-500 mt-1">Configure your parameters above and click "Generate Executive Report" to synthesize live findings.</p>
        </div>
      )}
    </div>
  );
};
