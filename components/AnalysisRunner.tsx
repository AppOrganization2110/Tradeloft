'use client';

import { AnalysisResult, MarketMode, QuoteResponse } from '@/types/trade';
import AssetUniversePanel from '@/components/AssetUniversePanel';

const MODE_OPTIONS: MarketMode[] = ['Nur Krypto', 'Nur Aktien', 'Beides'];

const SIGNAL_LABELS: Record<string, string> = {
  trend: 'Trend', momentum: 'Momentum', volume: 'Volumen',
  macro: 'Makro', relative: 'Rel. Stärke',
};

function signalCellClass(value: string) {
  if (value.includes('✅')) return 'signal-success border rounded-xl p-3';
  if (value.includes('⚠️')) return 'signal-warning border rounded-xl p-3';
  return 'signal-error border rounded-xl p-3';
}

function rankBorderClass(rank: number) {
  return rank === 1 ? 'border-[var(--accent-cyan)]' : 'border-[var(--border)]';
}

function rankLabel(rank: number) {
  if (rank === 1) return 'Platz 1 · Top-Setup';
  if (rank === 2) return 'Platz 2 · Alternative';
  return 'Platz 3 · Watchlist';
}

function rankBadgeStyle(rank: number): React.CSSProperties {
  if (rank === 1) return { backgroundColor: 'var(--accent-cyan)', color: 'var(--btn-text)' };
  return { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' };
}

function formatPrice(value: number | null | undefined) {
  return value !== null && value !== undefined
    ? value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '–';
}

function getPriceForAsset(symbol: string, quoteData: QuoteResponse | null): number | null {
  if (!quoteData) return null;
  return quoteData.crypto.find((i) => i.symbol === symbol)?.price
    ?? quoteData.stock.find((i) => i.symbol === symbol)?.price
    ?? null;
}

export default function AnalysisRunner({
  capital,
  mode,
  manualAsset,
  onChangeMode,
  onChangeCapital,
  onChangeManualAsset,
  onRunAnalysis,
  onSave,
  analysisResult,
  stopTrading,
  quoteData,
  loading = false,
  scanProgress = null,
}: {
  capital: number;
  mode: MarketMode;
  manualAsset: string;
  onChangeMode: (v: MarketMode) => void;
  onChangeCapital: (v: number) => void;
  onChangeManualAsset: (v: string) => void;
  onRunAnalysis: () => void;
  onSave?: (setupId: string) => void;
  analysisResult: AnalysisResult | null;
  stopTrading: boolean;
  quoteData: QuoteResponse | null;
  loading?: boolean;
  scanProgress?: { current: number; total: number; symbol: string } | null;
}) {

  return (
    <section className="space-y-4">

      {/* Eingabe-Panel */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-card">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Analyse-Runner</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Kapital und Modus wählen → Analyse liefert Top-3 Setups (Platz 1 = bestes Setup).
            </p>
          </div>
          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={stopTrading || loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Analysiere…
              </span>
            ) : 'Analyse starten'}
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <label className="space-y-1 text-sm text-[var(--text-secondary)]">
            Kapital (€)
            <input
              type="number" value={capital} min={100}
              onChange={(e) => onChangeCapital(Number(e.target.value))}
              className="mt-1 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3 text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-cyan)]"
            />
          </label>

          <label className="space-y-1 text-sm text-[var(--text-secondary)]">
            Asset-Modus
            <select
              value={mode}
              onChange={(e) => onChangeMode(e.target.value as MarketMode)}
              className="mt-1 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3 text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-cyan)]"
            >
              {MODE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>

          <label className="space-y-1 text-sm text-[var(--text-secondary)]">
            Manuelles Asset (optional — überschreibt Platz 1)
            <input
              type="text" placeholder="z. B. NVDA, ETH, TSLA"
              value={manualAsset}
              onChange={(e) => onChangeManualAsset(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3 text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-cyan)]"
            />
          </label>
        </div>

        {loading && (
          <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3">
            {scanProgress ? (
              <>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-[var(--text-secondary)]">
                    Universum-Scan · Prüfe {scanProgress.current} von {scanProgress.total} Assets
                  </span>
                  <span className="font-mono text-[var(--accent-cyan)]">{scanProgress.symbol}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent-cyan)]"
                    style={{
                      width: `${(scanProgress.current / scanProgress.total) * 100}%`,
                      transition: 'width 30ms linear',
                    }}
                  />
                </div>
              </>
            ) : (
              <span className="text-sm text-[var(--text-muted)]">Verbinde mit Server…</span>
            )}
          </div>
        )}
      </div>

      {/* Ergebnisse */}
      {loading ? (
        /* Skeleton loader */
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-card animate-pulse">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-48 rounded-full bg-[var(--bg-tertiary)]" />
                  <div className="h-8 w-32 rounded-xl bg-[var(--bg-tertiary)]" />
                  <div className="h-4 w-40 rounded-lg bg-[var(--bg-tertiary)]" />
                </div>
                <div className="h-12 w-32 rounded-2xl bg-[var(--bg-tertiary)]" />
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-5">
                {[1,2,3,4,5].map(j => <div key={j} className="h-16 rounded-xl bg-[var(--bg-tertiary)]" />)}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[1,2,3].map(j => <div key={j} className="h-24 rounded-2xl bg-[var(--bg-tertiary)]" />)}
              </div>
              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                <div className="h-40 rounded-2xl bg-[var(--bg-tertiary)]" />
                <div className="h-40 rounded-2xl bg-[var(--bg-tertiary)]" />
              </div>
            </div>
          ))}
          <p className="text-center text-sm text-[var(--text-muted)]">
            Claude analysiert Marktlage und generiert Setups…
          </p>
        </div>
      ) : analysisResult ? (
        <div className="space-y-4">

          {/* Kontext + Red-Flag */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 shadow-card">
            <p className="text-sm font-medium text-[var(--text-secondary)]">{analysisResult.marketContext}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Red-Flag Status</p>
                <p className={`mt-2 font-semibold ${analysisResult.redFlag.blocked ? 'text-[var(--loss)]' : 'text-[var(--gain)]'}`}>
                  {analysisResult.redFlag.blocked ? `❌ ${analysisResult.redFlag.reason}` : '✅ Keine Flags aktiv'}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Hinweis</p>
                <p className="mt-2 text-sm text-[var(--text-primary)]">{analysisResult.note}</p>
              </div>
            </div>
          </div>

          {/* Setup-Karten */}
          {analysisResult.setups.map((setup) => (
            <div key={setup.id} className={`rounded-3xl border bg-[var(--bg-secondary)] p-6 shadow-card ${rankBorderClass(setup.rank)}`}>

              {/* Card Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]"
                      style={rankBadgeStyle(setup.rank)}
                    >
                      {rankLabel(setup.rank)}
                    </span>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
                      {setup.assetClass === 'crypto' ? '₿ Krypto' : '📈 Aktie'}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">{setup.positiveCount}/5 Signale</span>
                    {setup.decision && (
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                        setup.decision === 'trade'
                          ? 'bg-[var(--gain)] text-white'
                          : 'bg-[var(--loss)] text-white'
                      }`}>
                        {setup.decision === 'trade' ? '✅ Trade' : '🔴 Kein Trade'}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">{setup.asset}</h3>
                  <p className="font-mono text-sm text-[var(--text-muted)]">{setup.symbol} · {setup.direction} · {setup.duration}</p>
                  {setup.decisionReason && (
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">{setup.decisionReason}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Live-Kurs</p>
                    <p className="font-mono text-2xl font-semibold text-[var(--accent-cyan)]">
                      {formatPrice(getPriceForAsset(setup.symbol, quoteData))} €
                    </p>
                  </div>
                  {onSave && (
                    <button
                      type="button"
                      onClick={() => onSave(setup.id)}
                      className="btn-primary text-xs px-4 py-2 min-h-[36px]"
                    >
                      + In Trade-Log speichern
                    </button>
                  )}
                </div>
              </div>

              {/* Signale */}
              <div className="mt-5 grid gap-2 sm:grid-cols-5">
                {(Object.entries(setup.signals) as [keyof typeof setup.signals, string][]).map(([key, val]) => (
                  <div key={key} className={signalCellClass(val)}>
                    <p className="text-xs uppercase tracking-[0.15em] opacity-70">{SIGNAL_LABELS[key] ?? key}</p>
                    <p className="mt-1 text-lg font-semibold">{val}</p>
                  </div>
                ))}
              </div>

              {/* Trade-Parameter */}
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Einstieg</p>
                  <p className="mt-2 font-mono text-lg font-semibold text-[var(--text-primary)]">{formatPrice(setup.entry)} €</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Stop: <span className="font-mono text-[var(--loss)]">{formatPrice(setup.stop)} €</span></p>
                  <p className="text-sm text-[var(--text-secondary)]">Abstand: <span className="font-mono">{setup.stopDistancePercent.toFixed(1)} %</span></p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Take-Profit</p>
                  <p className="mt-2 font-mono text-lg font-semibold text-[var(--gain)]">{formatPrice(setup.target)} €</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">CRV: <span className="font-mono font-bold text-[var(--text-primary)]">{setup.crv}</span></p>
                  <p className="text-sm text-[var(--text-secondary)]">Fenster: {setup.window}</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Positionsgröße</p>
                  <p className="mt-2 font-mono text-lg font-semibold text-[var(--text-primary)]">{formatPrice(setup.positionSize)} €</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Max. Verlust: <span className="font-mono text-[var(--loss)]">{formatPrice(setup.maxLoss)} €</span></p>
                  <p className="text-sm text-[var(--text-secondary)]">Risiko: 2 % Kapital</p>
                </div>
              </div>

              {/* Vollständige Analyse: Technisch + Markteinordnung */}
              <div className="mt-5 grid gap-3 lg:grid-cols-2">

                {/* Technische Analyse */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-cyan)]">🔬 Technische Analyse</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-primary)]">{setup.analysisNarrative}</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
                      <p className="text-xs text-[var(--text-muted)]">Setup-Begründung</p>
                      <p className="mt-1 text-sm text-[var(--text-primary)]">{setup.explanation}</p>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
                      <p className="text-xs text-[var(--text-muted)]">Invalidierung</p>
                      <p className="mt-1 text-sm text-[var(--text-primary)]">{setup.invalidation}</p>
                    </div>
                  </div>
                </div>

                {/* Markteinordnung */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--warning)]">🌍 Markteinordnung</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-primary)]">{setup.assetContext}</p>
                </div>
              </div>

              <p className="mt-4 text-xs text-[var(--text-muted)]">Datenstand: {setup.timestamp}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-8 text-center shadow-card">
          <p className="text-lg font-semibold text-[var(--text-primary)]">Noch keine Analyse</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Kapital und Modus oben einstellen, dann <strong>„Analyse starten"</strong> klicken.
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Ergebnis: Top-3 Setups mit vollständiger Signaltabelle, Trade-Parametern, technischer Analyse und Markteinordnung.
          </p>
        </div>
      )}

      {/* Asset-Universum Panel */}
      <AssetUniversePanel />
    </section>
  );
}
