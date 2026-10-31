import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, ArrowDown, Droplets, Activity, 
  Waves, ShieldCheck, Database, Cpu, Compass, CheckCircle2 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface HeroSectionProps {
  totalConsumption?: number;
  totalSupply?: number;
  predictedDemand?: number;
  reservoirLevel?: number;
  onExploreClick?: () => void;
}

const miniSparklineData = [
  { day: 'Mon', value: 245 },
  { day: 'Tue', value: 252 },
  { day: 'Wed', value: 248 },
  { day: 'Thu', value: 260 },
  { day: 'Fri', value: 275 },
  { day: 'Sat', value: 268 },
  { day: 'Sun', value: 284 }
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  totalConsumption = 1040324,
  totalSupply = 1061695,
  predictedDemand = 284.5,
  reservoirLevel = 68.4,
  onExploreClick
}) => {
  const navigate = useNavigate();

  const handleExplore = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      const el = document.getElementById('dashboard-metrics');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-10 lg:p-12 shadow-xl border border-blue-900/40">
      {/* Background Decorative Fluid SVG Mesh */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="150" r="250" fill="url(#fluidGrad1)" filter="blur(80px)" />
          <circle cx="800" cy="350" r="300" fill="url(#fluidGrad2)" filter="blur(90px)" />
          <defs>
            <linearGradient id="fluidGrad1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="fluidGrad2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* LEFT COLUMN: Hero Copy & Actions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold tracking-wide shadow-xs backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span>AI-POWERED WATER INTELLIGENCE</span>
          </div>

          {/* Large Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
            Intelligent Water <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
              Resource Management
            </span>
          </h1>

          {/* Supporting Description */}
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Monitor water consumption, analyse distribution patterns, forecast future demand and generate actionable insights using artificial intelligence and machine learning.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
            <button
              onClick={handleExplore}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 group active:scale-95"
            >
              <span>Explore Dashboard</span>
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/prediction')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition-all duration-200 group active:scale-95"
            >
              <span>View AI Predictions</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-cyan-400" />
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-200">Data Analytics</div>
                <div className="text-[11px] text-slate-400">9,075 Verified Records</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-200">Predictive Intelligence</div>
                <div className="text-[11px] text-slate-400">XGBoost &bull; 99.9% R²</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-200">Resource Planning</div>
                <div className="text-[11px] text-slate-400">5 Zones &bull; 5 Sectors</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Water Intelligence Visualization Cockpit */}
        <div className="lg:col-span-5 relative">
          {/* Main Visual Glassmorphic Card */}
          <div className="relative bg-slate-900/85 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
            {/* Top Cockpit Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">Live Municipal Telemetry</div>
                  <div className="text-[10px] text-slate-400">Zone Distribution Grid Active</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>

            {/* Central Forecast Chart Preview */}
            <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">7-Day Demand Forecast Trend</span>
                <span className="font-mono text-cyan-400 font-bold">{predictedDemand} MLD</span>
              </div>
              <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={miniSparklineData}>
                    <defs>
                      <linearGradient id="heroAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#06b6d4" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#heroAreaGrad)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* KPI Metrics Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800 text-left">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Total Consumption
                </span>
                <div className="text-lg font-black text-white mt-0.5 font-mono">
                  {totalConsumption.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">MLD</span>
                </div>
                <div className="text-[10px] text-cyan-400 mt-0.5 flex items-center gap-1">
                  <span>Supply:</span>
                  <span className="font-semibold text-slate-300">{totalSupply.toLocaleString()} MLD</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800 text-left">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Reservoir Level
                </span>
                <div className="text-lg font-black text-emerald-400 mt-0.5 font-mono">
                  {reservoirLevel}%
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                    style={{ width: `${reservoirLevel}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Zone Telemetry Live Indicators */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Municipal Zones:</span>
              <div className="flex items-center gap-2">
                {['A', 'B', 'C', 'D', 'E'].map((z) => (
                  <span 
                    key={z}
                    className="px-2 py-0.5 rounded-md bg-blue-950 border border-cyan-800/60 text-cyan-300 font-bold text-[10px]"
                  >
                    Zone {z}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Glass Accent Pill 1 (Top Right) */}
          <div className="hidden sm:flex absolute -top-4 -right-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-400/40 backdrop-blur-md shadow-lg items-center gap-2 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-200 font-semibold">99.9% Prediction Confidence</span>
          </div>

          {/* Floating Glass Accent Pill 2 (Bottom Left) */}
          <div className="hidden sm:flex absolute -bottom-3 -left-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-400/40 backdrop-blur-md shadow-lg items-center gap-2 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-200 font-semibold">Mass Balance Accounting Active</span>
          </div>
        </div>
      </div>
    </section>
  );
};
