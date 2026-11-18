import React, { useState, useMemo } from 'react';
import { X, Download, Copy, Check, Code2, FileCode2, Sparkles, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import {
  PRAKTIKUM_MODULES,
  PraktikumModule,
  prepareModuleCode,
  downloadModuleFile,
} from '../data/praktikumModules';
import { FirebaseConfig } from '../types';

interface SourceCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: FirebaseConfig;
  selectedModuleId: string;
  onSelectModuleId: (id: string) => void;
}

export const SourceCodeModal: React.FC<SourceCodeModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  selectedModuleId,
  onSelectModuleId,
}) => {
  const [injectConfig, setInjectConfig] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const selectedModule: PraktikumModule = useMemo(() => {
    return PRAKTIKUM_MODULES.find((m) => m.id === selectedModuleId) || PRAKTIKUM_MODULES[0];
  }, [selectedModuleId]);

  const isFirebaseConfigured = Boolean(
    currentConfig.databaseURL.trim() && currentConfig.apiKey.trim()
  );

  const processedCode = useMemo(() => {
    if (!selectedModule) return '';
    return prepareModuleCode(selectedModule, currentConfig, injectConfig);
  }, [selectedModule, injectConfig, currentConfig]);

  if (!isOpen || !selectedModule) return null;

  const handleDownload = () => {
    downloadModuleFile(selectedModule.fileName, processedCode);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(processedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = processedCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lineCount = processedCode.split('\n').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/45 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-slate-50/80 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Source Code Praktikum Arduino
              </h2>
              <p className="text-[11px] text-slate-500">
                Pilih modul dari dropdown lalu unduh file <code className="font-mono text-slate-700">.ino</code> untuk Arduino IDE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Dropdown Selector */}
          <div>
            <label
              htmlFor="modul-select-modal"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              Pilih Modul Praktikum ({PRAKTIKUM_MODULES.length} Modul)
            </label>
            <div className="relative">
              <select
                id="modul-select-modal"
                value={selectedModuleId}
                onChange={(e) => {
                  onSelectModuleId(e.target.value);
                  setCopied(false);
                }}
                className="w-full appearance-none bg-slate-50 hover:bg-white border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                {PRAKTIKUM_MODULES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.modul} — {m.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Module Details Card */}
          <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                <FileCode2 className="w-3 h-3 text-blue-600" />
                {selectedModule.fileName}
              </span>
              {selectedModule.usesFirebase ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Terhubung Firebase
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600 border border-slate-300/60">
                  Offline / Standalone
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">
              {selectedModule.description}
            </p>
          </div>

          {/* Auto-inject Firebase Config Option */}
          {selectedModule.usesFirebase && (
            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-blue-100 bg-blue-50/50 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={injectConfig && isFirebaseConfigured}
                disabled={!isFirebaseConfigured}
                onChange={(e) => setInjectConfig(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
              />
              <div className="text-xs leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Otomatis isi konfigurasi Firebase saya</span>
                </div>
                {isFirebaseConfigured ? (
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Mengisi <code className="font-mono bg-white px-1 rounded border border-slate-200">DATABASE_URL</code>,{' '}
                    <code className="font-mono bg-white px-1 rounded border border-slate-200">API_KEY</code>, dan{' '}
                    <code className="font-mono bg-white px-1 rounded border border-slate-200">user = "{currentConfig.devicePrefix || 'user_id'}"</code> sesuai pengaturan saat ini.
                  </p>
                ) : (
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Atur akun Firebase di menu <strong>Konfigurasi</strong> agar kode otomatis terisi.
                  </p>
                )}
              </div>
            </label>
          )}

          {/* Collapsible Code Preview */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>{showPreview ? 'Sembunyikan Pratinjau Kode' : 'Lihat Pratinjau Kode'}</span>
                <span className="text-[10px] font-mono text-slate-400">({lineCount} baris)</span>
              </span>
              {showPreview ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showPreview && (
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
                <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
                  <span>{selectedModule.fileName}</span>
                  <span>{lineCount} baris</span>
                </div>
                <pre className="p-3.5 text-[11px] sm:text-xs font-mono text-slate-200 overflow-x-auto max-h-60 sm:max-h-72 leading-relaxed">
                  <code>{processedCode}</code>
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh {selectedModule.fileName}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
