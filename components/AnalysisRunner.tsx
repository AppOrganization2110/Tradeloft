'use client';

import { useMemo } from 'react';
import { AnalysisResult, MarketMode, QuoteResponse, UniverseMode } from '@/types/trade';

const modeOptions: MarketMode[] = ['Nur Krypto', 'Nur Aktien', 'Beides'];
const universeOptions: UniverseMode[] = ['Standard', 'Erweitert', 'Manuell'];

const SIGNAL_LABELS: Record<string, string> = {
  trend: 'Trend',
  momentum: 'Momentum',
  volume: 'Volumen',
  macro: 'Makro',
  relative: 'Relative Stärke',
};

function signalCellClass(value: string) {
  if (value.includes('✅')) return 'signal-success border rounded-xl p-3';
  if (value.includes('⚠️')) return 'signal-warning border rounded-xl p-3';
  return 'signal-error border rounded-xl p-3';
}

function rankBadgeClass(rank: number) {
  if (rank === 1) return 'rank-badge-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]';
  if (rank === 2) return 'rank-badge-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]';
  return 'rank-badge-3 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]';
}

function rankLabel(rank: number) {
  if (rank === 1) return 'Platz 1 · Top-Setup';
  if (rank === 2) return 'Platz 2 · Alternative';
  return 'Platz 3 · Watchlist';
}

function formatPrice(value: number | null | undefined) {
  return value !== null && value !== undefined
    ? value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '–';
}

function getPriceForAsset(symbol: string, quoteData: QuoteResponse | null): number | null {
  if (!quoteData) return null;
  const cryptoItem = quoteData.crypto.find((item) => item.symbol === symbol);
  if (cryptoItem?.price != null) return cryptoItem.price;
  const stockItem = quoteData.stock.find((item) => item.symbol === symbol);
  return stockItem?.price ?? null;
}

export default function AnalysisRunner({
  capital,
  mode,
  universe,
  manualAsset,
  onChangeMode,
  onChangeUniverse,
  onChangeCapital,
  onChangeManualAsset,
  onRunAnalysis,
  analysisResult,
  stopTrading,
  quoteData,
}: {
  capital: number;
  mode: MarketMode;
  universe: UniverseMode;
  manualAsset: string;
  onChangeMode: (value: MarketMode) => void;
  onChangeUniverse: (value: UniverseMode) => void;
  onChangeCapital: (value: number) => void;
  onChangeManualAsset: (value: string) => void;
  onRunAnalysis: () => void;
  analysisResult: AnalysisResult | null;
  stopTrading: boolean;
  quoteData: QuoteResponse | null;
}) {
  const previewLabel = useMemo(() => {
    if (manualAsset.trim()) return manualAsset.trim().toUpperCase();
    if (mode === 'Nur Krypto') return 'BTC · ETH · SOL';
    if (mode === 'Nur Aktien') return 'AAPL · NVDA · AMZN';
    return 'BTC · AAPL · ETH';
  }, [manualAsset, mode]);

  return (
    <section className="space-y-4">
      {/* Eingabe-Panel */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-card">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Analyse-Runner</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Kapital, Asset-Modus und Universum einstellen → Analyse liefert Top-3 Setups (Platz 1–3).
            </p>
          </div>
          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={stopTrading}
            className="btn-primary"
          >
            Analyse starten
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <label className="space-y-2 text-sm text-[var(--text-secondary)]">
            Kapital (€)
            <input
              type="number"
              value={capital}
              min={100}
              onChange={(event) => onChangeCapital(Number(event.target.value))}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3 text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-cyan)]"
            />
          </label>

          <label className="space-y-2 text-sm text-[var(--text-secondary)]">
            Asset-Modus
            <select
              value={mode}
              onChange={(event) => onChangeMode(event.target.value as MarketMode)}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3 text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-cyan)]"
            >
              {modeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-[var(--text-secondary)]">
            Asset-Universum
            <select
              value={universe}
              onChange={(event) => onChangeUniverse(event.target.value as UniverseMode)}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3 text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-cyan)]"
            >
              {universeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm text-[var(--text-secondary)]">
            Manuelles Asset (optional — überschreibt Platz 1)
            <input
              type="text"
              placeholder="z. B. AAPL, NVDA, BTC, ETH"
              value={manualAsset}
              onChange={(event) => onChangeManualAsset(event.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-3 text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-cyan)]"
            />
          </label>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4 text-sm text-[var(--text-secondary)]">
            <p className="font-semibold text-[var(--text-primary)]">Vorschau</p>
            <p className="mt-3 leading-6">
              Modus: <span className="font-medium text-[var(--accent-cyan)]">{mode}</span> · Universum: <span className="font-medium text-[var(--accent-cyan)]">{universe}</span>
            </p>
            <p className="mt-1 leading-6">
              Analysierte Assets: <span className="font-mono text-[var(--text-primary)]">{previewLabel}</span>
            </p>
            <p className="mt-3 text-xs text-[var(--text-muted)]">Quote-Stand: {quoteData ? quoteData.timestamp : 'lade…'}</p>
          </div>
        </div>
      </div>

      {/* Analyse-Ergebnis */}
      {analysisResult ? (
        <div className="space-y-4">
          {/* Kontext + Red-Flag */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-card">
            <p className="text-sm font-medium text-[var(--text-secondary)]">{analysisResult.marketContext}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Red Flag Status</p>
                <p className={`mt-2 text-base font-semibold ${analysisResult.redFlag.blocked ? 'text-[var(--loss)]' : 'text-[var(--gain)]'}`}>
                  {analysisResult.redFlag.blocked ? `❌ ${analysisResult.redFlag.reason}` : '✅ Keine Flags aktiv'}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Hinweis</p>
                <p className="mt-2 text-sm text-[var(--text-primary)]">{analysisResult.note}</p>
              </div>
            </div>
          </div>

          {/* Top-3 Setup Cards */}
          {analysisResult.setups.map((setup) => (
            <div
              key={setup.id}
              className={`rounded-3xl border bg-[var(--bg-secondary)] p-6 shadow-card ${setup.rank === 1 ? 'border-[var(--accent-cyan)]' : 'border-[var(--border)]'}`}
            >
              {/* Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={rankBadgeClass(setup.rank)}>{rankLabel(setup.rank)}</span>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--bg-tertiary)] px-2 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
                      {setup.assetClass === 'crypto' ? '₿ Krypto' : '📈 Aktie'}
                    </span>
                  </div>
                  <h3 className="mt-3 text-2xl font-bold text-[var(--text-primary)]">{setup.asset}</h3>
                  <p className="mt-1 font-mono text-sm text-[var(--text-muted)]">{setup.symbol} · {setup.direction} · {setup.duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Live-Kurs</p>
                  <p className="mt-1 font-mono text-2xl font-semibold text-[var(--accent-cyan)]">
                    {formatPrice(getPriceForAsset(setup.symbol, quoteData))} €
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{setup.positiveCount}/5 Signale grün</p>
                </div>
              </div>

              {/* Signale */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {(Object.entries(setup.signals) as [keyof typeof setup.signals, string][]).map(([key, value]) => (
                  <div key={key} className={signalCellClass(value)}>
                    <p className="text-xs uppercase tracking-[0.18em] opacity-70">{SIGNAL_LABELS[key] ?? key}</p>
                    <p className="mt-2 text-lg font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              {/* Trade-Parameter */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Einstieg</p>
                  <p className="mt-2 font-mono text-lg font-semibold text-[var(--text-primary)]">{formatPrice(setup.entry)} €</p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    Stop-Loss: <span className="font-mono text-[var(--loss)]">{formatPrice(setup.stop)} €</span>
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Stop-Abstand: <span className="font-mono">{setup.stopDistancePercent.toFixed(1)} %</span>
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Take-Profit</p>
                  <p className="mt-2 font-mono text-lg font-semibold text-[var(--gain)]">{formatPrice(setup.target)} €</p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    CRV: <span className="font-mono font-semibold text-[var(--text-primary)]">{setup.crv}</span>
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">Fenster: {setup.window}</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Positionsgröße</p>
                  <p className="mt-2 font-mono text-lg font-semibold text-[var(--text-primary)]">{formatPrice(setup.positionSize)} €</p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    Max. Verlust: <span className="font-mono text-[var(--loss)]">{formatPrice(setup.maxLoss)} €</span>
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">Risiko: 2% Kapital</p>
                </div>
              </div>

              {/* Erklärung + Invalidierung */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Setup-Begründung</p>
                  <p className="mt-2 text-sm text-[var(--text-primary)]">{setup.explanation}</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Invalidierung</p>
                  <p className="mt-2 text-sm text-[var(--text-primary)]">{setup.invalidation}</p>
                </div>
              </div>

              {/* Analyse-Narrativ */}
              <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Vollständige Analyse</p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-primary)]">{setup.analysisNarrative}</p>
              </div>

              <p className="mt-4 text-xs text-[var(--text-muted)]">Datenstand: {setup.timestamp}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-6 text-[var(--text-secondary)] shadow-card">
          Keine Analyse ausgeführt. Kapital und Asset-Einstellungen oben wählen, dann <strong className="text-[var(--text-primary)]">„Analyse starten"</strong> klicken.
          <br />
          <span className="mt-1 block text-xs text-[var(--text-muted)]">
            Die Analyse liefert Top-3 Setups (Platz 1 = bestes Setup) mit vollständiger Signal-Tabelle, Trade-Parametern und Analyse-Text.
          </span>
        </div>
      )}
    </section>
  );
}
