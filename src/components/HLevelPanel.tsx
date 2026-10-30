import React, { useState } from 'react';
import { Pencil, Check, RotateCcw } from 'lucide-react';
import { loadSavedLabels, saveLabels, DEFAULT_LABELS } from '../lib/labels';

interface HLevelPanelProps {
  hlevel1: number;
  hlevel2: number;
}

export const HLevelPanel: React.FC<HLevelPanelProps> = ({ hlevel1, hlevel2 }) => {
  const [labels, setLabels] = useState<Record<number, string>>(() => loadSavedLabels().hlevels);
  const [editingCh, setEditingCh] = useState<number | null>(null);
  const [tempLabel, setTempLabel] = useState<string>('');

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

  const handleResetNames = () => {
    if (confirm('Kembalikan nama Level Bar ke bawaan?')) {
      setLabels(DEFAULT_LABELS.hlevels);
      const full = loadSavedLabels();
      full.hlevels = DEFAULT_LABELS.hlevels;
      saveLabels(full);
      setEditingCh(null);
    }
  };

  const renderBar = (ch: number, val: number, nodeName: string, gradientColor: string, maxVal: number = 100) => {
    const clamped = Math.max(0, Math.min(maxVal, val));
    const percent = Math.round((clamped / maxVal) * 100);
    const isThisEditing = editingCh === ch;
    const currentName = labels[ch] || `Level Bar ${ch}`;

    return (
      <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
        {/* Top Header with Editable Name */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
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
              <div className="flex items-center gap-1.5 group/edit">
                <span className="text-xs font-bold text-slate-800">
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
                <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                  {nodeName}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-slate-900 font-mono tabular-nums">
              {typeof val === 'number' ? val.toFixed(1) : '0.0'}
            </span>
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

        {/* Ticks */}
        <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5 px-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
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
            Level Bar Horizontal (HLevel 1 & 2)
          </h2>
          <p className="text-xs text-slate-500">
            Memonitor persentase level atau slider. Klik pensil untuk mengganti nama.
          </p>
        </div>

        <button
          onClick={handleResetNames}
          title="Reset Nama Bawaan"
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Level Bars Container */}
      <div className="space-y-3 flex-1 justify-center flex flex-col">
        {renderBar(
          1,
          hlevel1,
          'hlevel1',
          'bg-gradient-to-r from-blue-500 to-indigo-600',
          100
        )}
        {renderBar(
          2,
          hlevel2,
          'hlevel2',
          'bg-gradient-to-r from-emerald-500 to-teal-500',
          100
        )}
      </div>
    </div>
  );
};
