'use client';

import { useEffect, useMemo, useState } from 'react';
import { QuoteResponse } from '@/types/trade';

function formatPrice(value: number | null | undefined) {
  return value !== null && value !== undefined
    ? value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '–';
}

function timeAgo(timestamp?: string | null) {
  if (!timestamp) return '–';
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  return `${seconds}s`;
}

function changeStyle(value: number | null | undefined): React.CSSProperties {
  if (value === null || value === undefined) return { color: 'var(--text-secondary)' };
  return { color: value >= 0 ? 'var(--gain)' : 'var(--loss)' };
}

export default function LiveQuotes({ quoteData }: { quoteData: QuoteResponse | null }) {
  const [age, setAge] = useState('–');

  useEffect(() => {
    if (!quoteData) return;
    const update = () => setAge(timeAgo(quoteData.timestamp));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [quoteData]);

  const ageWarning = useMemo(() => {
    if (!quoteData) return null;
    const maxAge = Math.max(
      ...[...quoteData.crypto, ...quoteData.stock].map((item) => {
        if (!item.lastUpdatedAt) return 999999;
        return Math.floor((Date.now() - new Date(item.lastUpdatedAt).getTime()) / 1000);
      })
    );
    if (maxAge > 900) return { color: 'rose', text: 'Bitte aktualisieren: Daten älter als 15 Minuten.' };
    if (maxAge > 300) return { color: 'amber', text: 'Achtung: Daten älter als 5 Minuten.' };
    return null;
  }, [quoteData]);

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Live-Kurse</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Aktuelle Kurse aus CoinGecko und Finnhub.</p>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">Datenalter: <span className="font-mono text-[var(--text-primary)]">{age}</span></div>
        </div>

        {ageWarning ? (
          <div
            className="mt-5 rounded-2xl border px-4 py-3 text-sm"
            style={
              ageWarning.color === 'rose'
                ? { borderColor: 'rgba(196,28,28,0.3)', backgroundColor: 'rgba(196,28,28,0.08)', color: 'var(--loss)' }
                : { borderColor: 'rgba(184,104,0,0.3)', backgroundColor: 'rgba(184,104,0,0.08)', color: 'var(--warning)' }
            }
          >
            {ageWarning.text}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {(quoteData?.crypto ?? []).map((item) => (
            <div key={item.symbol} className="rounded-3xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">{item.name}</p>
                  <p className="mt-3 font-mono text-3xl font-semibold text-[var(--text-primary)]">{formatPrice(item.price)} €</p>
                </div>
                <p className="text-sm font-semibold" style={changeStyle(item.change24h)}>
                  {item.change24h !== null && item.change24h !== undefined ? `${item.change24h.toFixed(2)}%` : '–'}
                </p>
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Quelle: {item.source}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {(quoteData?.stock ?? []).map((item) => (
            <div key={item.symbol} className="rounded-3xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">{item.name}</p>
                  <p className="mt-3 font-mono text-3xl font-semibold text-[var(--text-primary)]">{formatPrice(item.price)} €</p>
                </div>
                <p className="text-sm font-semibold" style={changeStyle(item.change24h)}>
                  {item.change24h !== null && item.change24h !== undefined ? `${item.change24h.toFixed(2)}%` : '–'}
                </p>
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Quelle: {item.source}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
