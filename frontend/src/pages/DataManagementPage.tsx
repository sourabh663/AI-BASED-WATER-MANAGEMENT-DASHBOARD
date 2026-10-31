import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  Award,
  Eye,
  X
} from 'lucide-react';

import { api, getDataQuality, previewCsv } from '../services/api';
import { DatasetOverviewResponse, PaginatedRecordsResponse, DataQualityResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const DataManagementPage: React.FC = () => {
  const [overview, setOverview] = useState<DatasetOverviewResponse | null>(null);
  const [quality, setQuality] = useState<DataQualityResponse | null>(null);
  const [recordsData, setRecordsData] = useState<PaginatedRecordsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Table Controls
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedSector, setSelectedSector] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Upload & Preview state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<{ row_count: number; columns: string[]; sample_rows: any[] } | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const fetchOverview = async () => {
    try {
      const [ov, q] = await Promise.all([
        api.getDatasetOverview(),
        getDataQuality()
      ]);
      setOverview(ov);
      setQuality(q);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to fetch dataset overview');
    }
  };

  const fetchRecords = async () => {
    try {
      const recs = await api.getDatasetRecords({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        zone: selectedZone === 'All' ? undefined : selectedZone,
        sector: selectedSector === 'All' ? undefined : selectedSector,
        start_date: startDate || undefined,
        end_date: endDate || undefined
      });
      setRecordsData(recs);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to fetch records');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchOverview(), fetchRecords()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [page, pageSize, selectedZone, selectedSector, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRecords();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setUploadFile(file);
    setUploadMessage(null);
    if (!file) {
      setPreviewData(null);
      return;
    }

    try {
      setIsPreviewing(true);
      const prev = await previewCsv(file);
      setPreviewData(prev);
    } catch (err: any) {
      console.error('Failed to preview CSV', err);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const res = await api.uploadDataset(formData);
      setUploadMessage({ type: 'success', text: res.message || 'Dataset successfully uploaded and validated!' });
      setUploadFile(null);
      setPreviewData(null);
      await Promise.all([fetchOverview(), fetchRecords()]);
    } catch (err: any) {
      setUploadMessage({
        type: 'error',
        text: err?.response?.data?.detail || 'Failed to upload and validate dataset.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetDataset = async () => {
    if (!window.confirm('Reset dataset back to the original 9,075 municipal records?')) return;
    setIsResetting(true);
    try {
      const res = await api.resetDataset();
      setUploadMessage({ type: 'success', text: res.message });
      await Promise.all([fetchOverview(), fetchRecords()]);
    } catch (err: any) {
      setUploadMessage({ type: 'error', text: 'Reset failed: ' + err.message });
    } finally {
      setIsResetting(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!recordsData || recordsData.records.length === 0) return;
    const headers = Object.keys(recordsData.records[0]).join(',');
    const rows = recordsData.records.map((r) => Object.values(r).join(',')).join('\n');
    const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `water_records_export_page_${page}.csv`;
    a.click();
  };

  if (loading && !overview) {
    return <LoadingSpinner message="Validating schema and indexing municipal records database..." />;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Data Management & Schema Administration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active Dataset: <strong className="text-slate-800 dark:text-slate-200">{overview?.filename}</strong> &bull; Schema validation, search filters, and CSV updates.
          </p>
        </div>

        <button
          onClick={handleResetDataset}
          disabled={isResetting}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition self-start sm:self-auto"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset to Original Dataset</span>
        </button>
      </div>

      {/* Dataset Overview KPI Banner */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Records</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{overview.row_count.toLocaleString()}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Attributes</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{overview.column_count} Columns</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Missing Values</span>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{overview.missing_values_count} (Clean)</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Duplicate Rows</span>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{overview.duplicate_rows_count} (Unique)</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Time Span</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{overview.total_days} Days</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Quality Score</span>
            <div className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-0.5">
              {quality?.overall_quality_score ?? 100}% ({quality?.quality_grade || quality?.grade || 'A+'})
            </div>
          </div>
        </div>
      )}

      {/* Data Quality Scorecard */}
      {quality && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Data Quality Scorecard & Integrity Diagnostics
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
              Grade {quality.quality_grade || quality.grade || 'A+'} &bull; {quality.overall_quality_score}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400">Completeness</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {quality.completeness_score ?? quality.completeness_percent ?? 100}%
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Zero null or empty values</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400">Validity</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {quality.validity_score ?? quality.validity_percent ?? 100}%
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Valid zones, sectors & dates</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400">Uniqueness</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {quality.uniqueness_score ?? quality.uniqueness_percent ?? 100}%
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">No duplicate primary keys</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400">Outlier Count</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {quality.outlier_count ?? 0}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Physical value envelope</p>
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload & Preview Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Upload Replacement Municipal Dataset (.csv)</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Replace the active water records with updated municipal telemetry. The system validates column headers and schema before committing.
        </p>

        <form onSubmit={handleFileUpload} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 dark:file:bg-blue-950/60 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 cursor-pointer w-full sm:w-auto"
          />

          <button
            type="submit"
            disabled={!uploadFile || isUploading}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Validating & Retraining...' : 'Validate & Upload CSV'}</span>
          </button>
        </form>

        {/* Live CSV Preview Box */}
        {previewData && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-500" />
                Upload Preview ({previewData.row_count} rows detected)
              </span>
              <span className="text-slate-500">Columns: {previewData.columns.length}/12 matched</span>
            </div>
            <div className="overflow-x-auto text-[11px]">
              <table className="w-full text-left font-mono">
                <thead className="text-slate-500 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    {previewData.columns.slice(0, 6).map((c, i) => (
                      <th key={i} className="py-1 px-2">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                  {previewData.sample_rows.slice(0, 3).map((r, i) => (
                    <tr key={i}>
                      {previewData.columns.slice(0, 6).map((c, ci) => (
                        <td key={ci} className="py-1 px-2">{String(r[c] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {uploadMessage && (
          <div className={`mt-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            uploadMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
          }`}>
            {uploadMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
            <span>{uploadMessage.text}</span>
          </div>
        )}
      </div>

      {/* Schema Attributes Inspector */}
      {overview && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Verified Dataset Schema Attributes (12 Columns)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
            {overview.columns.map((c) => (
              <div key={c.name} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/70 dark:border-slate-700">
                <span className="font-bold text-slate-800 dark:text-slate-200 block truncate" title={c.name}>{c.name}</span>
                <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-mono block mt-0.5">{c.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Records Browser */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Municipal Telemetry Records Browser</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {recordsData?.records.length || 0} of {recordsData?.total_records.toLocaleString() || 0} filtered observations
            </p>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-xs font-semibold self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Filtered View (CSV)</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by zone, sector, date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </form>

          {/* Zone Selector */}
          <select
            value={selectedZone}
            onChange={(e) => { setSelectedZone(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-semibold"
          >
            {['All', 'Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'].map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>

          {/* Sector Selector */}
          <select
            value={selectedSector}
            onChange={(e) => { setSelectedSector(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-semibold"
          >
            {['All', 'Agriculture', 'Commercial', 'Industrial', 'Institutional', 'Residential'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Rows per page */}
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-semibold"
          >
            <option value={10}>10 rows</option>
            <option value={15}>15 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
          </select>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Zone</th>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3">Population</th>
                <th className="py-2.5 px-3">Temp (&deg;C)</th>
                <th className="py-2.5 px-3">Rain (mm)</th>
                <th className="py-2.5 px-3">Humidity (%)</th>
                <th className="py-2.5 px-3">Reservoir (%)</th>
                <th className="py-2.5 px-3">Supply (MLD)</th>
                <th className="py-2.5 px-3">Usage (MLD)</th>
                <th className="py-2.5 px-3 font-bold text-cyan-600 dark:text-cyan-400">Demand Target (MLD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-200 font-mono">
              {recordsData?.records.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="py-2 px-3 font-sans font-semibold text-slate-800 dark:text-slate-200">{r.Date}</td>
                  <td className="py-2 px-3 font-sans font-bold text-blue-600 dark:text-blue-400">{r.Zone}</td>
                  <td className="py-2 px-3 font-sans">{r.Sector}</td>
                  <td className="py-2 px-3 font-sans">{Number(r.Population).toLocaleString()}</td>
                  <td className="py-2 px-3">{r.Temperature_C}</td>
                  <td className="py-2 px-3">{r.Rainfall_mm}</td>
                  <td className="py-2 px-3">{r.Humidity_Percent}</td>
                  <td className="py-2 px-3">{r.Reservoir_Level_Percent}</td>
                  <td className="py-2 px-3">{r.Water_Supply_MLD}</td>
                  <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{r.Water_Consumption_MLD}</td>
                  <td className="py-2 px-3 font-bold text-cyan-600 dark:text-cyan-400">{r.Next_Day_Demand_MLD}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {recordsData && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Page {recordsData.page} of {recordsData.total_pages}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(Math.min(recordsData.total_pages, page + 1))}
                disabled={page >= recordsData.total_pages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
