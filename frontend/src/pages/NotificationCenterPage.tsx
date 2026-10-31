import React, { useState, useEffect } from 'react';
import { 
  Bell, CheckCircle2, ShieldAlert, AlertTriangle, Info, 
  Check, ArrowRight, RefreshCw, Filter, Trash2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { NotificationItem, NotificationResponse } from '../types';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const NotificationCenterPage: React.FC = () => {
  const [data, setData] = useState<NotificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications(
        unreadOnly, 
        priorityFilter !== 'ALL' ? priorityFilter : undefined
      );
      setData(res);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [unreadOnly, priorityFilter]);

  const handleMarkAsRead = async (id: string | number) => {
    try {
      await markNotificationRead(id);
      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          unread_count: Math.max(0, prev.unread_count - 1),
          notifications: prev.notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
        };
      });
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          unread_count: 0,
          notifications: prev.notifications.map(n => ({ ...n, is_read: true }))
        };
      });
    } catch (err) {
      console.error('Failed to mark all notifications read', err);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">HIGH</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">NORMAL</span>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'anomaly':
        return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'prediction':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-cyan-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Municipal Alert & Notification Center</h1>
              {data && data.unread_count > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-600 text-white">
                  {data.unread_count} Unread
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Real-time feed of anomalous consumption events, reservoir capacity thresholds, and system alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadNotifications}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          {data && data.unread_count > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUnreadOnly(false)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
              !unreadOnly
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setUnreadOnly(true)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
              unreadOnly
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Unread Only {data ? `(${data.unread_count})` : ''}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Filter by Priority:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'NORMAL'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 text-xs rounded-lg transition ${
                priorityFilter === p
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700">
            <LoadingSkeleton count={4} />
          </div>
        ) : data && data.notifications.length > 0 ? (
          data.notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 rounded-2xl border transition shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                notif.is_read
                  ? 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-80'
                  : 'bg-white dark:bg-slate-800 border-l-4 border-l-blue-600 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex-shrink-0">
                  {getCategoryIcon(notif.category)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {notif.title}
                    </span>
                    {getPriorityBadge(notif.priority)}
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="text-[11px] text-slate-400">
                    {new Date(notif.timestamp).toLocaleString()} &bull; Category: {notif.category}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {notif.link && (
                  <button
                    onClick={() => navigate(notif.link!)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                    title="Mark as Read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-slate-200 dark:border-slate-700 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-500" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">All Clear</h3>
            <p className="text-xs text-slate-500 mt-1">There are no unread notifications or critical alerts matching your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
