'use client';

import { useState } from 'react';
import { UNIVERSE } from '@/lib/universe';
import { QuoteResponse } from '@/types/trade';

function getPrice(symbol: string, quoteData: QuoteResponse | null): number | null {
  if (!quoteData) return null;
  return quoteData.crypto.find(p => p.symbol === symbol)?.price
    ?? quoteData.stock.find(p => p.symbol === symbol)?.price
    ?? null;
}

function formatPrice(value: number | null) {
  if (value === null) return '–';
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const kryptoAssets = UNIVERSE.filter(a => a.bucket === 'krypto');
const aktienEuAssets = UNIVERSE.filter(a => a.bucket === 'aktien-eu');
const aktienUsAssets = UNIVERSE.filter(a => a.bucket === 'aktien-us');

export default function AssetUniversePanel({ quoteData }: { quoteData: QuoteResponse | null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-card">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <span className="font-semibold text-[var(--text-primary)]">
          {open ? '▲' : '▼'}&nbsp; Asset-Universum ({UNIVERSE.length} Werte)
        </span>
        <span className="text-sm text-[var(--text-muted)]">
          {quoteData ? `Stand: ${new Date(quoteData.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Kurse laden…'}
        </span>
      </button>

      {open && (
        <div className="border-t border-[var(--border)] px-6 pb-6 pt-4">
          <div className="grid gap-6 lg:grid-cols-3">

            {/* Krypto */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                ₿ Krypto ({kryptoAssets.length})
              </p>
              <div className="space-y-0.5">
                {kryptoAssets.map(asset => {
                  const price = getPrice(asset.symbol, quoteData);
                  return (
                    <div key={asset.symbol} className="flex items-center justify-between rounded-xl px-3 py-1.5 hover:bg-[var(--bg-tertiary)]">
                      <div className="min-w-0">
                        <span className="font-mono text-xs text-[var(--text-muted)]">{asset.symbol}</span>
                        <span className="ml-2 truncate text-sm text-[var(--text-primary)]">{asset.name}</span>
                      </div>
                      <span className={`ml-3 shrink-0 font-mono text-sm ${price !== null ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`}>
                        {price !== null ? `${formatPrice(price)} €` : '–'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Aktien EU */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                📈 Aktien EU ({aktienEuAssets.length})
              </p>
              <div className="space-y-0.5">
                {aktienEuAssets.map(asset => {
                  const price = getPrice(asset.symbol, quoteData);
                  return (
                    <div key={asset.symbol} className="flex items-center justify-between rounded-xl px-3 py-1.5 hover:bg-[var(--bg-tertiary)]">
                      <div className="min-w-0">
                        <span className="font-mono text-xs text-[var(--text-muted)]">{asset.symbol}</span>
                        <span className="ml-2 truncate text-sm text-[var(--text-primary)]">{asset.name}</span>
                      </div>
                      <span className={`ml-3 shrink-0 font-mono text-sm ${price !== null ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`}>
                        {price !== null ? `${formatPrice(price)} €` : '–'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Aktien US */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                📈 Aktien US ({aktienUsAssets.length})
              </p>
              <div className="space-y-0.5">
                {aktienUsAssets.map(asset => {
                  const price = getPrice(asset.symbol, quoteData);
                  return (
                    <div key={asset.symbol} className="flex items-center justify-between rounded-xl px-3 py-1.5 hover:bg-[var(--bg-tertiary)]">
                      <div className="min-w-0">
                        <span className="font-mono text-xs text-[var(--text-muted)]">{asset.symbol}</span>
                        <span className="ml-2 truncate text-sm text-[var(--text-primary)]">{asset.name}</span>
                      </div>
                      <span className={`ml-3 shrink-0 font-mono text-sm ${price !== null ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'}`}>
                        {price !== null ? `${formatPrice(price)} €` : '–'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
