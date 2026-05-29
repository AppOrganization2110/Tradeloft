export type AssetBucket = 'krypto' | 'aktien-eu' | 'aktien-us';

export type UniverseAsset = {
  symbol: string;
  name: string;
  bucket: AssetBucket;
  tracked: boolean; // true = live price via existing API
  usd?: boolean;    // true = Finnhub returns USD, needs EUR conversion
};

export const UNIVERSE: UniverseAsset[] = [
  // Krypto (CoinMarketCap, EUR-native)
  { symbol: 'BTC',     name: 'Bitcoin',          bucket: 'krypto',    tracked: true },
  { symbol: 'ETH',     name: 'Ethereum',         bucket: 'krypto',    tracked: true },
  { symbol: 'SOL',     name: 'Solana',           bucket: 'krypto',    tracked: true },
  { symbol: 'BNB',     name: 'BNB',              bucket: 'krypto',    tracked: true },
  { symbol: 'XRP',     name: 'XRP',              bucket: 'krypto',    tracked: true },
  { symbol: 'ADA',     name: 'Cardano',          bucket: 'krypto',    tracked: true },
  { symbol: 'AVAX',    name: 'Avalanche',        bucket: 'krypto',    tracked: true },
  { symbol: 'DOT',     name: 'Polkadot',         bucket: 'krypto',    tracked: true },
  { symbol: 'MATIC',   name: 'Polygon',          bucket: 'krypto',    tracked: true },
  { symbol: 'LINK',    name: 'Chainlink',        bucket: 'krypto',    tracked: true },
  { symbol: 'UNI',     name: 'Uniswap',          bucket: 'krypto',    tracked: true },
  { symbol: 'AAVE',    name: 'Aave',             bucket: 'krypto',    tracked: true },
  { symbol: 'ATOM',    name: 'Cosmos',           bucket: 'krypto',    tracked: true },
  { symbol: 'LTC',     name: 'Litecoin',         bucket: 'krypto',    tracked: true },
  { symbol: 'NEAR',    name: 'NEAR Protocol',    bucket: 'krypto',    tracked: true },

  // Aktien EU (Finnhub, EUR-native für .DE / .PA)
  { symbol: 'SAP.DE',  name: 'SAP',              bucket: 'aktien-eu', tracked: true, usd: false },
  { symbol: 'SIE.DE',  name: 'Siemens',          bucket: 'aktien-eu', tracked: true, usd: false },
  { symbol: 'ALV.DE',  name: 'Allianz',          bucket: 'aktien-eu', tracked: true, usd: false },
  { symbol: 'BMW.DE',  name: 'BMW',              bucket: 'aktien-eu', tracked: true, usd: false },
  { symbol: 'MBG.DE',  name: 'Mercedes-Benz',   bucket: 'aktien-eu', tracked: true, usd: false },
  { symbol: 'BAS.DE',  name: 'BASF',             bucket: 'aktien-eu', tracked: true, usd: false },
  { symbol: 'DTE.DE',  name: 'Deutsche Telekom', bucket: 'aktien-eu', tracked: true, usd: false },
  { symbol: 'DBK.DE',  name: 'Deutsche Bank',    bucket: 'aktien-eu', tracked: true, usd: false },
  { symbol: 'VOW3.DE', name: 'Volkswagen',       bucket: 'aktien-eu', tracked: true, usd: false },
  { symbol: 'ASML',    name: 'ASML',             bucket: 'aktien-eu', tracked: true, usd: true  },
  { symbol: 'NVO',     name: 'Novo Nordisk',     bucket: 'aktien-eu', tracked: true, usd: true  },
  { symbol: 'TTE.PA',  name: 'TotalEnergies',    bucket: 'aktien-eu', tracked: true, usd: false },
  { symbol: 'MC.PA',   name: 'LVMH',             bucket: 'aktien-eu', tracked: true, usd: false },

  // Aktien US (Finnhub, USD→EUR)
  { symbol: 'AAPL',    name: 'Apple',            bucket: 'aktien-us', tracked: true, usd: true },
  { symbol: 'NVDA',    name: 'Nvidia',           bucket: 'aktien-us', tracked: true, usd: true },
  { symbol: 'AMZN',    name: 'Amazon',           bucket: 'aktien-us', tracked: true, usd: true },
  { symbol: 'MSFT',    name: 'Microsoft',        bucket: 'aktien-us', tracked: true, usd: true },
  { symbol: 'GOOGL',   name: 'Alphabet',         bucket: 'aktien-us', tracked: true, usd: true },
  { symbol: 'META',    name: 'Meta',             bucket: 'aktien-us', tracked: true, usd: true },
  { symbol: 'TSLA',    name: 'Tesla',            bucket: 'aktien-us', tracked: true, usd: true },
  { symbol: 'AMD',     name: 'AMD',              bucket: 'aktien-us', tracked: true, usd: true },
];

export const CRYPTO_UNIVERSE = UNIVERSE.filter(a => a.bucket === 'krypto').map(a => a.symbol);
export const STOCK_UNIVERSE  = UNIVERSE.filter(a => a.bucket !== 'krypto').map(a => a.symbol);
export const ASSET_LABELS    = Object.fromEntries(UNIVERSE.map(a => [a.symbol, a.name]));
