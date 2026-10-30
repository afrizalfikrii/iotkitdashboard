import React, { useState } from 'react';
import { Loader2, Pencil, Check, RotateCcw } from 'lucide-react';
import { loadSavedLabels, saveLabels, DEFAULT_LABELS } from '../lib/labels';

interface SwitchPanelProps {
  switches: Record<number, boolean>;
  onToggleSwitch: (channel: number, newState: boolean) => Promise<void>;
  onBatchToggle: (newState: boolean) => Promise<void>;
}

export const SwitchPanel: React.FC<SwitchPanelProps> = ({
  switches,
  onToggleSwitch,
  onBatchToggle
}) => {
  const [labels, setLabels] = useState<Record<number, string>>(() => loadSavedLabels().switches);
  const [editingCh, setEditingCh] = useState<number | null>(null);
  const [tempLabel, setTempLabel] = useState<string>('');
  const [loadingChannels, setLoadingChannels] = useState<Record<number, boolean>>({});
  const [batchLoading, setBatchLoading] = useState<boolean>(false);

  const startEdit = (ch: number, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCh(ch);
    setTempLabel(currentName);
  };

  const saveEdit = (ch: number, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    const newName = tempLabel.trim() || `Sakelar ${ch}`;
    const next = { ...labels, [ch]: newName };
    setLabels(next);
    const full = loadSavedLabels();
    full.switches = next;
    saveLabels(full);
    setEditingCh(null);
  };

  const handleResetNames = () => {
    if (confirm('Kembalikan semua nama sakelar ke bawaan (Sakelar 1 - 8)?')) {
      setLabels(DEFAULT_LABELS.switches);
      const full = loadSavedLabels();
      full.switches = DEFAULT_LABELS.switches;
      saveLabels(full);
      setEditingCh(null);
    }
  };

  const handleToggle = async (channel: number) => {
    // If currently editing this card, don't trigger toggle
    if (editingCh === channel) return;
    const currentState = !!switches[channel];
    setLoadingChannels(prev => ({ ...prev, [channel]: true }));
    try {
      await onToggleSwitch(channel, !currentState);
    } finally {
      setLoadingChannels(prev => ({ ...prev, [channel]: false }));
    }
  };

  const handleBatch = async (targetState: boolean) => {
    setBatchLoading(true);
    try {
      await onBatchToggle(targetState);
    } finally {
      setBatchLoading(false);
    }
  };

  const channelList = [1, 2, 3, 4, 5, 6, 7, 8];
  const activeCount = Object.values(switches).filter(Boolean).length;

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Kontrol Sakelar & Relay
          </h2>
          <p className="text-xs text-slate-500">
            Klik sakelar untuk mengubah state. Klik ikon pensil untuk mengganti nama sakelar.
          </p>
        </div>

        {/* Counter and Batch Actions */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
            {activeCount} / 8 Menyala
          </span>
          <button
            onClick={() => handleBatch(true)}
            disabled={batchLoading || activeCount === 8}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs transition-colors shadow-2xs"
          >
            Nyalakan Semua
          </button>
          <button
            onClick={() => handleBatch(false)}
            disabled={batchLoading || activeCount === 0}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs transition-colors"
          >
            Matikan Semua
          </button>
          <button
            onClick={handleResetNames}
            title="Reset Nama Bawaan"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of Clean Modern Switch Tiles (NO CONFUSING ICONS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
        {channelList.map((ch) => {
          const isActive = !!switches[ch];
          const isLoading = !!loadingChannels[ch];
          const isThisEditing = editingCh === ch;
          const currentName = labels[ch] || `Sakelar ${ch}`;

          return (
            <div
              key={ch}
              onClick={() => handleToggle(ch)}
              role="button"
              tabIndex={0}
              className={`text-left p-3.5 rounded-xl border transition-all duration-150 select-none flex flex-col justify-between min-h-[110px] cursor-pointer ${
                isActive
                  ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs ring-1 ring-emerald-400/20'
                  : 'bg-white hover:bg-slate-50/70 border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              {/* Top Row: Channel Badge & Toggle Pill */}
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  CH-{String(ch).padStart(2, '0')}
                </span>

                {/* Animated Pill Switch */}
                <div
                  className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                    isActive ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-xs">
                      <Loader2 className="w-2.5 h-2.5 animate-spin text-slate-600" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                  )}
                </div>
              </div>

              {/* Middle: Editable Name */}
              <div className="my-2" onClick={e => e.stopPropagation()}>
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
                      onClick={(e) => saveEdit(ch, e)}
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
                      onClick={(e) => startEdit(ch, currentName, e)}
                      className="opacity-40 group-hover/edit:opacity-100 hover:text-blue-600 p-0.5 rounded transition-opacity"
                      title="Ubah nama"
                    >
                      <Pencil className="w-3 h-3 text-slate-400 hover:text-blue-600" />
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom: Node Path & State text */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-400">
                  switch{ch}
                </span>
                <span
                  className={`font-extrabold ${
                    isActive ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {isActive ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
