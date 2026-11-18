import React from 'react';
import { Code2, Download, Eye, ChevronDown, Tags } from 'lucide-react';
import {
  PRAKTIKUM_MODULES,
  PraktikumModule,
  prepareModuleCode,
  downloadModuleFile,
} from '../data/praktikumModules';
import { FirebaseConfig } from '../types';

interface ModuleDownloadBarProps {
  selectedModuleId: string;
  onSelectModuleId: (id: string) => void;
  onOpenModal: () => void;
  onApplyPreset: (mod: PraktikumModule) => void;
  currentConfig: FirebaseConfig;
}

export const ModuleDownloadBar: React.FC<ModuleDownloadBarProps> = ({
  selectedModuleId,
  onSelectModuleId,
  onOpenModal,
  onApplyPreset,
  currentConfig,
}) => {
  const selectedModule: PraktikumModule =
    PRAKTIKUM_MODULES.find((m) => m.id === selectedModuleId) || PRAKTIKUM_MODULES[0];

  const isConfigured = Boolean(
    currentConfig.databaseURL.trim() && currentConfig.apiKey.trim()
  );

  const handleQuickDownload = () => {
    const content = prepareModuleCode(selectedModule, currentConfig, isConfigured);
    downloadModuleFile(selectedModule.fileName, content);
  };

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 sm:px-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
      {/* Left Label */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <Code2 className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
              Source Code Praktikum (.ino)
            </h2>
            {isConfigured && selectedModule.usesFirebase && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Auto-isi Firebase Aktif
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {selectedModule.description}
          </p>
        </div>
      </div>

      {/* Right Controls: Dropdown + Preview + Download */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
        <div className="relative sm:w-64 lg:w-72">
          <select
            aria-label="Pilih Modul Praktikum"
            value={selectedModuleId}
            onChange={(e) => onSelectModuleId(e.target.value)}
            className="w-full appearance-none bg-slate-50 hover:bg-white border border-slate-200 rounded-xl pl-3 pr-9 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer truncate"
          >
            {PRAKTIKUM_MODULES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.modul} — {m.title}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedModule.labelPreset && (
            <button
              type="button"
              onClick={() => onApplyPreset(selectedModule)}
              title="Ubah label Sakelar/Indikator/Gauge/Level sesuai modul ini"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-xs font-semibold text-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Tags className="w-3.5 h-3.5 text-blue-600" />
              <span>Sesuaikan Label</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Lihat Kode</span>
          </button>

          <button
            type="button"
            onClick={handleQuickDownload}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh .ino</span>
          </button>
        </div>
      </div>
    </div>
  );
};
