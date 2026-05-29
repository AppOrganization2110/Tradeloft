'use client';

import { useMemo, useState } from 'react';
import { TradeLogEntry } from '@/types/trade';

export default function TradeLog({
  tradeLog,
  onUpdateTrade,
  onDeleteTrade,
  onExport,
}: {
  tradeLog: TradeLogEntry[];
  onUpdateTrade: (entry: TradeLogEntry) => void;
  onDeleteTrade: (id: string) => void;
  onExport: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const sortedTrades = useMemo(
    () => [...tradeLog].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)),
    [tradeLog],
  );

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      onDeleteTrade(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Trade-Log</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {tradeLog.length} gespeicherte{tradeLog.length !== 1 ? '' : 's'} Setup{tradeLog.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <button type="button" onClick={onExport} className="btn-primary">
          JSON exportieren
        </button>
      </div>

      {sortedTrades.length === 0 ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-6 text-[var(--text-secondary)]">
          Noch keine Trades gespeichert. Führe eine Analyse durch und speichere ein Setup.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTrades.map((trade) => (
            <div key={trade.id} className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-card">
              {/* Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">{new Date(trade.timestamp).toLocaleString('de-DE')}</p>
                  <p className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
                    {trade.asset} <span className="font-mono text-sm text-[var(--text-muted)]">({trade.symbol})</span>
                    {' '}— {trade.direction}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-2 text-sm text-[var(--text-secondary)]">
                    Kapital: {trade.capital.toFixed(0)} €
                  </span>
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(trade.id)}
                    className={`min-h-[36px] rounded-full px-4 py-2 text-sm font-semibold transition ${
                      confirmDelete === trade.id
                        ? 'bg-[var(--loss)] text-white'
                        : 'border border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:border-[var(--loss)] hover:text-[var(--loss)]'
                    }`}
                    title={confirmDelete === trade.id ? 'Nochmal klicken zum Bestätigen' : 'Trade löschen'}
                  >
                    {confirmDelete === trade.id ? '⚠️ Bestätigen' : '🗑 Löschen'}
                  </button>
                </div>
              </div>

              {/* Trade-Parameter */}
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Entry</p>
                  <p className="mt-2 font-mono text-lg font-semibold text-[var(--text-primary)]">{trade.entry.toFixed(2)} €</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Stop-Loss</p>
                  <p className="mt-2 font-mono text-lg font-semibold text-[var(--loss)]">{trade.stop.toFixed(2)} €</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Take-Profit</p>
                  <p className="mt-2 font-mono text-lg font-semibold text-[var(--gain)]">{trade.target.toFixed(2)} €</p>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Positionsgröße</p>
                  <p className="mt-2 font-mono text-lg font-semibold text-[var(--text-primary)]">{trade.positionSize.toFixed(2)} €</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Max. Verlust</p>
                  <p className="mt-2 font-mono text-lg font-semibold text-[var(--loss)]">{trade.maxLoss.toFixed(2)} €</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Ergebnis</p>
                  <p className={`mt-2 font-mono text-lg font-semibold ${
                    trade.result === undefined ? 'text-[var(--text-muted)]'
                    : trade.result >= 0 ? 'text-[var(--gain)]' : 'text-[var(--loss)]'
                  }`}>
                    {trade.result !== undefined ? `${trade.result >= 0 ? '+' : ''}${trade.result.toFixed(2)} €` : 'offen'}
                  </p>
                </div>
              </div>

              {/* Notizen */}
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Analyse</p>
                  <p className="mt-2 text-sm text-[var(--text-primary)]">{trade.analysisText}</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Manuelle Notiz</p>
                  <textarea
                    value={trade.note ?? ''}
                    onChange={(e) => onUpdateTrade({ ...trade, note: e.target.value })}
                    placeholder="Eigene Beobachtungen, Abweichungen vom Plan…"
                    className="mt-2 h-20 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-cyan)]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
