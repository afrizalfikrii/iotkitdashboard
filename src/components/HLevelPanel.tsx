import React, { useState, useEffect } from 'react';
import { Pencil, Check, RotateCcw, Settings2 } from 'lucide-react';
import { loadSavedLabels, saveLabels, DEFAULT_LABELS } from '../lib/labels';

interface HLevelPanelProps {
  hlevel1: number;
  hlevel2: number;
  labelVersion?: number;
}

export const HLevelPanel: React.FC<HLevelPanelProps> = ({ hlevel1, hlevel2, labelVersion = 0 }) => {
  const [labels, setLabels] = useState<Record<number, string>>(() => loadSavedLabels().hlevels);
  const [meta, setMeta] = useState<Record<number, { unit: string; max: number }>>(
    () => loadSavedLabels().hlevelMeta
  );
  const [editingCh, setEditingCh] = useState<number | null>(null);
  const [tempLabel, setTempLabel] = useState<string>('');
  const [isEditingMeta, setIsEditingMeta] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  useEffect(() => {
    const saved = loadSavedLabels();
    setLabels(saved.hlevels);
    setMeta(saved.hlevelMeta);
  }, [labelVersion]);

  const startEdit = (ch: number, currentName: string) => {
    setEditingCh(ch);
    setTempLabel(currentName);
  };

  const saveEdit = (ch: number) => {
    const newName = tempLabel.trim() || `Level Bar ${ch}`;
    const next = { ...labels, [ch]: newName };
    setLabels(next);
    const full = loadSavedLabels();
    full.hlevels = next;
    saveLabels(full);
    setEditingCh(null);
  };

  const handleMetaUpdate = (ch: number, field: 'unit' | 'max', value: string | number) => {
    const current = meta[ch] || DEFAULT_LABELS.hlevelMeta[ch];
    const next = {
      ...meta,
      [ch]: {
        ...current,
        [field]: value,
      },
    };
    setMeta(next);
    const full = loadSavedLabels();
    full.hlevelMeta = next;
    saveLabels(full);
  };

  const handleResetNames = () => {
    setLabels(DEFAULT_LABELS.hlevels);
    setMeta(DEFAULT_LABELS.hlevelMeta);
    const full = loadSavedLabels();
    full.hlevels = DEFAULT_LABELS.hlevels;
    full.hlevelMeta = DEFAULT_LABELS.hlevelMeta;
    saveLabels(full);
    setEditingCh(null);
    setIsEditingMeta(false);
    setConfirmReset(false);
  };

  const formatTick = (num: number): string => {
    return Number.isInteger(num) ? String(num) : num.toFixed(0);
  };

  const renderBar = (ch: number, val: number, nodeName: string, gradientColor: string) => {
    const cfgMeta = meta[ch] || DEFAULT_LABELS.hlevelMeta[ch];
    const maxVal = cfgMeta.max > 0 ? cfgMeta.max : 100;
    const unit = cfgMeta.unit || '%';
    const clamped = Math.max(0, Math.min(maxVal, val));
    const percent = Math.round((clamped / maxVal) * 100);
    const isThisEditing = editingCh === ch;
    const currentName = labels[ch] || `Level Bar ${ch}`;

    return (
      <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
        {/* Top Header with Editable Name */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
              HL-0{ch}
            </span>

            {isThisEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  autoFocus
                  value={tempLabel}
                  onChange={e => setTempLabel(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEdit(ch);
                    if (e.key === 'Escape') setEditingCh(null);
                  }}
                  className="text-xs font-bold bg-white border border-blue-400 px-2 py-1 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => saveEdit(ch)}
                  className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group/edit min-w-0">
                <span className="text-xs font-bold text-slate-800 truncate">
                  {currentName}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(ch, currentName)}
                  className="opacity-40 group-hover/edit:opacity-100 hover:text-blue-600 p-0.5 rounded transition-opacity shrink-0"
                  title="Ubah nama"
                >
                  <Pencil className="w-3 h-3 text-slate-400 hover:text-blue-600" />
                </button>
                <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.2 rounded border border-slate-200 shrink-0 hidden sm:inline">
                  {nodeName}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-sm font-extrabold text-slate-900 font-mono tabular-nums">
              {typeof val === 'number' ? val.toFixed(1) : '0.0'}
            </span>
            {unit !== '%' && (
              <span className="text-[11px] font-bold text-slate-500">{unit}</span>
            )}
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-indigo-700 border border-slate-200 shadow-2xs">
              {percent}%
            </span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-3.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-slate-200/60 shadow-inner relative">
          <div
            className={`h-full rounded-full transition-all duration-300 ${gradientColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Dynamic Scale Ticks */}
        <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5 px-1">
          <span>0{unit === '%' ? '%' : ''}</span>
          <span>{formatTick(maxVal * 0.25)}{unit === '%' ? '%' : ''}</span>
          <span>{formatTick(maxVal * 0.5)}{unit === '%' ? '%' : ''}</span>
          <span>{formatTick(maxVal * 0.75)}{unit === '%' ? '%' : ''}</span>
          <span>{formatTick(maxVal)} {unit}</span>
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
            Level Bar (1 & 2)
          </h2>
          <p className="text-xs text-slate-500">
            Persentase level dari ESP. Klik pensil atau atur skala maksimal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditingMeta(!isEditingMeta)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{isEditingMeta ? 'Tutup' : 'Atur Skala'}</span>
          </button>

          {confirmReset ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleResetNames}
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
              title="Reset Nama & Skala Bawaan"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Inline Scale & Unit Editor */}
      {isEditingMeta && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in">
          {[1, 2].map((ch) => {
            const cfgMeta = meta[ch] || DEFAULT_LABELS.hlevelMeta[ch];
            return (
              <div key={ch} className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2">
                <span className="font-bold text-slate-800 block">Skala Level Bar {ch}</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Satuan:</label>
                    <input
                      type="text"
                      value={cfgMeta.unit}
                      onChange={e => handleMetaUpdate(ch, 'unit', e.target.value)}
                      placeholder="% / cm / m"
                      className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-md text-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5">Maksimal:</label>
                    <input
                      type="number"
                      min={1}
                      value={cfgMeta.max}
                      onChange={e => handleMetaUpdate(ch, 'max', Math.max(1, Number(e.target.value) || 100))}
                      placeholder="100"
                      className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-md text-slate-800 text-xs"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Level Bars Container */}
      <div className="space-y-3 flex-1 justify-center flex flex-col">
        {renderBar(
          1,
          hlevel1,
          'hlevel1',
          'bg-gradient-to-r from-blue-500 to-indigo-600'
        )}
        {renderBar(
          2,
          hlevel2,
          'hlevel2',
          'bg-gradient-to-r from-emerald-500 to-teal-500'
        )}
      </div>
    </div>
  );
};
