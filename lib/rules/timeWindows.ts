import {
  TIME_WINDOWS,
  TIME_CONFIG,
  RISK,
  AssetBucket,
  TimeWindow,
  EU_HOLIDAYS,
  US_HOLIDAYS,
} from './config';

export interface WindowState {
  activeWindow: TimeWindow | null;
  activeBuckets: AssetBucket[];
  nextWindow: TimeWindow;
  msToNextWindow: number;
  msRemainingInCurrent: number;
  canTrade: boolean;
  trafficLight: 'green' | 'yellow' | 'red';
  trafficReason: string;
  spreadThreshold: number;
  bestAnalysisTime: string; // HH:MM local
  latestEntry: string;      // HH:MM local
  latestClose: string;      // HH:MM local
}

function toLocalMins(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

// Returns NYSE open/close as local minutes using Intl offset trick (DST-aware).
function nyseToLocalMins(now: Date, nyseH: number, nyseM: number): number {
  const etFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = etFormatter.formatToParts(now);
  const etH = parseInt(parts.find(p => p.type === 'hour')!.value, 10);
  const etM = parseInt(parts.find(p => p.type === 'minute')!.value, 10);
  const etMins = etH * 60 + etM;
  const localMins = toLocalMins(now);
  const offset = localMins - etMins; // local − ET (handles date boundary)
  return nyseH * 60 + nyseM + offset;
}

function dateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isHoliday(date: Date, list: readonly string[]): boolean {
  return list.includes(dateStr(date));
}

// Returns true if localMins falls within the window.
// Handles overnight wrap (crypto: 22:00 – 09:00).
function windowContains(w: TimeWindow, localMins: number): boolean {
  const start = w.startH * 60 + w.startM;
  const end = w.endH * 60 + w.endM;
  if (start < end) {
    return localMins >= start && localMins < end;
  }
  // overnight wrap
  return localMins >= start || localMins < end;
}

// Minutes until window start from localMins (always positive, ≤ 1440).
function minsUntilStart(w: TimeWindow, localMins: number): number {
  const start = w.startH * 60 + w.startM;
  const diff = start - localMins;
  return diff > 0 ? diff : diff + 1440;
}

// Minutes remaining in window from localMins.
function minsRemainingInWindow(w: TimeWindow, localMins: number): number {
  const end = w.endH * 60 + w.endM;
  const start = w.startH * 60 + w.startM;
  if (start < end) {
    return end - localMins;
  }
  // overnight wrap
  if (localMins >= start) {
    return 1440 - localMins + end;
  }
  return end - localMins;
}

function fmtHHMM(totalMins: number): string {
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getWindowState(now: Date): WindowState {
  const localMins = toLocalMins(now);
  const dow = now.getDay(); // 0=Sun, 6=Sat
  const isWeekend = dow === 0 || dow === 6;

  const euHoliday = isHoliday(now, EU_HOLIDAYS);
  const usHoliday = isHoliday(now, US_HOLIDAYS);

  // Find active window by time (highest priority order)
  let active: TimeWindow | null = TIME_WINDOWS.find(w => windowContains(w, localMins)) ?? null;

  // Determine tradeable buckets, filtered by holiday/weekend
  let activeBuckets: AssetBucket[] = active
    ? active.buckets.filter(b => {
        if (b === 'eu' && (isWeekend || euHoliday)) return false;
        if (b === 'us' && (isWeekend || usHoliday)) return false;
        return true;
      })
    : [];

  // Crypto fallback: if no applicable bucket but before cutoff, crypto is always tradeable
  const cryptoWindow = TIME_WINDOWS.find(w => w.id === 'crypto')!;
  if (activeBuckets.length === 0 && localMins < TIME_CONFIG.cryptoCutoffH * 60) {
    active = cryptoWindow;
    activeBuckets = ['crypto'];
  }

  // Next window: earliest to start from now (excluding current)
  const nonActive = TIME_WINDOWS.filter(w => w !== active);
  const nextWindow = nonActive.reduce((best, w) => {
    return minsUntilStart(w, localMins) < minsUntilStart(best, localMins) ? w : best;
  });

  const msToNextWindow = minsUntilStart(nextWindow, localMins) * 60 * 1000;
  const msRemainingInCurrent = active
    ? minsRemainingInWindow(active, localMins) * 60 * 1000
    : 0;

  // Spread threshold: Xetra core hours 09:00–17:30 → tighter
  const inXetraCore = localMins >= 9 * 60 && localMins < 17 * 60 + 30;
  const spreadThreshold = inXetraCore ? RISK.spread.xetraCore : RISK.spread.extended;

  // Traffic light
  let trafficLight: 'green' | 'yellow' | 'red';
  let trafficReason: string;

  if (!active || activeBuckets.length === 0) {
    if (isWeekend) {
      trafficLight = 'red';
      trafficReason = 'Wochenende – kein Handel';
    } else {
      trafficLight = 'red';
      trafficReason = 'Außerhalb aller Handelsfenster';
    }
  } else if (active.quality === 'niedrig' || active.onlyStrong) {
    trafficLight = 'yellow';
    trafficReason = active.onlyStrong
      ? `${active.name} – nur starke Setups handeln`
      : `${active.name} – niedrige Qualität`;
  } else {
    trafficLight = 'green';
    trafficReason = `${active.name} (${active.quality})`;
  }

  // Holiday override
  if (euHoliday && usHoliday) {
    trafficLight = 'red';
    trafficReason = 'Feiertag EU + US – kein Handel';
  } else if (euHoliday && active?.buckets.every(b => b === 'eu')) {
    trafficLight = 'red';
    trafficReason = 'EU-Feiertag';
  } else if (usHoliday && active?.buckets.every(b => b === 'us')) {
    trafficLight = 'red';
    trafficReason = 'US-Feiertag';
  }

  const canTrade = trafficLight !== 'red' && activeBuckets.length > 0;

  // Best analysis time: settlePufferMin after window start
  const bestAnalysisMins = active
    ? (active.startH * 60 + active.startM + TIME_CONFIG.settlePufferMin)
    : (nextWindow.startH * 60 + nextWindow.startM + TIME_CONFIG.settlePufferMin);

  // Latest entry: closeMarginMin before window end
  const latestEntryMins = active
    ? (active.endH * 60 + active.endM - TIME_CONFIG.closeMarginMin)
    : (nextWindow.endH * 60 + nextWindow.endM - TIME_CONFIG.closeMarginMin);

  // Latest close: minHoldMin after latestEntry (or window end)
  const latestCloseMins = active
    ? (active.endH * 60 + active.endM)
    : (nextWindow.endH * 60 + nextWindow.endM);

  return {
    activeWindow: active,
    activeBuckets,
    nextWindow,
    msToNextWindow,
    msRemainingInCurrent,
    canTrade,
    trafficLight,
    trafficReason,
    spreadThreshold,
    bestAnalysisTime: fmtHHMM(bestAnalysisMins),
    latestEntry: fmtHHMM(latestEntryMins),
    latestClose: fmtHHMM(latestCloseMins),
  };
}
