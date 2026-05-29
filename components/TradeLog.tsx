'use client';

import { useMemo } from 'react';
import { TradeLogEntry } from '@/types/trade';

export default function TradeLog({ tradeLog, onUpdateTrade, onExport }: { tradeLog: TradeLogEntry[]; onUpdateTrade: (entry: TradeLogEntry) => void; onExport: () => void; }) {
  const sortedTrades = useMemo(() => [...tradeLog].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)), [tradeLog]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-700 bg-bg-secondary p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Trade-Log</h2>
          <p className="mt-1 text-sm text-text-secondary">Alle gespeicherten Setups und Notizen.</p>
        </div>
        <button type="button" onClick={onExport} className="inline-flex min-h-[44px] items-center justify-center rounded-3xl bg-accent-cyan px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400">
          JSON exportieren
        </button>
      </div>

      {sortedTrades.length === 0 ? (
        <div className="rounded-3xl border border-slate-700 bg-bg-tertiary p-6 text-slate-400">Noch keine Trades gespeichert.</div>
      ) : (
        <div className="space-y-4">
          {sortedTrades.map((trade) => (
            <div key={trade.id} className="rounded-3xl border border-slate-700 bg-bg-tertiary p-6 shadow-card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-400">{trade.timestamp}</p>
                  <p className="text-xl font-semibold text-white">{trade.asset} ({trade.symbol}) – {trade.direction}</p>
                </div>
                <p className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-200">Kapital: {trade.capital.toFixed(0)} €</p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-4 text-sm text-slate-300">
                  <p className="text-slate-400">Entry</p>
                  <p className="mt-2 text-lg text-white">{trade.entry.toFixed(2)} €</p>
                </div>
                <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-4 text-sm text-slate-300">
                  <p className="text-slate-400">Stop-Loss</p>
                  <p className="mt-2 text-lg text-white">{trade.stop.toFixed(2)} €</p>
                </div>
                <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-4 text-sm text-slate-300">
                  <p className="text-slate-400">Take-Profit</p>
                  <p className="mt-2 text-lg text-white">{trade.target.toFixed(2)} €</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-4 text-sm text-slate-300">
                  <p className="text-slate-400">Position</p>
                  <p className="mt-2 text-lg text-white">{trade.positionSize.toFixed(2)} €</p>
                </div>
                <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-4 text-sm text-slate-300">
                  <p className="text-slate-400">Max Verlust</p>
                  <p className="mt-2 text-lg text-white">{trade.maxLoss.toFixed(2)} €</p>
                </div>
                <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-4 text-sm text-slate-300">
                  <p className="text-slate-400">Ergebnis</p>
                  <p className="mt-2 text-lg text-white">{trade.result !== undefined ? `${trade.result.toFixed(2)} €` : 'offen'}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-4 text-sm text-slate-300">
                  <p className="text-slate-400">Analyse-Text</p>
                  <p className="mt-2 text-white">{trade.analysisText}</p>
                </div>
                <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-4 text-sm text-slate-300">
                  <p className="text-slate-400">Manuelle Notiz</p>
                  <textarea value={trade.note ?? ''} onChange={(event) => onUpdateTrade({ ...trade, note: event.target.value })} className="mt-2 h-24 w-full resize-none rounded-2xl border border-slate-700 bg-bg-tertiary px-3 py-2 text-white outline-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
