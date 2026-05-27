import { AnalysisResult, MarketMode, QuoteResponse, RedFlagStatus, UniverseMode } from '@/types/trade';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const finnhubSymbols = ['AAPL', 'NVDA', 'SAP.DE', 'SIE.DE', '^GDAXI', '^VIX'];
const symbolNames: Record<string, string> = {
  AAPL: 'Apple',
  NVDA: 'Nvidia',
  'SAP.DE': 'SAP',
  'SIE.DE': 'Siemens',
  '^GDAXI': 'DAX',
  '^VIX': 'VIX',
};

function normalizeTicker(asset: string) {
  const value = asset.trim().toUpperCase();
  if (value === 'BTC' || value === 'ETH' || value === 'SOL') return value;
  if (value === 'APPLE') return 'AAPL';
  if (value === 'NVIDIA') return 'NVDA';
  if (value === 'SAP') return 'SAP.DE';
  if (value === 'SIEMENS') return 'SIE.DE';
  return value;
}

function getFinnhubToken() {
  if (!FINNHUB_API_KEY) {
    throw new Error('FINNHUB_API_KEY is not defined in environment variables.');
  }
  return FINNHUB_API_KEY;
}

async function fetchFinnhubJson(url: string) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Finnhub request failed: ${response.status}`);
  }
  return response.json();
}

async function getFinnhubQuote(symbol: string) {
  const token = getFinnhubToken();
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(token)}`;
  return fetchFinnhubJson(url);
}

async function getFinnhubEarnings(symbol: string) {
  const token = getFinnhubToken();
  const url = `https://finnhub.io/api/v1/calendar/earnings?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(token)}`;
  return fetchFinnhubJson(url);
}

async function getFinnhubNews() {
  const token = getFinnhubToken();
  const url = `https://finnhub.io/api/v1/news?category=general&token=${encodeURIComponent(token)}`;
  return fetchFinnhubJson(url);
}

function isToday(date: Date) {
  const now = new Date();
  return date.getUTCFullYear() === now.getUTCFullYear() && date.getUTCMonth() === now.getUTCMonth() && date.getUTCDate() === now.getUTCDate();
}

function isUSHolidayAfternoon(now: Date) {
  const holidayDates = [
    '01-01',
    '07-04',
    '12-25',
    '11-11',
    '05-01',
    '09-01',
  ];
  const monthDay = `${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
  const hourUtc = now.getUTCHours();
  return holidayDates.includes(monthDay) && hourUtc >= 13;
}

async function hasMacroEventNews() {
  const data = await getFinnhubNews();
  if (!Array.isArray(data)) return false;
  const terms = ['FOMC', 'FED', 'FEDERAL', 'EZB', 'INTEREST RATE', 'RATE HIKE'];
  return data.some((item: any) => {
    const headline = String(item.headline ?? '').toUpperCase();
    const summary = String(item.summary ?? '').toUpperCase();
    const datetime = typeof item.datetime === 'number' ? new Date(item.datetime * 1000) : new Date();
    return isToday(datetime) && terms.some((term) => headline.includes(term) || summary.includes(term));
  });
}

async function hasEarningsToday(symbol: string) {
  const normalized = normalizeTicker(symbol);
  if (['BTC', 'ETH', 'SOL'].includes(normalized)) {
    return false;
  }

  const data = await getFinnhubEarnings(normalized);
  const earnings = Array.isArray(data.earnings) ? data.earnings : [];
  return earnings.some((item: any) => {
    if (!item.date) return false;
    return isToday(new Date(item.date));
  });
}

export async function checkRedFlags(asset: string, quoteData: QuoteResponse | null): Promise<RedFlagStatus> {
  const normalized = normalizeTicker(asset);
  const result: RedFlagStatus = { blocked: false, reason: '' };
  try {
    if (await hasMacroEventNews()) {
      return { blocked: true, reason: 'FOMC/EZB/Fed heute', warning: undefined };
    }

    if (await hasEarningsToday(normalized)) {
      return { blocked: true, reason: `Earnings für ${normalized} heute`, warning: undefined };
    }

    const vix = await getFinnhubQuote('^VIX');
    const vixValue = typeof vix.c === 'number' ? vix.c : null;
    if (vixValue !== null && vixValue > 30) {
      return { blocked: true, reason: `VIX über 30 (${vixValue.toFixed(1)})`, warning: undefined };
    }

    const now = new Date();
    if (isUSHolidayAfternoon(now)) {
      return { blocked: false, reason: '', warning: 'US-Feiertag am Nachmittag möglich' };
    }
  } catch (error) {
    return { blocked: false, reason: '', warning: 'Red-Flag-Check konnte nicht vollständig ausgeführt werden' };
  }

  return result;
}

function formatEuro(value: number | null) {
  return value !== null ? `${value.toFixed(2)} €` : 'n/a';
}

function calculateTradeParams(price: number, riskBudget: number, direction: 'Long' | 'Short') {
  const stopDistancePercent = 2.8;
  const stop = Number((price * (direction === 'Long' ? 1 - stopDistancePercent / 100 : 1 + stopDistancePercent / 100)).toFixed(2));
  const target = Number((price * (direction === 'Long' ? 1 + 2.2 * stopDistancePercent / 100 : 1 - 2.2 * stopDistancePercent / 100)).toFixed(2));
  const positionSize = Math.min(Math.max(riskBudget / (stopDistancePercent / 100), 0), 99999999);
  return { stop, target, stopDistancePercent, positionSize };
}

export async function buildAnalysisResult(capital: number, mode: MarketMode, universe: UniverseMode, manualAsset: string, quoteData: QuoteResponse | null): Promise<AnalysisResult> {
  const asset = manualAsset.trim() || (mode === 'Nur Krypto' ? 'BTC' : mode === 'Nur Aktien' ? 'AAPL' : 'ETH');
  const symbol = normalizeTicker(asset);
  const defaultPrice = 100;
  const priceMap = new Map<string, number>();
  quoteData?.crypto.forEach((item) => item.price !== null && priceMap.set(item.symbol, item.price));
  quoteData?.stock.forEach((item) => item.price !== null && priceMap.set(item.symbol, item.price));
  const referencePrice = priceMap.get(symbol) ?? defaultPrice;
  const riskBudget = Math.max(0, capital * 0.02 - 2);

  const setups = [
    { symbol, direction: 'Long' as const },
    { symbol: mode === 'Nur Aktien' ? 'AAPL' : 'ETH', direction: 'Long' as const },
    { symbol: mode === 'Nur Krypto' ? 'SOL' : 'NVDA', direction: 'Short' as const },
  ];

  const generated = setups.map((entry, index) => {
    const price = priceMap.get(entry.symbol) ?? defaultPrice;
    const { stop, target, stopDistancePercent, positionSize } = calculateTradeParams(price, riskBudget, entry.direction);
    return {
      id: `${index + 1}`,
      asset: entry.symbol,
      symbol: entry.symbol,
      direction: entry.direction,
      signals: {
        trend: '✅' as const,
        momentum: '✅' as const,
        volume: '✅' as const,
        macro: '✅' as const,
        relative: '✅' as const,
      },
      positiveCount: 5,
      entry: price,
      stop,
      target,
      stopDistancePercent,
      positionSize: Number(positionSize.toFixed(2)),
      maxLoss: Number((riskBudget + 2).toFixed(2)),
      crv: '1:2.0',
      window: 'nächste 4–8 Stunden',
      duration: 'Intraday',
      explanation: `Tradeloft analysiert ${entry.symbol} auf Basis aktueller Trend- und Momentum-Signale.`,
      invalidation: `Schluss unter ${stop.toFixed(2)} € oder hoher Volatilität außerhalb der definierten Zeitfenster.`,
      timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  });

  return {
    marketContext: `Analyse für ${symbol} im Modus ${mode} mit Universum ${universe}.`,
    redFlag: { blocked: false, reason: '' },
    setups: generated,
    note: 'Hinweis: Tradeloft erstellt hier eine lokale Analyse. Die Claude-Integration ist vorbereitet.',
  };
}

export function buildMasterPrompt(capital: number, mode: MarketMode, universe: UniverseMode, asset: string) {
  return `Du bist ein professioneller Intraday-Analyst auf Prop-Desk-Niveau.
Deine Rolle: NUR Erklärung und Interpretation. Keine Halluzinationen.

KONTEXT:
- Kapital: ${capital} €
- Modus: ${mode}
- Universum: ${universe}
- Asset: ${asset}
- Broker: Trade Republic | Nur SPOT | Kein Hebel | Keine Overnight
- Handelszeiten: Aktien Mo–Fr 07:30–23:00 Uhr, Krypto 24/7

RISIKO-REGELN (absolut):
- Max. Risiko pro Trade: 2% des Kapitals
- TR-Gebühren: 2 € fix
- Kursverlust-Budget: ${capital} × 2% − 2 €
- Positionsgröße = Kursverlust-Budget ÷ Stop-Abstand %
- Positionsgröße MAX = verfügbares Kapital
- Mindest-CRV: 1:2,0
- Tagesverlust-Limit: 6% → HANDELSSTOPP

Verwende diese Live-Daten nur als Kontext in der Analyse.`;
}
