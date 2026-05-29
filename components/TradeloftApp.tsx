'use client';

import { useEffect, useMemo, useState } from 'react';
import AnalysisRunner from '@/components/AnalysisRunner';
import TradeLog from '@/components/TradeLog';
import CapitalTracker from '@/components/CapitalTracker';
import { loadFromStorage, saveToStorage } from '@/lib/localStorage';
import { buildAnalysisResult } from '@/lib/tradeloft';
import { AnalysisResult, MarketMode, QuoteResponse, TradeLogEntry, UniverseMode } from '@/types/trade';

const THEME_KEY = 'tradeloft-theme';
const STATE_KEY = 'tradeloft-state';

const initialState = {
  capital: 10000,
  mode: 'Beides' as MarketMode,
  universe: 'Standard' as UniverseMode,
  manualAsset: '',
  tradeLog: [] as TradeLogEntry[],
};

export default function TradeloftApp() {
  const [capital, setCapital] = useState(initialState.capital);
  const [mode, setMode] = useState<MarketMode>(initialState.mode);
  const [universe, setUniverse] = useState<UniverseMode>(initialState.universe);
  const [manualAsset, setManualAsset] = useState(initialState.manualAsset);
  const [darkMode, setDarkMode] = useState(true);
  const [quoteData, setQuoteData] = useState<QuoteResponse | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [tradeLog, setTradeLog] = useState<TradeLogEntry[]>(initialState.tradeLog);

  useEffect(() => {
    const saved = loadFromStorage<typeof initialState>(STATE_KEY, initialState);
    setCapital(saved.capital);
    setMode(saved.mode);
    setUniverse(saved.universe);
    setManualAsset(saved.manualAsset);
    setTradeLog(saved.tradeLog);
    setDarkMode(loadFromStorage<boolean>(THEME_KEY, true));
  }, []);

  useEffect(() => {
    saveToStorage(STATE_KEY, { capital, mode, universe, manualAsset, tradeLog });
  }, [capital, mode, universe, manualAsset, tradeLog]);

  useEffect(() => {
    saveToStorage(THEME_KEY, darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        const response = await fetch('/api/quotes');
        if (!response.ok) return;
        const data = (await response.json()) as QuoteResponse;
        setQuoteData(data);
      } catch {
        // ignore
      }
    };

    loadQuotes();
    const interval = window.setInterval(loadQuotes, 15000);
    return () => window.clearInterval(interval);
  }, []);

  const todayLoss = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return tradeLog
      .filter((entry) => entry.timestamp.slice(0, 10) === today)
      .reduce((sum, entry) => sum + (entry.result ?? 0), 0);
  }, [tradeLog]);

  const stopTrading = todayLoss <= -(capital * 0.06);

  const runAnalysis = () => {
    if (stopTrading) {
      return;
    }
    setAnalysisResult(buildAnalysisResult(capital, mode, universe, manualAsset, quoteData));
  };

  const saveTrade = (setupId: string) => {
    if (!analysisResult) return;
    const setup = analysisResult.setups.find((item) => item.id === setupId);
    if (!setup) return;

    const entry: TradeLogEntry = {
      id: `${Date.now()}-${setup.id}`,
      timestamp: new Date().toISOString(),
      asset: setup.asset,
      symbol: setup.symbol,
      direction: setup.direction,
      entry: setup.entry,
      stop: setup.stop,
      target: setup.target,
      positionSize: setup.positionSize,
      maxLoss: setup.maxLoss,
      signals: setup.signals,
      analysisText: `${setup.explanation} ${setup.invalidation}`,
      marketMode: mode,
      capital,
    };

    setTradeLog((current) => [entry, ...current]);
  };

  const updateTrade = (entry: TradeLogEntry) => {
    setTradeLog((current) => current.map((item) => (item.id === entry.id ? entry : item)));
  };

  const exportTradeLog = () => {
    const blob = new Blob([JSON.stringify(tradeLog, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'trade-log.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <AnalysisRunner
          capital={capital}
          mode={mode}
          universe={universe}
          manualAsset={manualAsset}
          onChangeMode={setMode}
          onChangeUniverse={setUniverse}
          onChangeCapital={setCapital}
          onChangeManualAsset={setManualAsset}
          onRunAnalysis={runAnalysis}
          analysisResult={analysisResult}
          stopTrading={stopTrading}
          quoteData={quoteData}
        />
        <div className="space-y-4">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-card">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Dashboard-Übersicht</h2>
            <div className="mt-5 space-y-3 text-sm text-[var(--text-secondary)]">
              <p>Kapital: <span className="font-mono font-semibold text-[var(--text-primary)]">{capital.toFixed(2)} €</span></p>
              <p>Tagesverlust-Limit: <span className="font-mono font-semibold text-[var(--warning)]">{(capital * 0.06).toFixed(2)} €</span></p>
              <p className={stopTrading ? 'font-semibold text-[var(--loss)]' : ''}>
                {stopTrading ? '⛔ HANDELSSTOPP: Tagesverlust-Limit erreicht.' : `Tagesverlust heute: ${todayLoss.toFixed(2)} €`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDarkMode((current) => !current)}
              className="btn-primary mt-6"
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Setups speichern</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Speichere ein Setup aus der Analyse in deinem Trade-Log.</p>
              </div>
              <button type="button" onClick={exportTradeLog} className="btn-primary">
                Export JSON
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {analysisResult?.setups.map((setup) => (
                <button
                  key={setup.id}
                  type="button"
                  onClick={() => saveTrade(setup.id)}
                  className="w-full rounded-3xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-4 py-4 text-left transition hover:border-[var(--accent-cyan)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Platz {setup.rank}</p>
                      <p className="mt-1 text-base font-semibold text-[var(--text-primary)]">{setup.asset} · {setup.direction}</p>
                    </div>
                    <span className="rank-badge-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">Speichern</span>
                  </div>
                </button>
              ))}
              {!analysisResult && <p className="text-sm text-[var(--text-muted)]">Keine Analyse verfügbar.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr]">
        <TradeLog tradeLog={tradeLog} onUpdateTrade={updateTrade} onExport={exportTradeLog} />
        <CapitalTracker capital={capital} tradeLog={tradeLog} />
      </div>
    </div>
  );
}
