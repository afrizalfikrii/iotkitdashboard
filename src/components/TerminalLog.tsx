import React, { useState, useRef, useEffect } from 'react';
import { ActivityLog } from '../types';
import { Clock, Trash2, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownLeft, Info, Filter } from 'lucide-react';

interface TerminalLogProps {
  logs: ActivityLog[];
  onClear: () => void;
}

export const TerminalLog: React.FC<TerminalLogProps> = ({ logs, onClear }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [filter, setFilter] = useState<'ALL' | 'TX' | 'RX'>('ALL');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    return log.direction === filter;
  });

  useEffect(() => {
    if (isExpanded && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Hanya scroll ke bawah di dalam kotak log jika pengguna berada di dekat bawah kotak log,
      // dan tidak pernah menarik scroll halaman/jendela utama.
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
      if (isNearBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [logs, isExpanded]);

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Riwayat Aktivitas & Komunikasi Data
            </h2>
            <p className="text-xs text-slate-500">
              Catatan transmisi data kirim (TX) dari web dan terima (RX) dari ESP
            </p>
          </div>
        </div>

        {/* Right Tools: Filter, Clear, Collapse */}
        <div className="flex items-center gap-2">
          {/* Quick Filter Pill Buttons */}
          <div className="flex items-center p-0.5 bg-slate-200/70 rounded-lg text-[11px] font-semibold text-slate-600">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Semua ({logs.length})
            </button>
            <button
              onClick={() => setFilter('TX')}
              className={`px-2 py-1 rounded-md transition-all ${
                filter === 'TX' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Kirim
            </button>
            <button
              onClick={() => setFilter('RX')}
              className={`px-2 py-1 rounded-md transition-all ${
                filter === 'RX' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              Terima
            </button>
          </div>

          <button
            onClick={onClear}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-rose-600 transition-colors"
            title="Bersihkan Riwayat"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Modern Light Activity List Stream */}
      {isExpanded && (
        <div
          ref={scrollContainerRef}
          className="bg-white max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs"
        >
          {filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <p className="text-xs font-medium">Belum ada riwayat aktivitas data.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tekan tombol sakelar atau kirim data dari ESP untuk melihat log di sini.
              </p>
            </div>
          ) : (
            filteredLogs.map(log => {
              const isTX = log.direction === 'TX';
              const isRX = log.direction === 'RX';

              return (
                <div
                  key={log.id}
                  className="px-5 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                >
                  {/* Left: Direction Badge, Channel & Time */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isTX
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : isRX
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {isTX && <ArrowUpRight className="w-3 h-3 text-amber-600" />}
                      {isRX && <ArrowDownLeft className="w-3 h-3 text-emerald-600" />}
                      {!isTX && !isRX && <Info className="w-3 h-3 text-indigo-600" />}
                      <span>{isTX ? 'KIRIM' : isRX ? 'TERIMA' : 'SISTEM'}</span>
                    </span>

                    <span className="text-xs font-bold text-slate-700 font-mono shrink-0">
                      [{log.channel}]
                    </span>

                    <span className="text-xs text-slate-600 truncate">
                      {log.payload}
                    </span>
                  </div>

                  {/* Right: Timestamp */}
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {log.timestamp}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
