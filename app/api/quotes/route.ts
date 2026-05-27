import { NextResponse } from 'next/server';

const cryptoIds = ['bitcoin', 'ethereum', 'solana'];
const finnhubSymbols = ['AAPL', 'NVDA', 'SAP.DE', 'SIE.DE', '^GDAXI', '^VIX'];
const symbolNames: Record<string, string> = {
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
  source: 'CoinGecko' | 'Finnhub';
  price: number | null;
  change24h?: number | null;
  lastUpdatedAt?: string | null;
};

async function fetchCryptoPrices() {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds.join(',')}&vs_currencies=eur&include_last_updated_at=true`;
  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();

  return cryptoIds.map((id) => {
    const record = data[id] ?? {};
    const symbol = id === 'bitcoin' ? 'BTC' : id === 'ethereum' ? 'ETH' : 'SOL';
    return {
      symbol,
      name: symbol,
      source: 'CoinGecko' as const,
      price: typeof record.eur === 'number' ? record.eur : null,
      change24h: typeof record.eur_24h_change === 'number' ? record.eur_24h_change : null,
      lastUpdatedAt:
        typeof record.last_updated_at === 'number'
          ? new Date(record.last_updated_at * 1000).toISOString()
          : null,
    };
  });
}

async function fetchStockQuotes() {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    throw new Error('Missing FINNHUB_API_KEY environment variable');
  }

  const results = await Promise.all(
    finnhubSymbols.map(async (symbol) => {
      const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(token)}`;
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      const price = typeof data.c === 'number' ? data.c : null;
      const previousClose = typeof data.pc === 'number' ? data.pc : null;
      const change24h = price !== null && previousClose !== null ? ((price - previousClose) / previousClose) * 100 : null;
      const lastUpdatedAt = typeof data.t === 'number' ? new Date(data.t * 1000).toISOString() : null;

      return {
        symbol,
        name: symbolNames[symbol] ?? symbol,
        source: 'Finnhub' as const,
        price,
        change24h,
        lastUpdatedAt,
      };
    })
  );

  return results;
}

export async function GET() {
  const [crypto, stock] = await Promise.all([fetchCryptoPrices(), fetchStockQuotes()]);
  const timestamp = new Date().toISOString();
  return NextResponse.json({ timestamp, crypto, stock });
}
