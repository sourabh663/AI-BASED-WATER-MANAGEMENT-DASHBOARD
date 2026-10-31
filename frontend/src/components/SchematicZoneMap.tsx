import React from 'react';
import { Waves, Droplets, MapPin, Activity, Info } from 'lucide-react';
import { ZoneItem } from '../types';
import { StatusBadge } from './StatusBadge';

interface SchematicZoneMapProps {
  zones: ZoneItem[];
  selectedZone: string | null;
  onSelectZone: (zoneName: string) => void;
}

export const SchematicZoneMap: React.FC<SchematicZoneMapProps> = ({
  zones,
  selectedZone,
  onSelectZone
}) => {
  // Schematic node positions on a 600x380 SVG canvas
  const nodePositions: Record<string, { x: number; y: number; label: string; role: string }> = {
    'Zone A': { x: 300, y: 190, label: 'Central Urban Core', role: 'Main Distribution Hub' },
    'Zone B': { x: 300, y: 65,  label: 'Northern Sector', role: 'High-Elevation Grid' },
    'Zone C': { x: 480, y: 160, label: 'Eastern Industrial Corridor', role: 'High-Demand Node' },
    'Zone D': { x: 420, y: 310, label: 'Southern Residential Basin', role: 'Downstream Gravity Grid' },
    'Zone E': { x: 120, y: 220, label: 'Western Agricultural Belt', role: 'Irrigation Feeder' }
  };

  const zoneMap = new Map(zones.map((z) => [z.zone, z]));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Schematic Municipal Distribution Network Map
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive topology showing primary trunk mains, node utilization, and reservoir feeds across Zones A-E
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 self-start sm:self-auto">
          <Info className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Click any zone node to inspect detailed telemetry</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden flex justify-center py-2">
        <svg
          viewBox="0 0 600 380"
          className="w-full max-w-[680px] h-auto select-none"
        >
          <defs>
            {/* Trunk Pipeline Flow Gradients */}
            <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>

            <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Central Reservoir Source */}
          <g transform="translate(40, 60)">
            <rect width="100" height="55" rx="12" fill="#0369a1" fillOpacity="0.1" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" />
            <Waves className="w-4 h-4 text-cyan-600" x="12" y="10" />
            <text x="32" y="22" fill="#0369a1" fontSize="10" fontWeight="bold">Central Res.</text>
            <text x="12" y="42" fill="#0284c7" fontSize="11" fontWeight="extrabold">70.4% Avg</text>
          </g>

          {/* Reservoir intake conduit to Zone E and Zone A */}
          <path d="M 140 85 Q 220 85 300 190" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
          <path d="M 90 115 L 120 220" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />

          {/* Inter-Zone Primary Trunk Mains */}
          {/* Zone A (Center) to Zone B (North) */}
          <line x1="300" y1="190" x2="300" y2="65" stroke="url(#pipeGrad)" strokeWidth="3" />
          {/* Zone A (Center) to Zone C (East) */}
          <line x1="300" y1="190" x2="480" y2="160" stroke="url(#pipeGrad)" strokeWidth="3.5" />
          {/* Zone A (Center) to Zone D (South) */}
          <line x1="300" y1="190" x2="420" y2="310" stroke="url(#pipeGrad)" strokeWidth="3" />
          {/* Zone A (Center) to Zone E (West) */}
          <line x1="300" y1="190" x2="120" y2="220" stroke="url(#pipeGrad)" strokeWidth="3" />
          {/* Zone B to Zone C inter-feeder */}
          <path d="M 300 65 Q 400 80 480 160" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
          {/* Zone C to Zone D inter-feeder */}
          <path d="M 480 160 Q 480 250 420 310" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
          {/* Zone E to Zone D inter-feeder */}
          <path d="M 120 220 Q 250 320 420 310" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" />

          {/* Render Zone Nodes */}
          {Object.entries(nodePositions).map(([zoneName, pos]) => {
            const zData = zoneMap.get(zoneName);
            const isSelected = selectedZone === zoneName;
            const isCritical = zData?.demand_status === 'CRITICAL';
            const isHigh = zData?.demand_status === 'HIGH';

            let nodeFill = '#0284c7';
            if (isCritical) nodeFill = '#e11d48';
            else if (isHigh) nodeFill = '#d97706';

            return (
              <g
                key={zoneName}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => onSelectZone(zoneName)}
                className="cursor-pointer transition-transform hover:scale-105"
                filter="url(#nodeGlow)"
              >
                {/* Node Ring & Click Target */}
                <circle
                  r={isSelected ? 32 : 26}
                  fill="white"
                  className="dark:fill-slate-900"
                  stroke={isSelected ? '#06b6d4' : nodeFill}
                  strokeWidth={isSelected ? 4 : 2.5}
                />

                {/* Pulse ring for high demand */}
                {(isCritical || isHigh) && (
                  <circle
                    r={34}
                    fill="none"
                    stroke={nodeFill}
                    strokeWidth="1.5"
                    opacity="0.6"
                    className="animate-ping"
                  />
                )}

                {/* Node Center Label */}
                <text
                  textAnchor="middle"
                  dy="-3"
                  fontSize="12"
                  fontWeight="bold"
                  fill={nodeFill}
                >
                  {zoneName.replace('Zone ', '')}
                </text>

                <text
                  textAnchor="middle"
                  dy="12"
                  fontSize="8"
                  fontWeight="bold"
                  className="fill-slate-600 dark:fill-slate-400"
                >
                  {zData ? `${zData.utilization_ratio}%` : ''}
                </text>

                {/* Node Label Box Below */}
                <g transform="translate(0, 36)">
                  <rect
                    x="-65"
                    y="0"
                    width="130"
                    height="32"
                    rx="8"
                    className="fill-white/95 dark:fill-slate-900/95 stroke-slate-200 dark:stroke-slate-800"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="13"
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="bold"
                    className="fill-slate-900 dark:fill-slate-100"
                  >
                    {zoneName}
                  </text>
                  <text
                    x="0"
                    y="25"
                    textAnchor="middle"
                    fontSize="8"
                    className="fill-slate-500 dark:fill-slate-400"
                  >
                    {zData ? `${zData.total_consumption_mld.toLocaleString()} MLD` : pos.label}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Normal (&lt;85%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Moderate (85-95%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> High (95-102%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical (&gt;102%)
          </span>
        </div>
        <span className="text-[11px] font-mono">Schematic Projection &bull; Certified Municipal Dataset</span>
      </div>
    </div>
  );
};
