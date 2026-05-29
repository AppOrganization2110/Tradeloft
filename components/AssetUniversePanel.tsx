'use client';

import { useMemo, useState } from 'react';
import { FULL_UNIVERSE } from '@/lib/rules/constituents';

const euAssets    = FULL_UNIVERSE.filter(a => a.bucket === 'eu');
const usAssets    = FULL_UNIVERSE.filter(a => a.bucket === 'us');
const cryptoAssets = FULL_UNIVERSE.filter(a => a.bucket === 'crypto');

const SECTIONS = [
  { label: '₿ Krypto',    assets: cryptoAssets },
  { label: '📈 Aktien EU', assets: euAssets     },
  { label: '📈 Aktien US', assets: usAssets     },
] as const;

export default function AssetUniversePanel() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FULL_UNIVERSE;
    return FULL_UNIVERSE.filter(
      a => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
    );
  }, [query]);

  const filteredSections = SECTIONS.map(s => ({
    label: s.label,
    assets: filtered.filter(a => a.bucket === s.assets[0]?.bucket),
  }));

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-card">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <span className="font-semibold text-[var(--text-primary)]">
          {open ? '▲' : '▼'}&nbsp; Asset-Universum ({FULL_UNIVERSE.length} Werte)
        </span>
        <span className="text-sm text-[var(--text-muted)]">DAX40 · EuroStoxx50 · Nasdaq100 · Krypto Top20</span>
      </button>

      {open && (
        <div className="border-t border-[var(--border)] px-6 pb-6 pt-4 space-y-4">

          {/* Search */}
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Suche (Symbol oder Name)…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-cyan)]"
          />

          {/* Columns */}
          <div className="grid gap-6 lg:grid-cols-3">
            {filteredSections.map(section => (
              <div key={section.label}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  {section.label} ({section.assets.length})
                </p>
                <div className="overflow-y-auto max-h-[400px] space-y-0.5 pr-1">
                  {section.assets.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-[var(--text-muted)]">Keine Treffer</p>
                  ) : section.assets.map(asset => (
                    <div
                      key={asset.symbol}
                      className="flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-[var(--bg-tertiary)]"
                    >
                      <span className="font-mono text-xs text-[var(--text-muted)] w-20 shrink-0">{asset.symbol}</span>
                      <span className="truncate text-sm text-[var(--text-primary)]">{asset.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
