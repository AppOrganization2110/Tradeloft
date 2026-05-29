import { NextResponse } from 'next/server';

// Full crypto universe for analysis + live quotes
const CMC_SYMBOLS = [
  'BTC', 'ETH', 'SOL',
  'BNB', 'XRP', 'ADA', 'AVAX', 'DOT', 'MATIC', 'LINK',
  'UNI', 'AAVE', 'ATOM', 'LTC', 'NEAR',
];

const FINNHUB_SYMBOLS = ['AAPL', 'NVDA', 'SAP.DE', 'SIE.DE', '^GDAXI', '^VIX'];
const FINNHUB_NAMES: Record<string, string> = {
  AAPL: 'Apple',
  NVDA: 'Nvidia',
  'SAP.DE': 'SAP',
  'SIE.DE': 'Siemens',
  '^GDAXI': 'DAX',
  '^VIX': 'VIX',
};

type Quote = {
  symbol: string;
  name: string;
  source: 'CoinMarketCap' | 'Finnhub';
  price: number | null;
  change24h?: number | null;
  lastUpdatedAt?: string | null;
};

// CoinMarketCap response types
type CmcQuoteEntry = {
  name?: string;
  quote?: {
    EUR?: {
      price?: number;
      percent_change_24h?: number;
      last_updated?: string;
    };
  };
};

async function fetchCryptoPrices(): Promise<Quote[]> {
  const apiKey = process.env.CMC_API_KEY;
  if (!apiKey) throw new Error('Missing CMC_API_KEY environment variable');

  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${CMC_SYMBOLS.join(',')}&convert=EUR`;
  const res = await fetch(url, {
    headers: { 'X-CMC_PRO_API_KEY': apiKey, Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`CMC HTTP ${res.status}`);

  const data = await res.json() as {
    status: { error_code: number; error_message?: string };
    data: Record<string, CmcQuoteEntry | CmcQuoteEntry[]>;
  };

  if (data.status?.error_code !== 0) {
    throw new Error(`CMC API error: ${data.status?.error_message ?? 'unknown'}`);
  }

  return CMC_SYMBOLS.map((symbol): Quote => {
    const raw = data.data[symbol];
    // CMC returns array when multiple coins share a symbol, otherwise object
    const entry: CmcQuoteEntry | undefined = Array.isArray(raw) ? raw[0] : raw;

    if (!entry) {
      return { symbol, name: symbol, source: 'CoinMarketCap', price: null, change24h: null, lastUpdatedAt: null };
    }

    const eur = entry.quote?.EUR;
    const price = typeof eur?.price === 'number' ? eur.price : null;
    const change24h = typeof eur?.percent_change_24h === 'number' ? eur.percent_change_24h : null;
    const lastUpdatedAt = eur?.last_updated ? new Date(eur.last_updated).toISOString() : null;

    return { symbol, name: entry.name ?? symbol, source: 'CoinMarketCap', price, change24h, lastUpdatedAt };
  });
}

async function fetchStockQuotes(): Promise<Quote[]> {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) throw new Error('Missing FINNHUB_API_KEY environment variable');

  const results = await Promise.all(
    FINNHUB_SYMBOLS.map(async (symbol): Promise<Quote> => {
      const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(token)}`;
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json() as { c?: number; pc?: number; t?: number };
      const price = typeof data.c === 'number' ? data.c : null;
      const previousClose = typeof data.pc === 'number' ? data.pc : null;
      const change24h = price !== null && previousClose !== null && previousClose !== 0
        ? ((price - previousClose) / previousClose) * 100
        : null;
      const lastUpdatedAt = typeof data.t === 'number' ? new Date(data.t * 1000).toISOString() : null;

      return { symbol, name: FINNHUB_NAMES[symbol] ?? symbol, source: 'Finnhub', price, change24h, lastUpdatedAt };
    })
  );

  return results;
}

export async function GET() {
  try {
    const [crypto, stock] = await Promise.all([fetchCryptoPrices(), fetchStockQuotes()]);
    return NextResponse.json({ timestamp: new Date().toISOString(), crypto, stock });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
