import React, { useState, useEffect } from 'react';
import { ConnectionStatus, FirebaseConfig } from '../types';
import { Settings, RefreshCw, Cpu, Wifi, User, SlidersHorizontal, LayoutGrid, ToggleLeft, Activity, Terminal } from 'lucide-react';

interface HeaderProps {
  status: ConnectionStatus;
  config: FirebaseConfig;
  latencyMs: number | null;
  activeTab: 'all' | 'switches' | 'sensors' | 'logs';
  setActiveTab: (tab: 'all' | 'switches' | 'sensors' | 'logs') => void;
  onOpenConfig: () => void;
  onReconnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  config,
  latencyMs,
  activeTab,
  setActiveTab,
  onOpenConfig,
  onReconnect
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Online</span>
            {latencyMs !== null && (
              <span className="text-[11px] font-mono text-emerald-600/90 pl-1.5 border-l border-emerald-200">
                {latencyMs}ms
              </span>
            )}
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-medium animate-pulse">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            <span>Menghubungkan...</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            <span>Terputus</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs">
            <span className="h-2 w-2 rounded-full bg-slate-400"></span>
            <span>Standby</span>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 pt-3 pb-2">
      <div className="max-w-7xl mx-auto bg-white/85 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm px-4 sm:px-5 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Branding & User ID */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-900">
                  IoT-KIT
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Praktikum
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                <span>ESP User:</span>
                <button
                  onClick={onOpenConfig}
                  className="inline-flex items-center gap-1 font-mono font-bold text-xs text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-md transition-all shadow-2xs"
                  title="Klik untuk mengubah User ID sesuai kodingan ESP"
                >
                  <User className="w-3 h-3 text-indigo-500" />
                  <span>{config.devicePrefix || 'Semua (Root)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Right: Status & Configuration Button */}
          <div className="flex items-center gap-1.5 md:hidden shrink-0">
            {getStatusBadge()}
            <button
              onClick={onOpenConfig}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs active:scale-95 transition-all text-xs font-bold cursor-pointer"
              title="Buka Pengaturan Firebase"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Atur</span>
            </button>
          </div>
        </div>

        {/* Center: Clean Segmented View Tabs */}
        <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/60 text-xs font-semibold text-slate-600 w-full sm:w-auto justify-center">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'hover:text-slate-900 hover:bg-white/50 text-slate-600'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
            <span>Semua</span>
          </button>
          <button
            onClick={() => setActiveTab('switches')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'switches'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'hover:text-slate-900 hover:bg-white/50 text-slate-600'
            }`}
          >
            <ToggleLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sakelar</span>
          </button>
          <button
            onClick={() => setActiveTab('sensors')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'sensors'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'hover:text-slate-900 hover:bg-white/50 text-slate-600'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Sensor & Gauge</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'logs'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'hover:text-slate-900 hover:bg-white/50 text-slate-600'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-600" />
            <span>Log</span>
          </button>
        </div>

        {/* Right: Actions & Clock */}
        <div className="hidden md:flex items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 font-mono text-xs font-medium border border-slate-200/80">
            {timeStr} WIB
          </div>
          {getStatusBadge()}
          <button
            onClick={onReconnect}
            title="Muat Ulang Koneksi"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenConfig}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-xs hover:shadow transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Konfigurasi</span>
          </button>
        </div>
      </div>
    </header>
  );
};
