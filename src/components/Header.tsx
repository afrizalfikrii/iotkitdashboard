import React, { useState, useEffect } from 'react';
import { ConnectionStatus, FirebaseConfig } from '../types';
import { Settings, RefreshCw, Cpu, User, LayoutGrid, ToggleLeft, Activity, Terminal } from 'lucide-react';

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

  const getStatusBadge = (isCompact = false) => {
    switch (status) {
      case 'connected':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Online</span>
            {latencyMs !== null && !isCompact && (
              <span className="text-[11px] font-mono text-emerald-700/80 pl-1 border-l border-emerald-300">
                {latencyMs}ms
              </span>
            )}
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium animate-pulse">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            <span>Menghubungkan</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            <span>Terputus</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-slate-400"></span>
            <span>Standby</span>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 pt-3 pb-2">
      <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs px-3.5 sm:px-5 py-2.5 sm:py-3">
        
        {/* MOBILE VIEW (Clean 2-row layout: Row 1 = Brand & Status, Row 2 = Node Path Bar) */}
        <div className="flex flex-col gap-2 md:hidden">
          {/* Row 1: Brand & Status */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white shrink-0 shadow-2xs">
                <Cpu className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold tracking-tight text-slate-900">
                  IoT-KIT
                </h1>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/80">
                  Praktikum
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {getStatusBadge(true)}
              <button
                onClick={onReconnect}
                className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 flex items-center justify-center transition-colors shadow-2xs active:scale-95 cursor-pointer"
                title="Muat Ulang Koneksi"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Row 2: User Breadcrumb Bar */}
          <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-slate-400 text-[11px]">User:</span>
              <span className="font-mono font-medium text-slate-800 text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200/80 shadow-2xs">
                /{config.devicePrefix || 'root'}
              </span>
            </div>
            <button
              onClick={onOpenConfig}
              className="text-[11px] font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2 shrink-0 cursor-pointer"
            >
              Ubah
            </button>
          </div>
        </div>

        {/* DESKTOP VIEW (Spacious 3-column layout) */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {/* Left: Branding & User Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white shadow-xs shrink-0">
              <Cpu className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-900">
                  IoT-KIT
                </h1>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  Praktikum
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-slate-400">User:</span>
                <button
                  onClick={onOpenConfig}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-mono font-medium transition-colors cursor-pointer"
                  title="Klik untuk mengubah User ID"
                >
                  <User className="w-3 h-3 text-slate-500" />
                  <span>/{config.devicePrefix || 'root'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Center: Desktop Segmented View Tabs */}
          <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/60 text-xs font-semibold text-slate-600 justify-center">
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
          <div className="flex items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-600 font-mono text-xs font-medium border border-slate-200/80">
              {timeStr} WIB
            </div>
            {getStatusBadge(false)}
            <button
              onClick={onReconnect}
              title="Muat Ulang Koneksi"
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenConfig}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Konfigurasi</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
