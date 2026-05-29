import { NextResponse } from 'next/server';
import { UNIVERSE, CRYPTO_UNIVERSE } from '@/lib/universe';

const CMC_SYMBOLS = CRYPTO_UNIVERSE;

// All tradeable stock universe + indices for red-flag check
const FINNHUB_SYMBOLS: { symbol: string; name: string; usd: boolean }[] = [
  ...UNIVERSE.filter(a => a.bucket !== 'krypto').map(a => ({
    symbol: a.symbol,
    name: a.name,
    usd: a.usd ?? false,
  })),
  { symbol: '^GDAXI', name: 'DAX', usd: false },
  { symbol: '^VIX',   name: 'VIX', usd: true  },
];

type Quote = {
  symbol: string;
  name: string;
  source: 'CoinMarketCap' | 'Finnhub';
  price: number | null;
  change24h?: number | null;
  lastUpdatedAt?: string | null;
  currency?: 'EUR' | 'USD';
};

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

// Fetch EUR/USD rate from Frankfurter (ECB reference rates, free, no key)
async function fetchEurUsdRate(_token: string): Promise<number> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?base=USD&to=EUR', { cache: 'no-store' });
    if (!res.ok) return 0.88;
    const data = await res.json() as { rates?: Record<string, number> };
    const rate = data.rates?.EUR;
    // rate = EUR per 1 USD, e.g. 0.86 → 1 USD = 0.86 EUR
    return typeof rate === 'number' && rate > 0 ? rate : 0.88;
  } catch {
    return 0.88; // ECB daily average fallback
  }
}

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
    const entry: CmcQuoteEntry | undefined = Array.isArray(raw) ? raw[0] : raw;

    if (!entry) {
      return { symbol, name: symbol, source: 'CoinMarketCap', price: null, change24h: null, lastUpdatedAt: null, currency: 'EUR' };
    }

    const eur = entry.quote?.EUR;
    const price = typeof eur?.price === 'number' ? eur.price : null;
    const change24h = typeof eur?.percent_change_24h === 'number' ? eur.percent_change_24h : null;
    const lastUpdatedAt = eur?.last_updated ? new Date(eur.last_updated).toISOString() : null;

    return { symbol, name: entry.name ?? symbol, source: 'CoinMarketCap', price, change24h, lastUpdatedAt, currency: 'EUR' };
  });
}

async function fetchStockQuotes(): Promise<Quote[]> {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) throw new Error('Missing FINNHUB_API_KEY environment variable');

  // Fetch EUR/USD rate alongside stock quotes
  const [eurUsdRate, ...stockResults] = await Promise.all([
    fetchEurUsdRate(token),
    ...FINNHUB_SYMBOLS.map(async ({ symbol, name, usd }): Promise<Quote> => {
      try {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(token)}`;
        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json() as { c?: number; pc?: number; t?: number };

        // Finnhub returns 0 for unsupported/no-data symbols — treat as null
        const rawPrice = typeof data.c === 'number' && data.c > 0 ? data.c : null;
        const rawPrev  = typeof data.pc === 'number' && data.pc > 0 ? data.pc : null;

        return {
          symbol,
          name,
          source: 'Finnhub',
          price: rawPrice,
          change24h:
            rawPrice !== null && rawPrev !== null
              ? ((rawPrice - rawPrev) / rawPrev) * 100
              : null,
          lastUpdatedAt:
            typeof data.t === 'number' && data.t > 0
              ? new Date(data.t * 1000).toISOString()
              : null,
          currency: usd ? 'USD' : 'EUR',
        };
      } catch {
        return { symbol, name, source: 'Finnhub', price: null, currency: usd ? 'USD' : 'EUR' };
      }
    }),
  ]);

  // Convert USD prices to EUR using live rate
  return (stockResults as Quote[]).map((quote, i) => {
    if (FINNHUB_SYMBOLS[i].usd && quote.price !== null) {
      return { ...quote, price: Number((quote.price * eurUsdRate).toFixed(2)), currency: 'EUR' };
    }
    return quote;
  });
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
