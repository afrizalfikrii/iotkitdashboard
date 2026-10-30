import React, { useState, useEffect } from 'react';
import { FirebaseConfig } from '../types';
import { formatDatabaseUrl, extractProjectId } from '../lib/firebase';
import { X, Check, RotateCcw, Info, Key, Globe, User, BookOpen } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  currentConfig: FirebaseConfig;
  onClose: () => void;
  onSave: (config: FirebaseConfig) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  currentConfig,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<FirebaseConfig>(currentConfig);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    setForm(currentConfig);
  }, [currentConfig, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: keyof FirebaseConfig, val: string) => {
    setForm(prev => {
      const next = { ...prev, [key]: val };
      // If user typed a databaseURL, automatically extract project id if not customized
      if (key === 'databaseURL') {
        next.projectId = extractProjectId(val);
      }
      return next;
    });
  };

  const handleClear = () => {
    setForm({
      apiKey: '',
      databaseURL: '',
      projectId: '',
      devicePrefix: ''
    });
  };

  const handleResetAndDelete = () => {
    const blank: FirebaseConfig = {
      apiKey: '',
      databaseURL: '',
      projectId: '',
      devicePrefix: ''
    };
    setForm(blank);
    onSave(blank);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = formatDatabaseUrl(form.databaseURL);
    const cleanKey = form.apiKey.trim();

    // If user leaves both empty, save as blank/unconfigured
    if (!cleanUrl && !cleanKey) {
      const blank: FirebaseConfig = {
        apiKey: '',
        databaseURL: '',
        projectId: '',
        devicePrefix: form.devicePrefix.trim().replace(/^\/+|\/+$/g, '')
      };
      onSave(blank);
      onClose();
      return;
    }

    if (!cleanUrl) {
      alert("Harap masukkan Firebase Database URL Anda.");
      return;
    }

    if (!cleanKey) {
      alert("Harap masukkan Database Secret / Key Firebase Anda.");
      return;
    }

    const formatted: FirebaseConfig = {
      ...form,
      databaseURL: cleanUrl,
      apiKey: cleanKey,
      projectId: form.projectId.trim() || extractProjectId(cleanUrl),
      devicePrefix: form.devicePrefix.trim().replace(/^\/+|\/+$/g, '')
    };
    onSave(formatted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Pengaturan Akun Firebase Mandiri
              </h2>
              <p className="text-xs text-slate-500">
                Masukkan URL Database dan Database Secret proyek Firebase Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Box */}
        <div className="px-6 py-3 bg-blue-50/80 border-b border-blue-100/80 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-blue-900 font-medium">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Tersimpan di browser ini (tidak akan tertukar antar mahasiswa)</span>
          </div>
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="text-blue-700 font-bold hover:underline shrink-0 text-[11px] flex items-center gap-1"
          >
            <BookOpen className="w-3 h-3" />
            {showGuide ? 'Tutup Panduan' : 'Panduan Secret Key'}
          </button>
        </div>

        {/* Step by step guide if toggled */}
        {showGuide && (
          <div className="px-6 py-3.5 bg-amber-50/90 border-b border-amber-200 text-amber-900 text-xs space-y-2 animate-in fade-in">
            <p className="font-bold flex items-center gap-1.5 text-amber-900">
              <Key className="w-3.5 h-3.5 text-amber-700" />
              Cara mengambil URL & Database Secret di Firebase Console:
            </p>
            <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-amber-800">
              <li>
                <strong>Database URL:</strong> Masuk ke Firebase Console &gt; menu <em>Realtime Database</em> &gt; salin URL di bagian atas tabel (contoh: <code className="bg-amber-100 px-1 rounded font-mono">https://proyek-anda-default-rtdb.firebaseio.com</code>).
              </li>
              <li>
                <strong>Database Secret:</strong> Buka <em>Project Settings</em> (ikon gerigi ⚙️ di samping Project Overview) &gt; tab <strong>Service accounts</strong> &gt; pilih menu <strong>Database secrets</strong> &gt; klik <strong>Tampilkan (Show)</strong> lalu salin Secret key tersebut.
              </li>
              <li>
                <strong>User ID:</strong> Samakan persis dengan variabel Arduino ESP: <code className="bg-amber-100 px-1 rounded font-mono">String user = "user_anda";</code>.
              </li>
            </ol>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="flex items-center gap-1.5 text-slate-700 font-bold">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                Firebase Database URL Anda
              </label>
            </div>
            <input
              type="text"
              value={form.databaseURL}
              onChange={e => handleChange('databaseURL', e.target.value)}
              placeholder="https://proyek-anda-default-rtdb.firebaseio.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="flex items-center gap-1.5 text-slate-700 font-bold">
                <Key className="w-3.5 h-3.5 text-blue-600" />
                Database Secret / Key Anda
              </label>
              <span className="text-[10px] text-slate-400">
                Tab Service accounts &gt; Database secrets
              </span>
            </div>
            <input
              type="text"
              value={form.apiKey}
              onChange={e => handleChange('apiKey', e.target.value)}
              placeholder="Tempel Database Secret atau Web API Key di sini..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-slate-700 font-bold mb-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                User ID (String user di ESP)
              </label>
              <input
                type="text"
                value={form.devicePrefix}
                onChange={e => handleChange('devicePrefix', e.target.value)}
                placeholder="Misal: budi123 atau kelompok_1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Sesuai baris: String user = "...";
              </span>
            </div>

            <div>
              <label className="text-slate-700 font-bold mb-1 block">
                Project ID (Otomatis)
              </label>
              <input
                type="text"
                value={form.projectId}
                onChange={e => handleChange('projectId', e.target.value)}
                placeholder="Terisi otomatis dari URL"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Bisa dikosongkan (otomatis)
              </span>
            </div>
          </div>


          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={handleResetAndDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors text-xs font-medium cursor-pointer"
              title="Hapus konfigurasi dari penyimpanan lokal browser"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hapus / Kosongkan</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                Simpan & Hubungkan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
