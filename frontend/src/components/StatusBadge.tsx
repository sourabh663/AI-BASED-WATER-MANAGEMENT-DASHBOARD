import React from 'react';

interface StatusBadgeProps {
  status: 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL' | string;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', showPulse = true }) => {
  const norm = status?.toUpperCase() || 'NORMAL';

  let badgeStyles = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
  let dotStyles = 'bg-emerald-500';

  if (norm === 'MODERATE') {
    badgeStyles = 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60';
    dotStyles = 'bg-sky-500';
  } else if (norm === 'HIGH') {
    badgeStyles = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
    dotStyles = 'bg-amber-500';
  } else if (norm === 'CRITICAL') {
    badgeStyles = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
    dotStyles = 'bg-rose-500';
  }

  const sizeStyles = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1 text-sm' : 'px-3 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${sizeStyles} ${badgeStyles}`}>
      <span className="relative flex h-2 w-2">
        {showPulse && (norm === 'CRITICAL' || norm === 'HIGH') && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotStyles}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotStyles}`} />
      </span>
      {norm}
    </span>
  );
};
