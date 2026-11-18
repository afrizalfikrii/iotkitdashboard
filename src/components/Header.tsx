import React from 'react';
import { ConnectionStatus, FirebaseConfig } from '../types';
import { Settings, RefreshCw, Cpu, LayoutGrid, ToggleLeft, Activity, Terminal } from 'lucide-react';

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
  const getStatusBadge = (isCompact = false) => {
    switch (status) {
      case 'connected':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Online</span>
            {latencyMs !== null && !isCompact && (
              <span className="text-[11px] font-mono text-emerald-600/80 pl-1 border-l border-emerald-200">
                {latencyMs}ms
              </span>
            )}
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-medium animate-pulse">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            <span>Menghubungkan</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            <span>Terputus</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-slate-400"></span>
            <span>Standby</span>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 pt-3 pb-2">
      <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs px-3.5 sm:px-5 py-2.5">

        {/* MOBILE VIEW */}
        <div className="flex flex-col gap-2 md:hidden">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white shrink-0">
                <Cpu className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold tracking-tight text-slate-900">
                    IoT-KIT
                  </h1>
                  <span className="text-[11px] font-medium text-slate-400">
                    Praktikum
                  </span>
                </div>
                <button
                  onClick={onOpenConfig}
                  className="text-[11px] text-slate-500 hover:text-slate-900 font-mono flex items-center gap-1 cursor-pointer"
                >
                  <span>User: /{config.devicePrefix || 'root'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {getStatusBadge(true)}
              <button
                onClick={onReconnect}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors active:scale-95 cursor-pointer"
                title="Muat Ulang Koneksi"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {/* Left: Clean Branding & Clickable User */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center text-white shrink-0">
              <Cpu className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <h1 className="text-sm font-extrabold tracking-tight text-slate-900">
                  IoT-KIT
                </h1>
                <span className="text-xs font-medium text-slate-400">
                  Praktikum
                </span>
              </div>
              <button
                onClick={onOpenConfig}
                className="text-[11px] text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                title="Klik untuk mengubah User ID"
              >
                <span>User:</span>
                <span className="font-mono font-semibold text-slate-700 hover:underline underline-offset-2">
                  /{config.devicePrefix || 'root'}
                </span>
              </button>
            </div>
          </div>

          {/* Center: Clean Segmented View Tabs */}
          <div className="flex items-center p-1 bg-slate-100/80 rounded-xl text-xs font-semibold text-slate-500">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Semua</span>
            </button>
            <button
              onClick={() => setActiveTab('switches')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'switches'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <ToggleLeft className="w-3.5 h-3.5" />
              <span>Sakelar</span>
            </button>
            <button
              onClick={() => setActiveTab('sensors')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'sensors'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Sensor & Gauge</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Log</span>
            </button>
          </div>

          {/* Right: Status, Ghost Refresh & Primary Config */}
          <div className="flex items-center gap-2">
            {getStatusBadge(false)}
            <button
              onClick={onReconnect}
              title="Muat Ulang Koneksi"
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenConfig}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
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
