'use client';

import { useEffect, useState } from 'react';
import { getWindowState, WindowState } from '@/lib/rules/timeWindows';
import { TIME_WINDOWS } from '@/lib/rules/config';

function fmtCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const LIGHT_COLOR: Record<WindowState['trafficLight'], string> = {
  green:  'var(--gain)',
  yellow: 'var(--warning)',
  red:    'var(--loss)',
};

const QUALITY_COLOR: Record<string, string> = {
  'sehr hoch': 'var(--gain)',
  'hoch':      'var(--accent-cyan)',
  'niedrig':   'var(--warning)',
};

export default function TimePanel() {
  const [ws, setWs] = useState<WindowState>(() => getWindowState(new Date()));

  useEffect(() => {
    const id = setInterval(() => setWs(getWindowState(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  const lightColor = LIGHT_COLOR[ws.trafficLight];

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-card p-6 mb-6 space-y-5">

      {/* ── Ampel-Zeile ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="inline-block h-4 w-4 rounded-full shrink-0"
            style={{ background: lightColor, boxShadow: `0 0 8px ${lightColor}` }}
          />
          <span className="font-semibold text-[var(--text-primary)]">{ws.trafficReason}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
          <span>Spread-Schwelle: <span className="font-mono text-[var(--accent-cyan)]">{(ws.spreadThreshold * 100).toFixed(0)} %</span></span>
          {ws.activeBuckets.length > 0 && (
            <span>Aktiv: <span className="text-[var(--text-secondary)]">{ws.activeBuckets.join(' + ')}</span></span>
          )}
        </div>
      </div>

      {/* ── Countdown-Block ── */}
      <div className="flex flex-col sm:flex-row gap-4">
        {ws.activeWindow && (
          <div className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-5 py-4">
            <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-1">Verbleibend</p>
            <p className="font-mono text-3xl font-bold" style={{ color: lightColor }}>
              {fmtCountdown(ws.msRemainingInCurrent)}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{ws.activeWindow.name}</p>
          </div>
        )}
        <div className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-5 py-4">
          <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-1">Nächstes Fenster</p>
          <p className="font-mono text-3xl font-bold text-[var(--text-secondary)]">
            {fmtCountdown(ws.msToNextWindow)}
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{ws.nextWindow.name}</p>
        </div>
      </div>

      {/* ── Info-Kacheln ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Beste Analyse',     value: ws.bestAnalysisTime },
          { label: 'Späteste Abgabe',   value: ws.latestEntry },
          { label: 'Spätestes Schließen', value: ws.latestClose },
          { label: 'Buckets',           value: ws.activeBuckets.length > 0 ? ws.activeBuckets.join(', ') : '—' },
        ].map(tile => (
          <div key={tile.label} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3">
            <p className="text-xs text-[var(--text-muted)] mb-1">{tile.label}</p>
            <p className="font-mono text-lg font-semibold text-[var(--text-primary)]">{tile.value}</p>
          </div>
        ))}
      </div>

      {/* ── Fensterübersicht ── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Tagesübersicht</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {TIME_WINDOWS.filter(w => w.id !== 'crypto').map(w => {
            const isActive = ws.activeWindow?.id === w.id;
            const qualColor = QUALITY_COLOR[w.quality] ?? 'var(--text-secondary)';
            return (
              <div
                key={w.id}
                className="rounded-2xl border px-4 py-3 transition"
                style={{
                  borderColor: isActive ? lightColor : 'var(--border)',
                  boxShadow: isActive ? `0 0 12px ${lightColor}33` : undefined,
                  opacity: !isActive && ws.activeWindow ? 0.6 : 1,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[var(--text-primary)]">{w.name}</span>
                  <span className="text-xs font-mono" style={{ color: qualColor }}>{w.quality}</span>
                </div>
                <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">
                  {String(w.startH).padStart(2,'0')}:{String(w.startM).padStart(2,'0')}–{String(w.endH).padStart(2,'0')}:{String(w.endM).padStart(2,'0')}
                  {'  '}{w.buckets.join(' + ')}
                </p>
                {w.onlyStrong && (
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--warning)' }}>Nur starke Setups</p>
                )}
              </div>
            );
          })}
          {/* Crypto note */}
          <div
            className="rounded-2xl border px-4 py-3 transition"
            style={{
              borderColor: ws.activeWindow?.id === 'crypto' ? lightColor : 'var(--border)',
              boxShadow: ws.activeWindow?.id === 'crypto' ? `0 0 12px ${lightColor}33` : undefined,
              opacity: ws.activeWindow?.id !== 'crypto' && ws.activeWindow ? 0.6 : 1,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[var(--text-primary)]">Krypto-only</span>
              <span className="text-xs font-mono" style={{ color: QUALITY_COLOR['niedrig'] }}>niedrig</span>
            </div>
            <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">22:00–09:00  crypto</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">Cutoff 22:00 · kein Overnight</p>
          </div>
        </div>
      </div>

    </div>
  );
}
