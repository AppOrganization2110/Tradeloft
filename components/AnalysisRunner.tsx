'use client';

import { useMemo } from 'react';
import { AnalysisResult, MarketMode, QuoteResponse, UniverseMode } from '@/types/trade';

const modeOptions: MarketMode[] = ['Nur Krypto', 'Nur Aktien', 'Beides'];
const universeOptions: UniverseMode[] = ['Standard', 'Erweitert', 'Manuell'];

function renderBadge(value: string) {
  return (
    <span className="rounded-full border border-slate-700 bg-bg-tertiary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-200">
      {value}
    </span>
  );
}

function statusClass(value: string) {
  if (value.includes('✅')) return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20';
  if (value.includes('⚠')) return 'bg-amber-400/10 text-amber-200 border border-amber-300/20';
  return 'bg-rose-500/10 text-rose-200 border border-rose-500/20';
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
  const nextAsset = useMemo(() => {
    if (manualAsset.trim()) return manualAsset.trim().toUpperCase();
    if (mode === 'Nur Krypto') return 'BTC';
    if (mode === 'Nur Aktien') return 'AAPL';
    return 'ETH';
  }, [manualAsset, mode]);

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-6 shadow-card">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Analyse-Runner</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Eingabe von Kapital, Asset-Modus und Universum. Danach Red-Flag-Check und Top-3-Setups.
            </p>
          </div>
          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={stopTrading}
            className="inline-flex min-h-[44px] items-center justify-center rounded-3xl bg-accent-cyan px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            Analyse starten
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <label className="space-y-2 text-sm text-slate-300">
            Kapital (€)
            <input
              type="number"
              value={capital}
              min={100}
              onChange={(event) => onChangeCapital(Number(event.target.value))}
              className="w-full rounded-2xl border border-slate-700 bg-bg-tertiary px-4 py-3 text-white outline-none transition focus:border-accent-cyan"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-300">
            Asset-Modus
            <select
              value={mode}
              onChange={(event) => onChangeMode(event.target.value as MarketMode)}
              className="w-full rounded-2xl border border-slate-700 bg-bg-tertiary px-4 py-3 text-white outline-none transition focus:border-accent-cyan"
            >
              {modeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-300">
            Asset-Universum
            <select
              value={universe}
              onChange={(event) => onChangeUniverse(event.target.value as UniverseMode)}
              className="w-full rounded-2xl border border-slate-700 bg-bg-tertiary px-4 py-3 text-white outline-none transition focus:border-accent-cyan"
            >
              {universeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-300">
            Manuelles Asset (optional)
            <input
              type="text"
              placeholder="z. B. AAPL oder BTC"
              value={manualAsset}
              onChange={(event) => onChangeManualAsset(event.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-bg-tertiary px-4 py-3 text-white outline-none transition focus:border-accent-cyan"
            />
          </label>

          <div className="rounded-3xl border border-slate-700 bg-bg-tertiary p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Vorschau</p>
            <p className="mt-3 leading-6">
              Analysiere {manualAsset.trim() ? manualAsset.toUpperCase() : nextAsset} im Modus {mode}. Ergebnisse werden auf Basis live abrufbarer Marktdaten gerendert.
            </p>
            {quoteData ? (
              <p className="mt-3 text-slate-400">Letzte Quote: {quoteData.timestamp}</p>
            ) : (
              <p className="mt-3 text-slate-400">Live-Daten werden geladen …</p>
            )}
          </div>
        </div>
      </div>

      {analysisResult ? (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-6 shadow-card">
            <p className="mb-4 text-sm text-text-secondary">{analysisResult.marketContext}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-700 bg-bg-tertiary p-4">
                <p className="text-sm text-slate-400">Red Flag Status</p>
                <p className={`mt-2 text-lg font-semibold ${analysisResult.redFlag.blocked ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {analysisResult.redFlag.blocked ? `❌ ${analysisResult.redFlag.reason}` : '✅ Keine Flags aktiv'}
                </p>
                {analysisResult.redFlag.warning ? <p className="mt-2 text-slate-400">{analysisResult.redFlag.warning}</p> : null}
              </div>
              <div className="rounded-3xl border border-slate-700 bg-bg-tertiary p-4">
                <p className="text-sm text-slate-400">Hinweis</p>
                <p className="mt-2 text-slate-100">{analysisResult.note}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {analysisResult.setups.map((setup) => (
              <div key={setup.id} className="rounded-3xl border border-slate-700 bg-bg-secondary p-6 shadow-card">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">SETUP #{setup.id}</h3>
                    <p className="text-sm text-slate-400">{setup.asset} | {setup.direction}</p>
                  </div>
                  <div>{renderBadge(`${setup.positiveCount}/5 Familien positiv`)}</div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {Object.entries(setup.signals).map(([key, value]) => (
                    <div key={key} className="rounded-3xl border border-slate-700 bg-bg-tertiary p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{key}</p>
                      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-700 bg-bg-tertiary p-4 text-sm text-slate-300">
                    <p className="text-slate-400">Einstieg</p>
                    <p className="mt-2 text-lg text-white">{setup.entry.toFixed(2)} €</p>
                    <p className="mt-1">SL: {setup.stop.toFixed(2)} €</p>
                    <p>Einsatz: {setup.positionSize.toFixed(2)} €</p>
                  </div>
                  <div className="rounded-3xl border border-slate-700 bg-bg-tertiary p-4 text-sm text-slate-300">
                    <p className="text-slate-400">Take-Profit</p>
                    <p className="mt-2 text-lg text-white">{setup.target.toFixed(2)} €</p>
                    <p className="mt-1">Max. Verlust: {setup.maxLoss.toFixed(2)} €</p>
                    <p className="mt-1">CRV: {setup.crv}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-700 bg-bg-tertiary p-4 text-sm text-slate-300">
                    <p className="text-slate-400">Erklärung</p>
                    <p className="mt-2 text-white">{setup.explanation}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-700 bg-bg-tertiary p-4 text-sm text-slate-300">
                    <p className="text-slate-400">Invalidierung</p>
                    <p className="mt-2 text-white">{setup.invalidation}</p>
                  </div>
                </div>

                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Datenstand: {setup.timestamp}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-700 bg-bg-tertiary p-6 text-slate-300 shadow-card">
          <p className="text-sm">
            Keine Analyse ausgeführt. Fülle Kapital und Asset-Einstellungen aus, dann klicke auf &quot;Analyse starten&quot;.
          </p>
        </div>
      )}
    </section>
  );
}
