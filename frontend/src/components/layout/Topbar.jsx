import React, { useState, useEffect } from 'react';
import {
  Menu,
  Volume2,
  VolumeX,
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  Bell,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '../../features/useAuthStore';
import { useUIStore } from '../../features/useUIStore';
import { getPendingCount, syncPendingReports } from '../../services/offlineSync';

export function Topbar() {
  const { user, language, setLanguage } = useAuthStore();
  const { toggleSidebar, audioAlertsEnabled, toggleAudioAlerts } = useUIStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Poll pending reports count
    const interval = setInterval(async () => {
      const count = await getPendingCount();
      setPendingCount(count);
    }, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncPendingReports();
      const count = await getPendingCount();
      setPendingCount(count);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="h-16 tactical-glass-header px-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Live Status Ticker */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-400">TELEMETRY STREAM:</span>
          <span className="text-emerald-400 font-semibold">LIVE (2.5s INTERVAL)</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Offline / Online Sync Widget */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 rounded-lg text-xs font-semibold">
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ONLINE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/80 border border-red-700 text-red-300 rounded-lg text-xs font-bold animate-pulse">
              <WifiOff className="w-3.5 h-3.5" />
              <span>OFFLINE (PWA STORED)</span>
            </div>
          )}

          {pendingCount > 0 && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing || !isOnline}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/80 border border-amber-700/80 text-amber-300 rounded-lg text-xs font-bold hover:bg-amber-900 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync Queue ({pendingCount})</span>
            </button>
          )}
        </div>

        {/* Multilingual Selector */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="en" className="bg-slate-900 text-slate-100">English (EN)</option>
            <option value="as" className="bg-slate-900 text-slate-100">অসমীয়া (AS)</option>
            <option value="bn" className="bg-slate-900 text-slate-100">বাংলা (BN)</option>
            <option value="hi" className="bg-slate-900 text-slate-100">हिन्दी (HI)</option>
          </select>
        </div>

        {/* Audio Alert Toggle */}
        <button
          onClick={toggleAudioAlerts}
          title={audioAlertsEnabled ? 'Audio Alerts Enabled' : 'Audio Alerts Muted'}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition cursor-pointer"
        >
          {audioAlertsEnabled ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* User Identity Chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-300 font-bold text-xs">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-200 leading-none">{user?.name || 'Officer'}</p>
            <p className="text-[10px] text-slate-400 font-medium capitalize mt-0.5">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
