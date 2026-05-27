'use client';

import { useEffect, useMemo, useState } from 'react';
import LiveQuotes from '@/components/LiveQuotes';
import AnalysisRunner from '@/components/AnalysisRunner';
import TradeLog from '@/components/TradeLog';
import CapitalTracker from '@/components/CapitalTracker';
import { loadFromStorage, saveToStorage } from '@/lib/localStorage';
import { AnalysisResult, MarketMode, QuoteResponse, TradeLogEntry, UniverseMode } from '@/types/trade';

const THEME_KEY = 'tradeloft-dark-mode';
const STATE_KEY = 'tradeloft-dashboard-state';

function buildAnalysisResult(capital: number, mode: MarketMode, universe: UniverseMode, manualAsset: string, quoteData: QuoteResponse | null): AnalysisResult {
  const asset = manualAsset.trim() || (mode === 'Nur Krypto' ? 'BTC' : mode === 'Nur Aktien' ? 'AAPL' : 'ETH');
  const symbol = asset.toUpperCase();
  const basisPrice = quoteData?.crypto.find((item) => item.symbol === symbol)?.price ?? quoteData?.stock.find((item) => item.symbol === symbol)?.price ?? 100;
  const stopDistance = 2.8;
  const riskBudget = Math.max(0, capital * 0.02 - 2);
  const positionSize = Math.min(capital, Math.max(0, Math.round((riskBudget / (stopDistance / 100)) * 100) / 100));

  const generateSetup = (id: number, assetSymbol: string, direction: 'Long' | 'Short') => {
    const entry = basisPrice;
    const stop = Number((entry * (direction === 'Long' ? 1 - stopDistance / 100 : 1 + stopDistance / 100)).toFixed(2));
    const target = Number((entry * (direction === 'Long' ? 1 + 2.2 * stopDistance / 100 : 1 - 2.2 * stopDistance / 100)).toFixed(2));
    return {
      id: `${id}`,
      asset: assetSymbol,
      symbol: assetSymbol,
      direction,
      signals: {
        trend: '✅' as const,
        momentum: '✅' as const,
        volume: '✅' as const,
        macro: '✅' as const,
        relative: '✅' as const,
      },
      positiveCount: 5,
      entry,
      stop,
      target,
      stopDistancePercent: stopDistance,
      positionSize,
      maxLoss: Number((riskBudget + 2).toFixed(2)),
      crv: '1:2.0',
      window: 'nächste 4–8 Stunden',
      duration: 'Intraday',
      explanation: `Die Analyse basiert auf Trend, Momentum, Volumen, Makro und relativer Stärke für ${assetSymbol}.`, 
      invalidation: `Schluss unter ${stop.toFixed(2)} € oder Trendbruch im 15-min-Chart.`, 
      timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  };

  return {
    marketContext: `Marktlage basierend auf ${mode} und ${universe}. Live-Daten werden von CoinGecko und Finnhub eingespeist.`,
    redFlag: {
      blocked: false,
      reason: '',
      warning: spotUSHolidayWarning(new Date()) ? 'US-Nachmittagsfeiertag möglich, nur mit Vorsicht handeln.' : '',
    },
    setups: [
      generateSetup(1, symbol, 'Long'),
      generateSetup(2, mode === 'Nur Aktien' ? 'AAPL' : 'ETH', 'Long'),
      generateSetup(3, mode === 'Nur Krypto' ? 'SOL' : 'NVDA', 'Short'),
    ],
    note: 'Kein echtes API-Backend. Tradeloft nutzt Finnhub und CoinGecko live und ist lokal gespeichert für Phase-2 Backtesting.',
  };
}

function spotUSHolidayWarning(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return (month === 12 && day === 25) || (month === 1 && day === 1);
}

function createTradeEntry(setup: any, capital: number, mode: MarketMode): TradeLogEntry {
  return {
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
}

export default function TradeloftApp() {
  const [capital, setCapital] = useState(10000);
  const [mode, setMode] = useState<MarketMode>('Beides');
  const [universe, setUniverse] = useState<UniverseMode>('Standard');
  const [manualAsset, setManualAsset] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [quoteData, setQuoteData] = useState<QuoteResponse | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [tradeLog, setTradeLog] = useState<TradeLogEntry[]>([]);

  useEffect(() => {
    const savedState = loadFromStorage<{ capital: number; mode: MarketMode; universe: UniverseMode; manualAsset: string; tradeLog: TradeLogEntry[] }>(STATE_KEY, {
      capital: 10000,
      mode: 'Beides',
      universe: 'Standard',
      manualAsset: '',
      tradeLog: [],
    });
    setCapital(savedState.capital);
    setMode(savedState.mode);
    setUniverse(savedState.universe);
    setManualAsset(savedState.manualAsset);
    setTradeLog(savedState.tradeLog);
    const storedTheme = loadFromStorage<boolean>(THEME_KEY, true);
    setDarkMode(storedTheme);
  }, []);

  useEffect(() => {
    saveToStorage(STATE_KEY, { capital, mode, universe, manualAsset, tradeLog });
  }, [capital, mode, universe, manualAsset, tradeLog]);

  useEffect(() => {
    saveToStorage(THEME_KEY, darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
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
    const interval = window.setInterval(loadQuotes, 18000);
    return () => window.clearInterval(interval);
  }, []);

  const todayLoss = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return tradeLog
      .filter((entry) => entry.timestamp.slice(0, 10) === today)
      .reduce((sum, entry) => sum + (entry.result ?? 0), 0);
  }, [tradeLog]);

  const dayLimit = useMemo(() => -(capital * 0.06), [capital]);
  const stopTrading = todayLoss <= dayLimit;

  const marketStatus = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
    const stocksOpen = isWeekday && hour >= 7 && hour < 23;
    return stocksOpen ? 'TR Aktien geöffnet' : 'TR Aktien geschlossen';
  }, []);

  const analysisMessage = () => {
    if (stopTrading) {
      return 'HANDELSSTOPP FÜR HEUTE: Tagesverlust-Limit erreicht.';
    }
    return `Handelsstatus: ${marketStatus}. Tagesverlust: ${todayLoss.toFixed(2)} € / ${Math.abs(dayLimit).toFixed(2)} €`;
  };

  const runAnalysis = () => {
    setAnalysisResult(buildAnalysisResult(capital, mode, universe, manualAsset, quoteData));
  };

  const saveTrade = (setupId: string) => {
    if (!analysisResult) return;
    const setup = analysisResult.setups.find((item) => item.id === setupId);
    if (!setup) return;
    setTradeLog((current) => [createTradeEntry(setup, capital, mode), ...current]);
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
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <LiveQuotes quoteData={quoteData} />

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-6 shadow-card">
            <h2 className="text-xl font-semibold text-white">Dashboard-Übersicht</h2>
            <div className="mt-5 space-y-3 text-sm text-text-secondary">
              <p>Kapital: {capital.toFixed(2)} €</p>
              <p>Tagesverlust-Limit: {Math.abs(dayLimit).toFixed(2)} €</p>
              <p>{analysisMessage()}</p>
              <p>Marktstatus: {marketStatus}</p>
            </div>
            <button
              type="button"
              onClick={() => setDarkMode((current) => !current)}
              className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-3xl bg-accent-cyan px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
            >
              {darkMode ? 'Wechsel zu Light Mode' : 'Wechsel zu Dark Mode'}
            </button>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-6 shadow-card">
            <h2 className="text-xl font-semibold text-white">Setups speichern</h2>
            <p className="mt-3 text-sm text-text-secondary">Klicke auf einen Setup-Block, um ihn in den Trade-Log zu übernehmen.</p>
            <div className="mt-4 grid gap-3">
              {analysisResult?.setups.map((setup) => (
                <button
                  key={setup.id}
                  type="button"
                  onClick={() => saveTrade(setup.id)}
                  className="w-full rounded-3xl border border-slate-700 bg-bg-tertiary px-4 py-4 text-left text-slate-200 transition hover:border-accent-cyan"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">SETUP #{setup.id}</p>
                      <p className="mt-1 text-lg font-semibold text-white">{setup.asset} | {setup.direction}</p>
                    </div>
                    <span className="rounded-full bg-accent-cyan px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950">Speichern</span>
                  </div>
                </button>
              ))}
              {!analysisResult && <p className="text-sm text-slate-500">Keine Analyse verfügbar.</p>}
            </div>
          </div>
        </div>
      </div>

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

      <TradeLog tradeLog={tradeLog} onUpdateTrade={updateTrade} onExport={exportTradeLog} />

      <CapitalTracker tradeLog={tradeLog} />
    </div>
  );
}
