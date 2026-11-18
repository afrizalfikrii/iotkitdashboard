import React, { useState } from 'react';
import { Settings2, RotateCcw } from 'lucide-react';
import { loadSavedLabels, saveLabels, DEFAULT_LABELS } from '../lib/labels';

interface GaugePanelProps {
  gauge1: number;
  gauge2: number;
}

export const GaugePanel: React.FC<GaugePanelProps> = ({ gauge1, gauge2 }) => {
  const [gaugesConfig, setGaugesConfig] = useState(() => loadSavedLabels().gauges);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  const handleUpdate = (ch: number, field: 'label' | 'unit' | 'max', value: string | number) => {
    const next = {
      ...gaugesConfig,
      [ch]: {
        ...gaugesConfig[ch],
        [field]: value
      }
    };
    setGaugesConfig(next);
    const full = loadSavedLabels();
    full.gauges = next;
    saveLabels(full);
  };

  const handleReset = () => {
    setGaugesConfig(DEFAULT_LABELS.gauges);
    const full = loadSavedLabels();
    full.gauges = DEFAULT_LABELS.gauges;
    saveLabels(full);
    setIsEditing(false);
    setConfirmReset(false);
  };

  const renderGaugeSVG = (ch: number, value: number, gradientId: string, stop1: string, stop2: string) => {
    const cfg = gaugesConfig[ch] || DEFAULT_LABELS.gauges[ch];
    const span = cfg.max || 1;
    const clampedVal = Math.max(0, Math.min(cfg.max, value));
    const ratio = Math.max(0, Math.min(1, clampedVal / span));

    const formattedVal = typeof value === 'number' ? value.toFixed(1) : '0.0';
    const valFontSize =
      formattedVal.length >= 6 ? 18 : formattedVal.length === 5 ? 22 : 26;

    // Semi-arc parameters (180 degrees)
    const r = 78;
    const cx = 100;
    const cy = 92;
    const circumference = Math.PI * r; // ~245.0
    const strokeDashoffset = circumference * (1 - ratio);

    return (
      <div className="relative flex flex-col items-center p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 w-full">
        {/* Top Channel tag & name */}
        <div className="flex items-center justify-between w-full mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
              G-0{ch}
            </span>
            <span className="text-xs font-bold text-slate-800 truncate">
              {cfg.label}
            </span>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 shrink-0">
            {cfg.unit}
          </span>
        </div>

        {/* Dial SVG (including proportional digital readout so it never collides with arc) */}
        <div className="relative my-2 w-full flex justify-center">
          <svg viewBox="0 0 200 112" className="w-full max-w-[220px] overflow-visible select-none">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={stop1} />
                <stop offset="100%" stopColor={stop2} />
              </linearGradient>
            </defs>

            {/* Background Track Arc */}
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="11"
              strokeLinecap="round"
            />

            {/* Active Value Arc */}
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 ease-out"
            />

            {/* Central Digital Value */}
            <text
              x={cx}
              y={cy - 12}
              textAnchor="middle"
              className="fill-slate-900 font-mono font-extrabold"
              style={{ fontSize: `${valFontSize}px` }}
            >
              {formattedVal}
            </text>

            {/* Unit Label */}
            <text
              x={cx}
              y={cy + 6}
              textAnchor="middle"
              className="fill-slate-400 font-sans font-bold"
              style={{ fontSize: '11px' }}
            >
              {cfg.unit}
            </text>
          </svg>
        </div>

        {/* Min / Max bounds & Node */}
        <div className="flex items-center justify-between w-full text-[11px] text-slate-400 font-mono mt-1 pt-2 border-t border-slate-200/60">
          <span>gauge{ch}</span>
          <span className="text-indigo-600 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
            {Math.round(ratio * 100)}%
          </span>
          <span>Max: {cfg.max}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Pengukuran Analog
          </h2>
          <p className="text-xs text-slate-500">
            Nilai sensor analog dari ESP. Klik pengaturan untuk ubah satuan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
          >
            <Settings2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{isEditing ? 'Tutup Pengaturan' : 'Atur Nama & Satuan'}</span>
          </button>
          {confirmReset ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="px-2 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium cursor-pointer"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              title="Reset ke Bawaan"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Inline Settings Editor */}
      {isEditing && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in">
          {[1, 2].map((ch) => {
            const cfg = gaugesConfig[ch] || DEFAULT_LABELS.gauges[ch];
            return (
              <div key={ch} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <span className="font-bold text-slate-800 block">Konfigurasi Gauge {ch}</span>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-0.5">Nama Sensor:</label>
                  <input
                    type="text"
                    value={cfg.label}
                    onChange={e => handleUpdate(ch, 'label', e.target.value)}
                    placeholder="Nama sensor"
                    className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-md text-slate-800 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Satuan (Unit):</label>
                    <input
                      type="text"
                      value={cfg.unit}
                      onChange={e => handleUpdate(ch, 'unit', e.target.value)}
                      placeholder="°C / RPM / %"
                      className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-md text-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Nilai Maksimal:</label>
                    <input
                      type="number"
                      value={cfg.max}
                      onChange={e => handleUpdate(ch, 'max', Number(e.target.value) || 100)}
                      placeholder="Max"
                      className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-md text-slate-800 text-xs"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
        {renderGaugeSVG(1, gauge1, 'gaugeGrad1', '#6366f1', '#3b82f6')}
        {renderGaugeSVG(2, gauge2, 'gaugeGrad2', '#10b981', '#06b6d4')}
      </div>
    </div>
  );
};
