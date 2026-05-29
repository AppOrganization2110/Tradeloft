'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AnalysisRunner from '@/components/AnalysisRunner';
import TradeLog from '@/components/TradeLog';
import CapitalTracker from '@/components/CapitalTracker';
import { loadFromStorage, saveToStorage } from '@/lib/localStorage';
import { AnalysisResult, MarketMode, QuoteResponse, TradeLogEntry } from '@/types/trade';

type Tab = 'analyse' | 'tradelog' | 'kapital';

const TABS: { id: Tab; label: string }[] = [
  { id: 'analyse',  label: 'Analyse-Dashboard' },
  { id: 'tradelog', label: 'Trade-Log'         },
  { id: 'kapital',  label: 'Kapital'           },
];

const THEME_KEY = 'tradeloft-theme';
const STATE_KEY = 'tradeloft-state';

const initialState = {
  capital: 10000,
  mode: 'Beides' as MarketMode,
  manualAsset: '',
  tradeLog: [] as TradeLogEntry[],
};

export default function TradeloftApp() {
  const [capital, setCapital] = useState(initialState.capital);
  const [mode, setMode] = useState<MarketMode>(initialState.mode);
  const [manualAsset, setManualAsset] = useState(initialState.manualAsset);
  const [darkMode, setDarkMode] = useState(true);
  const [quoteData, setQuoteData] = useState<QuoteResponse | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [tradeLog, setTradeLog] = useState<TradeLogEntry[]>(initialState.tradeLog);
  const [activeTab, setActiveTab] = useState<Tab>('analyse');

  // Persist & restore state
  useEffect(() => {
    const saved = loadFromStorage<typeof initialState>(STATE_KEY, initialState);
    setCapital(saved.capital);
    setMode(saved.mode);
    setManualAsset(saved.manualAsset);
    setTradeLog(saved.tradeLog);
    setDarkMode(loadFromStorage<boolean>(THEME_KEY, true));
  }, []);

  useEffect(() => {
    saveToStorage(STATE_KEY, { capital, mode, manualAsset, tradeLog });
  }, [capital, mode, manualAsset, tradeLog]);

  useEffect(() => {
    saveToStorage(THEME_KEY, darkMode);
    document.documentElement.classList.toggle('light-mode', !darkMode);
  }, [darkMode]);

  // Live quote polling
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/quotes');
        if (!res.ok) return;
        setQuoteData((await res.json()) as QuoteResponse);
      } catch { /* ignore */ }
    };
    load();
    const id = window.setInterval(load, 15000);
    return () => window.clearInterval(id);
  }, []);

  const todayLoss = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return tradeLog
      .filter((e) => e.timestamp.slice(0, 10) === today)
      .reduce((sum, e) => sum + (e.result ?? 0), 0);
  }, [tradeLog]);

  const stopTrading = todayLoss <= -(capital * 0.06);

  const runAnalysis = async () => {
    if (stopTrading || analysing) return;
    setAnalysing(true);
    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capital, mode, manualAsset, quoteData }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAnalysisResult((await res.json()) as AnalysisResult);
    } catch {
      // Fallback: static analysis already computed server-side; if fetch failed entirely, skip
    } finally {
      setAnalysing(false);
    }
  };

  const saveTrade = (setupId: string) => {
    if (!analysisResult) return;
    const setup = analysisResult.setups.find((s) => s.id === setupId);
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
    setTradeLog((cur) => [entry, ...cur]);
  };

  const updateTrade = (entry: TradeLogEntry) =>
    setTradeLog((cur) => cur.map((t) => (t.id === entry.id ? entry : t)));

  const deleteTrade = (id: string) =>
    setTradeLog((cur) => cur.filter((t) => t.id !== id));

  const exportTradeLog = () => {
    const blob = new Blob([JSON.stringify(tradeLog, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'trade-log.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <header className="sticky top-0 z-40 mb-8 rounded-b-3xl border border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-5 shadow-card" style={{ backdropFilter: 'blur(12px)' }}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-[var(--accent-cyan)]">Tradeloft</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Professionelles Intraday-Trading</h1>
            </div>

            {/* Tab navigation */}
            <nav className="flex flex-wrap items-center gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-[40px] rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-[var(--accent-cyan)] text-[var(--btn-text)]'
                      : 'btn-ghost'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <Link href="/regeln" className="btn-ghost min-h-[40px] rounded-full px-4 py-2 text-sm font-semibold">
                Regeln
              </Link>
              <button
                type="button"
                onClick={() => setDarkMode((d) => !d)}
                className="btn-ghost min-h-[40px] rounded-full px-3 py-2 text-sm"
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </nav>
          </div>

          {/* Handelsstopp-Banner */}
          {stopTrading && (
            <div className="mt-4 rounded-2xl bg-[var(--loss)] px-4 py-3 text-sm font-semibold text-white">
              ⛔ HANDELSSTOPP — Tagesverlust-Limit (6%) erreicht. Keine neuen Trades bis morgen.
            </div>
          )}
        </header>

        {/* ── Tab-Inhalte ── */}

        {activeTab === 'analyse' && (
          <AnalysisRunner
            capital={capital}
            mode={mode}
            manualAsset={manualAsset}
            onChangeMode={setMode}
            onChangeCapital={setCapital}
            onChangeManualAsset={setManualAsset}
            onRunAnalysis={runAnalysis}
            onSave={saveTrade}
            analysisResult={analysisResult}
            stopTrading={stopTrading}
            quoteData={quoteData}
            loading={analysing}
          />
        )}

        {activeTab === 'tradelog' && (
          <TradeLog
            tradeLog={tradeLog}
            onUpdateTrade={updateTrade}
            onDeleteTrade={deleteTrade}
            onExport={exportTradeLog}
          />
        )}

        {activeTab === 'kapital' && (
          <CapitalTracker capital={capital} tradeLog={tradeLog} />
        )}

      </div>
    </div>
  );
}
