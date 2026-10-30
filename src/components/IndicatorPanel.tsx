import React, { useState } from 'react';
import { Pencil, Check, RotateCcw } from 'lucide-react';
import { loadSavedLabels, saveLabels, DEFAULT_LABELS } from '../lib/labels';

interface IndicatorPanelProps {
  indicators: Record<number, boolean>;
}

export const IndicatorPanel: React.FC<IndicatorPanelProps> = ({ indicators }) => {
  const [labels, setLabels] = useState<Record<number, string>>(() => loadSavedLabels().indicators);
  const [editingCh, setEditingCh] = useState<number | null>(null);
  const [tempLabel, setTempLabel] = useState<string>('');

  const startEdit = (ch: number, currentName: string) => {
    setEditingCh(ch);
    setTempLabel(currentName);
  };

  const saveEdit = (ch: number) => {
    const newName = tempLabel.trim() || `Indikator ${ch}`;
    const next = { ...labels, [ch]: newName };
    setLabels(next);
    const full = loadSavedLabels();
    full.indicators = next;
    saveLabels(full);
    setEditingCh(null);
  };

  const handleResetNames = () => {
    if (confirm('Kembalikan semua nama indikator ke bawaan (Indikator 1 - 8)?')) {
      setLabels(DEFAULT_LABELS.indicators);
      const full = loadSavedLabels();
      full.indicators = DEFAULT_LABELS.indicators;
      saveLabels(full);
      setEditingCh(null);
    }
  };

  const channelList = [1, 2, 3, 4, 5, 6, 7, 8];
  const activeCount = Object.values(indicators).filter(Boolean).length;

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Indikator Sensor & Input Logika
          </h2>
          <p className="text-xs text-slate-500">
            Membaca data digital/logika dari ESP. Klik ikon pensil untuk memberi nama sensor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${activeCount > 0 ? 'bg-blue-600' : 'bg-slate-400'}`} />
            <span>{activeCount} / 8 Aktif</span>
          </div>
          <button
            onClick={handleResetNames}
            title="Reset Nama Bawaan"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of 8 Indicator Tiles (NO CONFUSING ICONS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
        {channelList.map((ch) => {
          const isHigh = !!indicators[ch];
          const isThisEditing = editingCh === ch;
          const currentName = labels[ch] || `Indikator ${ch}`;

          return (
            <div
              key={ch}
              className={`p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between min-h-[110px] ${
                isHigh
                  ? 'bg-blue-50/70 border-blue-300 shadow-2xs ring-1 ring-blue-400/20'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              {/* Top Row: Channel Badge & Live Status LED */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  IN-{String(ch).padStart(2, '0')}
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      isHigh
                        ? 'bg-blue-600 shadow-sm shadow-blue-500/50 ring-2 ring-blue-200'
                        : 'bg-slate-300'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-bold font-mono ${
                      isHigh ? 'text-blue-700' : 'text-slate-400'
                    }`}
                  >
                    {isHigh ? 'HIGH' : 'LOW'}
                  </span>
                </div>
              </div>

              {/* Middle: Editable Name */}
              <div className="my-2">
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
                      className="w-full text-xs font-bold bg-white border border-blue-400 px-2 py-1 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  <div className="flex items-center justify-between group/edit">
                    <span className="text-xs font-bold text-slate-800 truncate" title={currentName}>
                      {currentName}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEdit(ch, currentName)}
                      className="opacity-40 group-hover/edit:opacity-100 hover:text-blue-600 p-0.5 rounded transition-opacity"
                      title="Ubah nama"
                    >
                      <Pencil className="w-3 h-3 text-slate-400 hover:text-blue-600" />
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom: Node Tag & Logic 1/0 */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-400">
                  indicator{ch}
                </span>
                <span
                  className={`font-mono font-bold ${
                    isHigh ? 'text-blue-700' : 'text-slate-400'
                  }`}
                >
                  {isHigh ? 'Logika 1' : 'Logika 0'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
