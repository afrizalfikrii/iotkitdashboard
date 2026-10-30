import React from 'react';
import { LayoutGrid, ToggleLeft, Activity, Terminal, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'all' | 'switches' | 'sensors' | 'logs';
  setActiveTab: (tab: 'all' | 'switches' | 'sensors' | 'logs') => void;
  onOpenConfig: () => void;
  isConfigured: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenConfig,
  isConfigured
}) => {
  const tabs = [
    { id: 'all' as const, label: 'Semua', icon: LayoutGrid },
    { id: 'switches' as const, label: 'Sakelar', icon: ToggleLeft },
    { id: 'sensors' as const, label: 'Sensor', icon: Activity },
    { id: 'logs' as const, label: 'Log', icon: Terminal },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/92 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] px-3 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-90 ${
                isActive
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div
                className={`w-9 h-8 rounded-xl flex items-center justify-center transition-all ${
                  isActive ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Configuration Button in Bottom Bar */}
        <button
          onClick={onOpenConfig}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 hover:text-slate-800 font-medium transition-all active:scale-90 relative"
          title="Buka Pengaturan Firebase"
        >
          <div className="w-9 h-8 rounded-xl flex items-center justify-center bg-slate-100 text-slate-700 relative">
            <Settings className="w-4 h-4" />
            {!isConfigured && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
            {!isConfigured && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            Atur
          </span>
        </button>
      </div>
    </nav>
  );
};
