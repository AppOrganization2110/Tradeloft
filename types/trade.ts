export type MarketMode = 'Nur Krypto' | 'Nur Aktien' | 'Beides';
export type UniverseMode = 'Standard' | 'Erweitert' | 'Manuell';

export type PricePoint = {
  symbol: string;
  name: string;
  source: 'CoinMarketCap' | 'Finnhub';
  price: number | null;
  change24h?: number | null;
  lastUpdatedAt?: string | null;
};

export type QuoteResponse = {
  timestamp: string;
  crypto: PricePoint[];
  stock: PricePoint[];
};

export type SetupSignals = {
  trend: '✅' | '❌' | '⚠️';
  momentum: '✅' | '❌' | '⚠️';
  volume: '✅' | '❌' | '⚠️';
  macro: '✅' | '❌' | '⚠️';
  relative: '✅' | '❌' | '⚠️';
};

export type AnalysisSetup = {
  id: string;
  rank: number;
  asset: string;
  symbol: string;
  assetClass: 'crypto' | 'stock';
  direction: 'Long' | 'Short';
  signals: SetupSignals;
  positiveCount: number;
  entry: number;
  stop: number;
  target: number;
  stopDistancePercent: number;
  positionSize: number;
  maxLoss: number;
  crv: string;
  window: string;
  duration: string;
  explanation: string;
  invalidation: string;
  analysisNarrative: string;
  timestamp: string;
};

export type RedFlagStatus = {
  blocked: boolean;
  reason: string;
  warning?: string;
};

export type AnalysisResult = {
  marketContext: string;
  redFlag: RedFlagStatus;
  setups: AnalysisSetup[];
  note: string;
};

export type TradeLogEntry = {
  id: string;
  timestamp: string;
  asset: string;
  symbol: string;
  direction: 'Long' | 'Short';
  entry: number;
  stop: number;
  target: number;
  positionSize: number;
  maxLoss: number;
  signals: SetupSignals;
  analysisText: string;
  marketMode: MarketMode;
  capital: number;
  exitPrice?: number;
  result?: number;
  exitTimestamp?: string;
  note?: string;
};
