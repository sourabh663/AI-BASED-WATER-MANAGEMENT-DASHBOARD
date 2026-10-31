import React, { useState, useEffect } from 'react';
import { Cloud, Server, CheckCircle2, AlertCircle, RefreshCw, X, ExternalLink } from 'lucide-react';
import { getResolvedApiBase, setCustomApiUrl, getApiStatus, ApiConnectionStatus } from '../services/api';

interface BackendConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendConfigModal: React.FC<BackendConfigModalProps> = ({ isOpen, onClose }) => {
  const [apiUrl, setApiUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [status, setStatus] = useState<ApiConnectionStatus>('CONNECTING');

  useEffect(() => {
    if (isOpen) {
      const current = typeof window !== 'undefined' ? localStorage.getItem('AI_WATER_API_URL') || '' : '';
      setApiUrl(current);
      setStatus(getApiStatus());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const targetUrl = apiUrl.trim();
    if (!targetUrl) {
      setCustomApiUrl('');
      setTestResult({ success: true, message: 'Reset to default API endpoint. Reloading...' });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      return;
    }

    try {
      // Clean url
      const testEndpoint = targetUrl.replace(/\/+$/, '').replace(/\/api\/?$/, '') + '/api/overview/kpis';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(testEndpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        setCustomApiUrl(targetUrl);
        setTestResult({
          success: true,
          message: 'Connection successful! Connected to live FastAPI backend.'
        });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setTestResult({
          success: false,
          message: `Backend reached but returned status ${res.status}. Verify endpoint.`
        });
      }
    } catch (err: any) {
      // If direct fetch fails (e.g. CORS or cold-boot), still save if user wants
      setCustomApiUrl(targetUrl);
      setTestResult({
        success: true,
        message: 'Saved URL! If your Render backend is cold-booting, it may take 30-45s to awaken. Reloading...'
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Backend Connectivity Settings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure live FastAPI Cloud Server (Render / Localhost)
            </p>
          </div>
        </div>

        {/* Current Status Pill */}
        <div className="mb-5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                status === 'ONLINE_LIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {status === 'ONLINE_LIVE'
                ? 'Connected to Live Cloud API'
                : 'Using Authentic Municipal Baseline Dataset'}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
            9,075 records
          </span>
        </div>

        <form onSubmit={handleTestAndSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Live Backend API URL
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="e.g. https://your-backend.onrender.com"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Active endpoint: <code className="text-cyan-600 dark:text-cyan-400 font-mono">{getResolvedApiBase()}</code>
            </p>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={testing}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Testing & Connecting...
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  Save & Connect Backend
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setApiUrl('');
                setCustomApiUrl('');
                window.location.reload();
              }}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
