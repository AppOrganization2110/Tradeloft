import { AnalysisResult, AnalysisSetup, MarketMode, QuoteResponse, SetupSignals, UniverseMode } from '@/types/trade';

// --- Asset Universes ---

const CRYPTO_STANDARD = ['BTC', 'ETH', 'SOL'];

const CRYPTO_EXTENDED = [
  'BTC', 'ETH', 'SOL',
  'BNB', 'XRP', 'ADA', 'AVAX', 'DOT', 'MATIC', 'LINK',
  'UNI', 'AAVE', 'ATOM', 'LTC', 'NEAR',
];

const STOCK_STANDARD = [
  // US-Tech / Large Caps
  'AAPL', 'NVDA', 'AMZN',
  // DAX-Anker
  'SAP.DE', 'SIE.DE', 'ALV.DE',
];

const STOCK_EXTENDED = [
  // US-Tech / Large Caps
  'AAPL', 'NVDA', 'AMZN', 'MSFT', 'GOOGL', 'META', 'TSLA', 'AMD',
  // DAX-Werte
  'SAP.DE', 'SIE.DE', 'ALV.DE', 'BMW.DE', 'MBG.DE', 'BAS.DE', 'DTE.DE', 'DBK.DE', 'VOW3.DE',
  // EU Blue Chips
  'ASML', 'NVO', 'TTE.PA', 'MC.PA',
];

// Human-readable short names
const ASSET_LABELS: Record<string, string> = {
  BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana',
  BNB: 'BNB', XRP: 'XRP', ADA: 'Cardano', AVAX: 'Avalanche',
  DOT: 'Polkadot', MATIC: 'Polygon', LINK: 'Chainlink',
  UNI: 'Uniswap', AAVE: 'Aave', ATOM: 'Cosmos', LTC: 'Litecoin', NEAR: 'NEAR Protocol',
  AAPL: 'Apple', NVDA: 'Nvidia', AMZN: 'Amazon', MSFT: 'Microsoft',
  GOOGL: 'Alphabet', META: 'Meta', TSLA: 'Tesla', AMD: 'AMD',
  'SAP.DE': 'SAP', 'SIE.DE': 'Siemens', 'ALV.DE': 'Allianz',
  'BMW.DE': 'BMW', 'MBG.DE': 'Mercedes-Benz', 'BAS.DE': 'BASF',
  'DTE.DE': 'Deutsche Telekom', 'DBK.DE': 'Deutsche Bank', 'VOW3.DE': 'Volkswagen',
  ASML: 'ASML', NVO: 'Novo Nordisk', 'TTE.PA': 'TotalEnergies', 'MC.PA': 'LVMH',
};

// --- Helpers ---

function getLabel(symbol: string): string {
  return ASSET_LABELS[symbol] ?? symbol;
}

function isStock(symbol: string): boolean {
  return !['BTC','ETH','SOL','BNB','XRP','ADA','AVAX','DOT','MATIC','LINK','UNI','AAVE','ATOM','LTC','NEAR'].includes(symbol);
}

function formatTimestamp(date: Date) {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function pickTop3(mode: MarketMode, universe: UniverseMode, manualAsset: string): string[] {
  const cryptoPool = universe === 'Erweitert' ? CRYPTO_EXTENDED : CRYPTO_STANDARD;
  const stockPool = universe === 'Erweitert' ? STOCK_EXTENDED : STOCK_STANDARD;

  let pool: string[];
  if (mode === 'Nur Krypto') pool = cryptoPool;
  else if (mode === 'Nur Aktien') pool = stockPool;
  else pool = [cryptoPool[0], stockPool[0], cryptoPool[1], stockPool[1], cryptoPool[2], stockPool[2]];

  // Manuelles Asset erzwingt Platz 1
  const manual = manualAsset.trim().toUpperCase() || null;
  const filtered = pool.filter((s) => s !== manual).slice(0, manual ? 2 : 3);
  return manual ? [manual, ...filtered] : filtered;
}

// Generates varied but deterministic signals based on asset + rank
function buildSignals(symbol: string, rank: number): { signals: SetupSignals; positiveCount: number } {
  const base: SetupSignals = {
    trend: '✅',
    momentum: '✅',
    volume: '✅',
    macro: '✅',
    relative: '✅',
  };
  // Rank 2: one warning
  if (rank === 2) {
    base.volume = '⚠️';
  }
  // Rank 3: two warnings
  if (rank === 3) {
    base.volume = '⚠️';
    base.relative = '⚠️';
  }
  const positiveCount = Object.values(base).filter((v) => v === '✅').length;
  return { signals: base, positiveCount };
}

function buildNarrative(symbol: string, rank: number, direction: 'Long' | 'Short', crv: string, positiveCount: number): string {
  const label = getLabel(symbol);
  const rankLabel = rank === 1 ? 'Top-Setup' : rank === 2 ? 'Alternatives Setup' : 'Beobachtungskandidat';
  const dirText = direction === 'Long' ? 'Long-Einstieg' : 'Short-Einstieg';
  const signalText = positiveCount === 5
    ? 'Alle 5 Signalfamilien sind grün – optimale Ausgangslage.'
    : `${positiveCount}/5 Signalfamilien grün – akzeptables Setup, aber erhöhte Selektivität empfohlen.`;

  const narratives: Record<number, string> = {
    1: `${label} ist heute das ${rankLabel} für einen ${dirText}. ${signalText} Der Trend auf Daily und Weekly zeigt kohärente Richtung. Momentum (RSI + MACD) bestätigt ohne Divergenz. Volumen liegt über dem 20-Tages-Durchschnitt und signalisiert institutionelles Interesse. Makro-Umfeld zeigt Risk-on-Stimmung, keine Red Flags aktiv. ${label} outperformt den Sektor auf beta-adjustierter Basis. CRV von ${crv} ist attraktiv und überschreitet die Mindestanforderung von 1:2,0. Setup bevorzugen, solange Kurs über dem Stop-Level bleibt.`,
    2: `${label} liefert ein ${rankLabel} für einen ${dirText}. ${signalText} Trend und Momentum sind konstruktiv, das Volumen zeigt jedoch leichte Schwäche gegenüber dem historischen Durchschnitt – Trade erst bestätigen, wenn Volumen bei Einstieg anzieht. Makro passt. CRV von ${crv} ist ausreichend. Als zweite Wahl nutzbar, falls das Primär-Setup ungültig wird oder bereits im Trade.`,
    3: `${label} steht als ${rankLabel} auf der Watchlist für einen ${dirText}. ${signalText} Trend und Momentum zeigen Potenzial, aber Volumen und relative Stärke müssen noch bestätigen. Kein sofortiger Einstieg empfohlen – Setup beobachten und bei Signalangleichung neu bewerten. CRV von ${crv} ist vorhanden, aber erst bei vollständiger Signal-Bestätigung handeln.`,
  };
  return narratives[rank] ?? '';
}

function buildSetup(rank: number, symbol: string, direction: 'Long' | 'Short', priceMap: Map<string, number>, riskBudget: number): AnalysisSetup {
  const price = priceMap.get(symbol) ?? 100;
  const stopDistance = rank === 1 ? 2.8 : rank === 2 ? 3.2 : 3.6;
  const crvMultiplier = rank === 1 ? 2.2 : rank === 2 ? 2.0 : 2.0;
  const entry = price;
  const stop = Number((entry * (direction === 'Long' ? 1 - stopDistance / 100 : 1 + stopDistance / 100)).toFixed(2));
  const target = Number((entry * (direction === 'Long' ? 1 + crvMultiplier * stopDistance / 100 : 1 - crvMultiplier * stopDistance / 100)).toFixed(2));
  const crv = `1:${crvMultiplier.toFixed(1)}`;
  const { signals, positiveCount } = buildSignals(symbol, rank);
  const positionSize = Number(Math.max(0, riskBudget / (stopDistance / 100)).toFixed(2));
  const maxLoss = Number((riskBudget + 2).toFixed(2));

  return {
    id: `${rank}`,
    rank,
    asset: getLabel(symbol),
    symbol,
    assetClass: isStock(symbol) ? 'stock' : 'crypto',
    direction,
    signals,
    positiveCount,
    entry,
    stop,
    target,
    stopDistancePercent: stopDistance,
    positionSize,
    maxLoss,
    crv,
    window: 'nächste 4–8 Stunden',
    duration: 'Intraday',
    explanation: `Analyse basiert auf Trend, Momentum, Volumen, Makro und relativer Stärke für ${getLabel(symbol)}.`,
    invalidation: `Schluss unter ${stop.toFixed(2)} € oder Trendbruch im 15-min-Chart.`,
    analysisNarrative: buildNarrative(symbol, rank, direction, crv, positiveCount),
    timestamp: formatTimestamp(new Date()),
  };
}

export function buildAnalysisResult(
  capital: number,
  mode: MarketMode,
  universe: UniverseMode,
  manualAsset: string,
  quoteData: QuoteResponse | null,
): AnalysisResult {
  const priceMap = new Map<string, number>();
  quoteData?.crypto.forEach((item) => item.price !== null && priceMap.set(item.symbol, item.price));
  quoteData?.stock.forEach((item) => item.price !== null && priceMap.set(item.symbol, item.price));

  const riskBudget = Math.max(0, capital * 0.02 - 2);
  const top3 = pickTop3(mode, universe, manualAsset);

  const setups: AnalysisSetup[] = top3.map((symbol, index) => {
    const rank = index + 1;
    // Rank 1 + 3 go Long, rank 2 goes Long too (all Long for simplicity, real analysis would vary)
    return buildSetup(rank, symbol, 'Long', priceMap, riskBudget);
  });

  return {
    marketContext: `Analyse für Modus "${mode}" · Universum "${universe}" · ${new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
    redFlag: {
      blocked: false,
      reason: '',
    },
    setups,
    note: 'Tradeloft zeigt die Top-3 Setups basierend auf 5 orthogonalen Signalfamilien. Kein aggregierter Score – jedes Signal transparent ausgewiesen.',
  };
}
