'use client';

import { useEffect, useMemo, useState } from 'react';
import { QuoteResponse } from '@/types/trade';

function timeSince(date: Date) {
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
}

function formatTimestamp(timestamp?: string | null) {
  return timestamp ? new Date(timestamp).toLocaleTimeString('de-DE') : '–';
}

function formatPrice(value: number | null | undefined) {
  return value !== null && value !== undefined
    ? value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '–';
}

function changeClass(value: number | null | undefined) {
  if (value === null || value === undefined) return 'text-slate-300';
  return value >= 0 ? 'text-emerald-400' : 'text-rose-400';
}

function SummaryRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-bg-tertiary p-5 text-sm text-slate-300 shadow-card">
      <p className="text-slate-500">{title}</p>
      <p className="mt-3 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

export default function LiveQuotes({ quoteData }: { quoteData: QuoteResponse | null }) {
  const [ageSeconds, setAgeSeconds] = useState<number>(0);

  useEffect(() => {
    if (!quoteData) return;
    const interval = setInterval(() => {
      setAgeSeconds(timeSince(new Date(quoteData.timestamp)));
    }, 1000);
    setAgeSeconds(timeSince(new Date(quoteData.timestamp)));
    return () => clearInterval(interval);
  }, [quoteData]);

  const ageWarning = useMemo(() => {
    if (!quoteData) return null;
    const maxAge = Math.max(
      ...[...quoteData.crypto, ...quoteData.stock].map((item) => {
        const timestamp = item.lastUpdatedAt ? new Date(item.lastUpdatedAt) : new Date(0);
        return timeSince(timestamp);
      })
    );

    if (maxAge > 15 * 60) {
      return { type: 'red', message: 'Bitte manuell aktualisieren: Daten älter als 15 Minuten.' };
    }
    if (maxAge > 5 * 60) {
      return { type: 'yellow', message: 'Achtung: Daten älter als 5 Minuten.' };
    }
    return null;
  }, [quoteData]);

  const marketQuote = useMemo(() => {
    if (!quoteData) return null;
    return quoteData.stock.find((item) => item.symbol === '^GDAXI') ?? null;
  }, [quoteData]);

  return (
    <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] fade-in">
      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-6 shadow-card">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Live-Kurse</h2>
              <p className="text-sm text-text-secondary">Datenstand: {quoteData ? new Date(quoteData.timestamp).toLocaleTimeString('de-DE') : 'lade...'}</p>
            </div>
            <div className="text-right text-sm text-slate-300">Alter: {quoteData ? `${ageSeconds}s` : '–'}</div>
          </div>

          {ageWarning ? (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                ageWarning.type === 'red'
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                  : 'border-amber-300/30 bg-amber-400/10 text-amber-200'
              }`}
            >
              {ageWarning.message}
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(quoteData?.crypto ?? []).map((item) => (
              <div key={item.symbol} className="rounded-3xl border border-slate-700 bg-bg-tertiary p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{item.name}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-white text-right">{formatPrice(item.price)} €</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${changeClass(item.change24h)}`}>{item.change24h !== null && item.change24h !== undefined ? `${item.change24h.toFixed(2)}%` : '–'}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-slate-500">{item.source}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 text-xs text-slate-500">
                  <p>Daten von: {formatTimestamp(item.lastUpdatedAt)}</p>
                  <p>Quelle: {item.source}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(quoteData?.stock ?? []).map((item) => (
              <div key={item.symbol} className="rounded-3xl border border-slate-700 bg-bg-tertiary p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{item.name}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-white text-right">{formatPrice(item.price)} €</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${changeClass(item.change24h)}`}>{item.change24h !== null && item.change24h !== undefined ? `${item.change24h.toFixed(2)}%` : '–'}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-slate-500">{item.source}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 text-xs text-slate-500">
                  <p>Daten von: {formatTimestamp(item.lastUpdatedAt)}</p>
                  <p>Quelle: {item.source}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <SummaryRow title="Marktindex" value={marketQuote?.price ? `${formatPrice(marketQuote.price)} €` : 'lade...'} />
        <SummaryRow title="Datenstand" value={quoteData ? new Date(quoteData.timestamp).toLocaleString('de-DE') : 'lade...'} />
        <SummaryRow title="Alter in Sekunden" value={quoteData ? `${ageSeconds}s` : 'lade...'} />
      </div>
    </section>
  );
}
