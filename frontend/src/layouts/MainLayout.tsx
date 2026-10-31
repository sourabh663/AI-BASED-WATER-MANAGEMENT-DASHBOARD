import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  LineChart,
  MapPin,
  PieChart,
  BrainCircuit,
  CloudSun,
  Lightbulb,
  Gauge,
  Database,
  Settings,
  Menu,
  X,
  Droplets,
  Bell,
  Search,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Sun,
  Moon,
  Bot,
  Scale,
  FileText,
  Cloud,
  Server
} from 'lucide-react';
import { api, getNotifications, getApiStatus, subscribeApiStatus, ApiConnectionStatus } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { BackendConfigModal } from '../components/BackendConfigModal';

interface NavGroup {
  group: string;
  items: {
    name: string;
    path: string;
    icon: any;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    group: 'Operations',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'Consumption Analytics', path: '/consumption', icon: LineChart },
      { name: 'Zone Monitoring', path: '/zones', icon: MapPin },
      { name: 'Sector Analysis', path: '/sectors', icon: PieChart },
      { name: 'Water Balance', path: '/water-balance', icon: Scale, badge: 'New' },
    ]
  },
  {
    group: 'AI & Intelligence',
    items: [
      { name: 'AI Demand Prediction', path: '/prediction', icon: BrainCircuit },
      { name: 'AI Water Assistant', path: '/assistant', icon: Bot, badge: 'AI' },
      { name: 'Anomaly Detection', path: '/anomalies', icon: ShieldAlert, badge: 'ML' },
      { name: 'Environmental Analytics', path: '/environment', icon: CloudSun },
      { name: 'AI Recommendations', path: '/recommendations', icon: Lightbulb },
    ]
  },
  {
    group: 'Governance & System',
    items: [
      { name: 'Model Performance', path: '/model-performance', icon: Gauge },
      { name: 'Executive Reports', path: '/reports', icon: FileText, badge: 'PDF' },
      { name: 'Notification Center', path: '/notifications', icon: Bell },
      { name: 'Data Management', path: '/data-management', icon: Database },
      { name: 'Settings', path: '/settings', icon: Settings },
    ]
  }
];

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifs, setRecentNotifs] = useState<any[]>([]);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiConnectionStatus>(getApiStatus());

  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribeApiStatus((s) => setApiStatus(s));
    return () => unsub();
  }, []);

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await getNotifications();
        setUnreadCount(res.unread_count);
        setRecentNotifs(res.notifications.slice(0, 5));
      } catch (e) {
        // quiet fallback
      }
    };
    fetchNotifs();
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('assist') || q.includes('chat') || q.includes('ask') || q.includes('bot')) {
      navigate('/assistant');
    } else if (q.includes('anomaly') || q.includes('outlier') || q.includes('spike')) {
      navigate('/anomalies');
    } else if (q.includes('balance') || q.includes('supply') || q.includes('deficit')) {
      navigate('/water-balance');
    } else if (q.includes('report') || q.includes('pdf') || q.includes('brief') || q.includes('print')) {
      navigate('/reports');
    } else if (q.includes('notif') || q.includes('alert')) {
      navigate('/notifications');
    } else if (q.includes('pred') || q.includes('demand') || q.includes('forecast')) {
      navigate('/prediction');
    } else if (q.includes('zone')) {
      navigate('/zones');
    } else if (q.includes('sector')) {
      navigate('/sectors');
    } else if (q.includes('env') || q.includes('temp') || q.includes('rain')) {
      navigate('/environment');
    } else if (q.includes('rec') || q.includes('action')) {
      navigate('/recommendations');
    } else if (q.includes('model') || q.includes('perf')) {
      navigate('/model-performance');
    } else if (q.includes('data') || q.includes('csv') || q.includes('upload')) {
      navigate('/data-management');
    } else if (q.includes('consum')) {
      navigate('/consumption');
    } else {
      navigate('/data-management');
    }
    setSearchQuery('');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ease-in-out shadow-sm ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20 flex-shrink-0">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                  AI Water Intelligence
                </span>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold tracking-tight truncate">
                  Intelligent Decision Platform
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  {group.group}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      } ${collapsed ? 'justify-center px-0' : ''}`
                    }
                    title={collapsed ? item.name : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400'
                            }`}
                          />
                          {!collapsed && <span className="truncate">{item.name}</span>}
                        </div>
                        {!collapsed && item.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* System Tagline Footer */}
        {!collapsed && (
          <div 
            onClick={() => setConfigModalOpen(true)}
            className="p-3 m-3 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-blue-950/40 border border-cyan-100 dark:border-slate-800 cursor-pointer hover:border-cyan-300 dark:hover:border-cyan-700 transition"
            title="Click to configure backend API connectivity"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-300 text-[11px] font-bold">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    apiStatus === 'ONLINE_LIVE' ? 'bg-emerald-400' : 'bg-cyan-400'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    apiStatus === 'ONLINE_LIVE' ? 'bg-emerald-500' : 'bg-cyan-500'
                  }`}></span>
                </span>
                <span>{apiStatus === 'ONLINE_LIVE' ? 'Live Cloud API' : 'Municipal Telemetry Active'}</span>
              </div>
              <Cloud className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              "Transforming Water Data into Smarter Decisions."
            </p>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex flex-col">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Intelligent Water Resource Management
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                AI Water Intelligence Dashboard &bull; Municipal Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search assistant, anomalies, balance..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-52 lg:w-64 pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-400"
              />
            </form>

            {/* API Connection Indicator & Configuration Button */}
            <button
              onClick={() => setConfigModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold hover:border-cyan-400 dark:hover:border-cyan-600 transition"
              title="Configure Live Backend API"
            >
              <span className={`w-2 h-2 rounded-full ${
                apiStatus === 'ONLINE_LIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-cyan-500'
              }`} />
              <span className="hidden sm:inline text-slate-700 dark:text-slate-300 text-[11px]">
                {apiStatus === 'ONLINE_LIVE' ? 'Cloud API' : 'Dataset Telemetry'}
              </span>
              <Cloud className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Current Date Badge */}
            <div className="hidden xl:flex items-center px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span>{todayFormatted}</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Municipal Alerts"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700 p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                      Municipal Alerts ({unreadCount} Unread)
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Close
                    </button>
                  </div>
                  <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                    {recentNotifs.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                        No alerts pending review.
                      </div>
                    ) : (
                      recentNotifs.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-xs"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                            <span>{notif.title}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                              notif.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                            }`}>
                              {notif.priority}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-center">
                    <NavLink
                      to="/notifications"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Open Full Notification Center &rarr;
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                MW
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">Municipal Ops</span>
                <span className="text-[10px] text-slate-400 font-medium">Urban Water Board</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Backend Configuration Modal */}
        <BackendConfigModal isOpen={configModalOpen} onClose={() => setConfigModalOpen(false)} />
      </div>
    </div>
  );
};
