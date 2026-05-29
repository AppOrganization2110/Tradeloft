'use client';

import {
  RISK,
  SIGNALS,
  RED_FLAG_LABELS,
  TRADE_RULES,
  TIME_WINDOWS,
  TIME_CONFIG,
} from '@/lib/rules/config';

const QUALITY_COLOR: Record<string, string> = {
  'sehr hoch': 'var(--gain)',
  'hoch':      'var(--accent-cyan)',
  'niedrig':   'var(--warning)',
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-[var(--border)] last:border-0">
      <span className="text-sm text-[var(--text-muted)] min-w-[160px]">{label}</span>
      <span className="font-mono text-sm text-[var(--text-primary)] text-right">{value}</span>
    </div>
  );
}

export default function RulesTab() {
  return (
    <div className="space-y-6">

      {/* ── Risiko-Regeln ── */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-card p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-cyan)]">Risiko-Konfiguration</h2>
        <Row label="Max. Risiko / Trade"     value={`${(RISK.perTrade * 100).toFixed(0)} % des Kapitals`} />
        <Row label="Mindest-CRV"             value={`1 : ${RISK.minCrv.toFixed(1)}`} />
        <Row label="Tagesverlust-Limit"      value={`${(RISK.dailyLossLimit * 100).toFixed(0)} % → Handelsstopp`} />
        <Row label="Max. offene Trades"      value={String(RISK.maxOpenTrades)} />
        <Row label="Spread Xetra-Kernzeit"   value={`≤ ${(RISK.spread.xetraCore * 100).toFixed(2)} %  (09:00–17:30)`} />
        <Row label="Spread außerhalb Xetra"  value={`≤ ${(RISK.spread.extended * 100).toFixed(2)} %  (L&S / Tradegate)`} />
        <Row label="Min. Relatives Volumen"  value={`≥ ${(RISK.minRelativeVolume * 100).toFixed(0)} % des Tagesschnitts`} />
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Positionsgröße = (Kapital × {RISK.perTrade * 100} %) ÷ Stop-Abstand %  |  keine Gebührenabzüge  |  gekappt auf Kapital
        </p>
      </div>

      {/* ── Signale ── */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-card p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-cyan)]">Signal-Familien</h2>
        <Row label="Mindest-Signale"  value={`${SIGNALS.required} / ${SIGNALS.total} grün`} />
        <div className="mt-3 flex flex-wrap gap-2">
          {SIGNALS.families.map(f => (
            <span key={f} className="rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-1 text-xs text-[var(--text-secondary)]">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* ── Red Flags ── */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-card p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--loss)]">Red Flags (harter Blocker)</h2>
        <div className="space-y-2">
          {RED_FLAG_LABELS.map(label => (
            <div key={label} className="flex items-center gap-3 rounded-xl bg-[var(--bg-tertiary)] px-4 py-2.5">
              <span className="text-[var(--loss)] text-xs">❌</span>
              <span className="text-sm text-[var(--text-primary)]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Handelsregeln ── */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-card p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-cyan)]">Handelsregeln</h2>
        <ol className="space-y-2">
          {TRADE_RULES.map((rule, i) => (
            <li key={i} className="flex gap-3 rounded-xl bg-[var(--bg-tertiary)] px-4 py-2.5">
              <span className="font-mono text-xs text-[var(--text-muted)] shrink-0 w-5">{i + 1}.</span>
              <span className="text-sm text-[var(--text-primary)]">{rule}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* ── Zeitfenster-Tabelle ── */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-card p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent-cyan)]">Handelszeitfenster</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Prio', 'Name', 'Zeit', 'Qualität', 'Buckets', 'Hinweis'].map(h => (
                  <th key={h} className="pb-2 pr-4 text-left text-xs uppercase tracking-wider text-[var(--text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_WINDOWS.map(w => {
                const qColor = QUALITY_COLOR[w.quality] ?? 'var(--text-secondary)';
                return (
                  <tr key={w.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-4 font-mono text-[var(--text-muted)]">{w.priority}</td>
                    <td className="py-2 pr-4 text-[var(--text-primary)]">{w.name}</td>
                    <td className="py-2 pr-4 font-mono text-[var(--text-secondary)]">
                      {String(w.startH).padStart(2,'0')}:{String(w.startM).padStart(2,'0')}–{String(w.endH).padStart(2,'0')}:{String(w.endM).padStart(2,'0')}
                    </td>
                    <td className="py-2 pr-4">
                      <span className="text-xs font-semibold" style={{ color: qColor }}>{w.quality}</span>
                    </td>
                    <td className="py-2 pr-4 text-[var(--text-muted)]">{w.buckets.join(', ')}</td>
                    <td className="py-2 text-xs text-[var(--text-muted)]">
                      {w.onlyStrong ? 'Nur starke Setups' : (w.note ?? '—')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Min. Haltedauer',    value: `${TIME_CONFIG.minHoldMin} min` },
            { label: 'Puffer vor Ende',    value: `${TIME_CONFIG.closeMarginMin} min` },
            { label: 'Settle-Puffer',      value: `${TIME_CONFIG.settlePufferMin} min` },
            { label: 'Krypto-Cutoff',      value: `${TIME_CONFIG.cryptoCutoffH}:00 Uhr` },
          ].map(item => (
            <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3">
              <p className="text-xs text-[var(--text-muted)]">{item.label}</p>
              <p className="font-mono text-sm font-semibold text-[var(--text-primary)]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
