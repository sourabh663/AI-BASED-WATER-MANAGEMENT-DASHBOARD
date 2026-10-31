import React from 'react';
import { Droplets } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading municipal water data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[350px]">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-4 border-cyan-100 border-t-cyan-600 animate-spin" />
        <Droplets className="w-6 h-6 text-cyan-600 absolute animate-pulse" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-600">{message}</p>
      <p className="text-xs text-slate-400 mt-1">From Water Data to Intelligent Decisions</p>
    </div>
  );
};
