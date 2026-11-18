import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ConnectionStatus, FirebaseConfig, ActivityLog } from './types';
import { firebaseService, loadSavedConfig } from './lib/firebase';
import { Header } from './components/Header';
import { ConfigModal } from './components/ConfigModal';
import { SourceCodeModal } from './components/SourceCodeModal';
import { ModuleDownloadBar } from './components/ModuleDownloadBar';
import { PRAKTIKUM_MODULES } from './data/praktikumModules';
import { SwitchPanel } from './components/SwitchPanel';
import { IndicatorPanel } from './components/IndicatorPanel';
import { GaugePanel } from './components/GaugePanel';
import { HLevelPanel } from './components/HLevelPanel';
import { TerminalLog } from './components/TerminalLog';
import { BottomNav } from './components/BottomNav';
import { AlertCircle, RefreshCw, Globe, Settings, CheckCircle2, X } from 'lucide-react';

export const App: React.FC = () => {
  const [config, setConfig] = useState<FirebaseConfig>(loadSavedConfig());
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isSourceCodeOpen, setIsSourceCodeOpen] = useState<boolean>(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string>(PRAKTIKUM_MODULES[0]?.id || 'modul-02');
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'switches' | 'sensors' | 'logs'>('all');

  // Hardware telemetry states
  const [switches, setSwitches] = useState<Record<number, boolean>>({
    1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false
  });
  const [indicators, setIndicators] = useState<Record<number, boolean>>({
    1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false
  });
  const [gauges, setGauges] = useState<{ gauge1: number; gauge2: number }>({
    gauge1: 0,
    gauge2: 0
  });
  const [hlevels, setHlevels] = useState<{ hlevel1: number; hlevel2: number }>({
    hlevel1: 0,
    hlevel2: 0
  });

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'ok' | 'err' } | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const isInitialMount = useRef(true);

  const showToast = useCallback((message: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ message, type });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4000);
  }, []);

  // Helper to add activity log entry
  const addLog = useCallback((
    channel: string,
    direction: 'TX' | 'RX' | 'SYS',
    payload: string,
    statusType: 'ok' | 'warn' | 'err' = 'ok'
  ) => {
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const newEntry: ActivityLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp,
      channel,
      direction,
      payload,
      status: statusType
    };
    setLogs(prev => [...prev.slice(-99), newEntry]);
  }, []);

  // Connect / Reconnect to Firebase RTDB
  const connectToFirebase = useCallback(async (cfg: FirebaseConfig) => {
    if (!cfg.databaseURL.trim() || !cfg.apiKey.trim()) {
      setStatus('disconnected');
      setErrorMessage(null);
      setLatencyMs(null);
      addLog('SISTEM', 'SYS', 'Firebase belum dikonfigurasi. Silakan isi URL dan Database Secret.');
      return;
    }

    setStatus('connecting');
    setErrorMessage(null);
    addLog('SISTEM', 'SYS', `Menghubungkan ke Firebase: ${cfg.databaseURL}...`);

    try {
      await firebaseService.init(cfg);

      // Otomatis buat node default di Firebase Console jika belum ada
      try {
        const initRes = await firebaseService.initializeSchema(false);
        if (initRes.createdCount > 0) {
          addLog('DATABASE', 'TX', `Inisialisasi ${initRes.createdCount} node Firebase otomatis berhasil (switch 1-8, indicator 1-8, gauge 1-2, hlevel 1-2).`);
        }
      } catch (initErr) {
        console.warn('Auto initialize schema warning:', initErr);
      }

      const t0 = performance.now();
      firebaseService.subscribeToRoot((data) => {
        const roundtrip = Math.round(performance.now() - t0);
        setLatencyMs(roundtrip > 0 ? roundtrip : 15);
        setStatus('connected');
        setErrorMessage(null);

        if (!data || typeof data !== 'object') {
          addLog('DATABASE', 'RX', 'Berhasil terhubung. Menyiapkan node awal...', 'warn');
          firebaseService.initializeSchema(false).catch(console.error);
          return;
        }

        const root = data as Record<string, unknown>;

        // Parse Switches (1..8)
        setSwitches(prev => {
          const nextSw = { ...prev };
          let changed = false;
          for (let i = 1; i <= 8; i++) {
            const raw = root[`switch${i}`];
            let val = false;
            if (typeof raw === 'boolean') val = raw;
            else if (typeof raw === 'number') val = raw === 1;
            else if (typeof raw === 'string') val = raw.toLowerCase() === 'true' || raw === '1' || raw.toLowerCase() === 'on';
            else if (raw && typeof raw === 'object' && 'value' in (raw as Record<string, unknown>)) {
              val = Boolean((raw as Record<string, unknown>).value);
            }

            if (nextSw[i] !== val) {
              nextSw[i] = val;
              changed = true;
            }
          }
          return changed ? nextSw : prev;
        });

        // Parse Indicators (1..8)
        setIndicators(prev => {
          const nextInd = { ...prev };
          let changed = false;
          for (let i = 1; i <= 8; i++) {
            const raw = root[`indicator${i}`];
            let val = false;
            if (typeof raw === 'boolean') val = raw;
            else if (typeof raw === 'number') val = raw === 1;
            else if (typeof raw === 'string') val = raw.toLowerCase() === 'true' || raw === '1' || raw.toLowerCase() === 'high';
            else if (raw && typeof raw === 'object' && 'value' in (raw as Record<string, unknown>)) {
              val = Boolean((raw as Record<string, unknown>).value);
            }

            if (nextInd[i] !== val) {
              nextInd[i] = val;
              changed = true;
            }
          }
          return changed ? nextInd : prev;
        });

        // Parse Gauges
        const parseNum = (val: unknown, fallback: number = 0): number => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? fallback : parsed;
          }
          if (val && typeof val === 'object' && 'value' in (val as Record<string, unknown>)) {
            return parseNum((val as Record<string, unknown>).value, fallback);
          }
          return fallback;
        };

        const g1 = parseNum(root['gauge1'], 0);
        const g2 = parseNum(root['gauge2'], 0);
        setGauges({ gauge1: g1, gauge2: g2 });

        // Parse HLevels
        const h1 = parseNum(root['hlevel1'], 0);
        const h2 = parseNum(root['hlevel2'], 0);
        setHlevels({ hlevel1: h1, hlevel2: h2 });

        addLog('TELEMETRI', 'RX', `Data sinkron: G1=${g1}, G2=${g2}, H1=${h1}, H2=${h2}`);
      }, (error) => {
        setStatus('error');
        setErrorMessage(error.message || 'Gagal membaca Realtime Database');
        addLog('DATABASE', 'SYS', `Gagal sync: ${error.message}`, 'err');
      });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus('error');
      setErrorMessage(msg);
      addLog('DATABASE', 'SYS', `Gagal inisialisasi: ${msg}`, 'err');
    }
  }, [addLog]);

  // Initial connect on mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (!config.databaseURL || !config.apiKey) {
        setIsConfigOpen(true);
      } else {
        connectToFirebase(config);
      }
    }
  }, [config, connectToFirebase]);

  // Handle Switch Toggle
  const handleToggleSwitch = async (channel: number, newState: boolean) => {
    if (!isConfigured || status !== 'connected') {
      showToast('Hubungkan Firebase terlebih dahulu sebelum mengontrol sakelar.', 'err');
      return;
    }

    const tStart = performance.now();
    setSwitches(prev => ({ ...prev, [channel]: newState }));

    try {
      await firebaseService.setNodeValue(`switch${channel}`, newState);
      const elapsed = Math.round(performance.now() - tStart);
      addLog(`Sakelar ${channel}`, 'TX', `switch${channel} := ${newState ? 'TRUE (ON)' : 'FALSE (OFF)'} [${elapsed}ms]`);
    } catch (err: unknown) {
      setSwitches(prev => ({ ...prev, [channel]: !newState }));
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`Sakelar ${channel}`, 'TX', `Gagal mengubah switch${channel}: ${msg}`, 'err');
      showToast(`Gagal mengubah switch${channel}: ${msg}`, 'err');
    }
  };

  // Handle Batch All ON / OFF
  const handleBatchToggle = async (newState: boolean) => {
    if (!isConfigured || status !== 'connected') {
      showToast('Hubungkan Firebase terlebih dahulu sebelum mengontrol sakelar.', 'err');
      return;
    }

    const promises = [1, 2, 3, 4, 5, 6, 7, 8].map(ch =>
      firebaseService.setNodeValue(`switch${ch}`, newState)
    );
    try {
      await Promise.all(promises);
      setSwitches({
        1: newState, 2: newState, 3: newState, 4: newState,
        5: newState, 6: newState, 7: newState, 8: newState
      });
      addLog('AKTUATOR', 'TX', `SEMUA SAKELAR := ${newState ? 'NYALA (TRUE)' : 'MATI (FALSE)'}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog('AKTUATOR', 'TX', `Gagal eksekusi serentak: ${msg}`, 'err');
      showToast(`Gagal eksekusi serentak: ${msg}`, 'err');
    }
  };

  const handleSaveConfig = (newConfig: FirebaseConfig) => {
    setConfig(newConfig);
    connectToFirebase(newConfig);
  };

  const handleForceInitNodes = async () => {
    if (!firebaseService.getDatabase()) {
      showToast('Firebase belum terhubung. Harap isi URL & Key terlebih dahulu.', 'err');
      return;
    }
    try {
      const res = await firebaseService.initializeSchema(true);
      addLog('DATABASE', 'TX', `Struktur ${res.createdCount} node Firebase berhasil dibuat ulang di console.`, 'ok');
      showToast('Seluruh node Firebase (switch, indicator, gauge, hlevel) berhasil dibuat.', 'ok');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog('DATABASE', 'TX', `Gagal inisialisasi node: ${msg}`, 'err');
      showToast(`Gagal inisialisasi node: ${msg}`, 'err');
    }
  };

  const isConfigured = Boolean(config.databaseURL.trim() && config.apiKey.trim());
  const isSwitchLocked = !isConfigured || status !== 'connected';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-indigo-50/30 text-slate-800 flex flex-col font-sans">
      {/* Sleek Floating Header */}
      <Header
        status={status}
        config={config}
        latencyMs={latencyMs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenConfig={() => setIsConfigOpen(true)}
        onReconnect={() => connectToFirebase(config)}
      />

      {/* Main Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 pb-24 lg:pb-8 space-y-6">
        {/* Banner Akun Firebase Belum Diisi + Panduan 3 Langkah */}
        {!isConfigured && (
          <div className="p-4 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-amber-900 text-xs space-y-3 shadow-2xs animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs sm:text-sm">
                    Firebase Belum Dikonfigurasi — Mulai dalam 3 Langkah
                  </p>
                  <p className="text-slate-600 text-[11px] sm:text-xs">
                    Hubungkan dashboard ini ke Firebase Realtime Database dan NodeMCU/ESP8266 Anda.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-amber-500/20 shrink-0 transition-all cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>1. Isi Akun Firebase</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-amber-200/70 text-[11px]">
              <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-xl border border-amber-200/60">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                <span className="text-slate-700"><strong>Atur Firebase:</strong> Isi URL, Secret & User ID</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-xl border border-amber-200/60">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                <span className="text-slate-700"><strong>Unduh Modul:</strong> Pilih modul & upload via Arduino IDE</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-xl border border-amber-200/60">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                <span className="text-slate-700"><strong>Pantau Realtime:</strong> Kontrol sakelar & baca sensor</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Module Source Code Download Bar */}
        <ModuleDownloadBar
          selectedModuleId={selectedModuleId}
          onSelectModuleId={setSelectedModuleId}
          onOpenModal={() => setIsSourceCodeOpen(true)}
          currentConfig={config}
        />

        {/* Error Notification Banner */}
        {status === 'error' && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center justify-between gap-3 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold mr-1.5">[Koneksi Bermasalah]</span>
                <span>{errorMessage || 'Tidak dapat terhubung ke Firebase RTDB. Periksa koneksi internet atau izin database.'}</span>
              </div>
            </div>
            <button
              onClick={() => connectToFirebase(config)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Coba Lagi
            </button>
          </div>
        )}

        {/* Section: Switch Panel */}
        {(activeTab === 'all' || activeTab === 'switches') && (
          <SwitchPanel
            switches={switches}
            disabled={isSwitchLocked}
            onToggleSwitch={handleToggleSwitch}
            onBatchToggle={handleBatchToggle}
          />
        )}

        {/* Section: Sensors & Gauges */}
        {(activeTab === 'all' || activeTab === 'sensors') && (
          <div className="space-y-6">
            <IndicatorPanel
              indicators={indicators}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GaugePanel
                gauge1={gauges.gauge1}
                gauge2={gauges.gauge2}
              />
              <HLevelPanel
                hlevel1={hlevels.hlevel1}
                hlevel2={hlevels.hlevel2}
              />
            </div>
          </div>
        )}

        {/* Section: Telemetry Log */}
        {(activeTab === 'all' || activeTab === 'logs') && (
          <TerminalLog
            logs={logs}
            onClear={() => setLogs([])}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200/60 bg-white/60 backdrop-blur-md py-4 px-6 text-xs text-slate-500 mt-8 mb-16 lg:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">IoT-KIT Dashboard Praktikum</span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-slate-500 hidden sm:inline">ESP32 / ESP8266</span>
          </div>
          <div className="font-medium text-slate-700">
            Universitas Muhammadiyah Surakarta
          </div>
        </div>
      </footer>

      {/* Floating Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenConfig={() => setIsConfigOpen(true)}
        isConfigured={isConfigured}
      />

      {/* Configuration Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        currentConfig={config}
        onClose={() => setIsConfigOpen(false)}
        onSave={handleSaveConfig}
      />

      {/* Source Code Praktikum Modal */}
      <SourceCodeModal
        isOpen={isSourceCodeOpen}
        onClose={() => setIsSourceCodeOpen(false)}
        currentConfig={config}
        selectedModuleId={selectedModuleId}
        onSelectModuleId={setSelectedModuleId}
      />

      {/* Non-blocking Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 max-w-sm px-4 py-3 rounded-xl shadow-lg border text-xs font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'err'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toast.type === 'err' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-0.5 rounded hover:bg-black/5 cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
