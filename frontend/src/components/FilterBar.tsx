import React from 'react';
import { Filter, RotateCcw, Calendar, MapPin, Building2, RefreshCw, Clock } from 'lucide-react';

interface FilterBarProps {
  startDate?: string;
  endDate?: string;
  selectedZone: string;
  selectedSector: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  onZoneChange: (zone: string) => void;
  onSectorChange: (sector: string) => void;
  onReset: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  startDate = '',
  endDate = '',
  selectedZone,
  selectedSector,
  onStartDateChange,
  onEndDateChange,
  onZoneChange,
  onSectorChange,
  onReset,
  onRefresh,
  isRefreshing = false
}) => {
  const zones = ['All', 'Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'];
  const sectors = ['All', 'Agriculture', 'Commercial', 'Industrial', 'Institutional', 'Residential'];

  const handleQuickPreset = (preset: '7d' | '30d' | 'all') => {
    if (!onStartDateChange || !onEndDateChange) return;
    if (preset === '7d') {
      onStartDateChange('2026-12-23');
      onEndDateChange('2026-12-30');
    } else if (preset === '30d') {
      onStartDateChange('2026-12-01');
      onEndDateChange('2026-12-30');
    } else if (preset === 'all') {
      onStartDateChange('');
      onEndDateChange('');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 mb-6 transition-colors">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider pl-1">
          <Filter className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Filters:</span>
        </div>

        {/* Zone Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Zone:</span>
          <select
            value={selectedZone}
            onChange={(e) => onZoneChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
          >
            {zones.map((z) => (
              <option key={z} value={z} className="dark:bg-slate-800">{z}</option>
            ))}
          </select>
        </div>

        {/* Sector Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5">
          <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sector:</span>
          <select
            value={selectedSector}
            onChange={(e) => onSectorChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
          >
            {sectors.map((s) => (
              <option key={s} value={s} className="dark:bg-slate-800">{s}</option>
            ))}
          </select>
        </div>

        {/* Date Filters */}
        {onStartDateChange && (
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              min="2026-01-02"
              max="2026-12-30"
              onChange={(e) => onStartDateChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            />
          </div>
        )}

        {onEndDateChange && (
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              min="2026-01-02"
              max="2026-12-30"
              onChange={(e) => onEndDateChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            />
          </div>
        )}

        {/* Quick presets */}
        {onStartDateChange && onEndDateChange && (
          <div className="hidden xl:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleQuickPreset('7d')}
              className="px-2 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg"
            >
              Last 7D
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('30d')}
              className="px-2 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg"
            >
              Last 30D
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('all')}
              className="px-2 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg"
            >
              Full Year
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          title="Reset all filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
