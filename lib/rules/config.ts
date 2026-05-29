// Single Source of Truth for all Tradeloft trading rules.
// Runner, RulesTab, and TimePanel read ONLY from here.

export type QualityLevel = 'sehr hoch' | 'hoch' | 'niedrig';
export type AssetBucket = 'eu' | 'us' | 'crypto';

export const RISK = {
  perTrade: 0.02,         // 2% — Risiko-Budget = capital × 0.02
  minCrv: 2.0,            // 1:2.0
  dailyLossLimit: 0.06,   // 6% → Handelsstopp
  maxOpenTrades: 1,
  // Position size: riskBudget ÷ stopDistancePct (capped at capital). No fee deduction.
  spread: {
    xetraCore: 0.05,      // % of price, max allowed during Xetra 09:00–17:30
    extended: 0.20,       // % of price, max allowed outside Xetra (L&S / Tradegate)
  },
  minRelativeVolume: 0.8, // min 80% of avg intraday volume
} as const;

export const SIGNALS = {
  required: 4,
  total: 5,
  families: ['Trend', 'Momentum', 'Volumen', 'Makro', 'Relative Stärke'] as const,
} as const;

export const RED_FLAG_LABELS: readonly string[] = [
  'FOMC / EZB-Entscheidung heute',
  'Earnings des Assets heute',
  'VIX > 30',
  'US-Feiertag (Nachmittag)',
];

export const TRADE_RULES: readonly string[] = [
  'Nur SPOT — kein Hebel, keine Overnight-Positionen',
  'Trades immer vor Tagesende schließen (max. einige Stunden)',
  'Max. 1 Setup pro Analyse-Lauf',
  'Kein Nachrennen bereits gelaufener Moves',
  'Kein Trading gegen den übergeordneten Trend',
  'Kein Trading bei dünnem Volumen',
  'Kein Setup vorhanden → "KEIN TRADE"',
  'Unklare Marktlage → "IN CASH BLEIBEN"',
];

export interface TimeWindow {
  id: string;
  name: string;
  startH: number;
  startM: number;
  endH: number;
  endM: number;
  priority: number;      // 1 = highest priority
  quality: QualityLevel;
  buckets: AssetBucket[];
  onlyStrong?: boolean;  // only high-quality setups (EU lunch)
  note?: string;
}

export const TIME_WINDOWS: readonly TimeWindow[] = [
  {
    id: 'overlap',
    name: 'US+EU-Overlap',
    startH: 15, startM: 30,
    endH: 17,   endM: 30,
    priority: 1, quality: 'sehr hoch',
    buckets: ['eu', 'us'],
  },
  {
    id: 'eu-morning',
    name: 'EU-Vormittag',
    startH: 9,  startM: 0,
    endH: 13,   endM: 0,
    priority: 2, quality: 'hoch',
    buckets: ['eu'],
  },
  {
    id: 'us-pm',
    name: 'US-Nachmittag',
    startH: 17, startM: 30,
    endH: 22,   endM: 0,
    priority: 3, quality: 'hoch',
    buckets: ['us'],
  },
  {
    id: 'eu-lunch',
    name: 'EU-Mittagsflaute',
    startH: 13, startM: 0,
    endH: 15,   endM: 30,
    priority: 4, quality: 'niedrig',
    buckets: ['eu'],
    onlyStrong: true,
  },
  {
    id: 'crypto',
    name: 'Krypto-only',
    startH: 22, startM: 0,
    endH: 9,    endM: 0,  // overnight wrap
    priority: 5, quality: 'niedrig',
    buckets: ['crypto'],
    note: 'Nur Rückfallebene — Cutoff 22:00, kein Overnight',
  },
] as const;

export const TIME_CONFIG = {
  minHoldMin: 60,         // minimum hold duration in minutes
  closeMarginMin: 20,     // buffer before window end: do not open new trades
  settlePufferMin: 15,    // wait after window open before first analysis
  cryptoCutoffH: 22,      // no new crypto trades after 22:00
} as const;

// Manually maintained public holiday lists (YYYY-MM-DD).
// Update when needed — roughly 10 per region per year.
export const EU_HOLIDAYS: readonly string[] = [
  '2025-12-25', '2025-12-26',
  '2026-01-01', '2026-04-03', '2026-04-06',
  '2026-05-01', '2026-12-25', '2026-12-26',
];

export const US_HOLIDAYS: readonly string[] = [
  '2025-11-27', '2025-12-25',
  '2026-01-01', '2026-01-19', '2026-02-16',
  '2026-04-03', '2026-05-25', '2026-07-03',
  '2026-09-07', '2026-11-26', '2026-12-25',
];
