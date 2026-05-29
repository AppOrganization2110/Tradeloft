import { FULL_UNIVERSE } from '@/lib/rules/constituents';
import { RISK, TIME_CONFIG, AssetBucket } from '@/lib/rules/config';
import { MarketMode, QuoteResponse } from '@/types/trade';

// Approximate spread estimate — no real bid/ask data available.
// EU stocks during Xetra (09:00–17:30): ~0.02%.  Outside: ~0.12% (L&S wider but still OK).
// US stocks during NYSE (~15:30–22:00 local): ~0.03%.  Outside: ~0.12%.
// Crypto 24/7: ~0.05%.
function estimatedSpreadPct(bucket: AssetBucket, localMins: number): number {
  const xetraCore  = localMins >= 9 * 60 && localMins < 17 * 60 + 30;
  const nyseLikely = localMins >= 15 * 60 + 30 && localMins < 22 * 60;
  if (bucket === 'eu') return xetraCore  ? 0.02 : 0.12;
  if (bucket === 'us') return nyseLikely ? 0.03 : 0.12;
  return 0.05; // crypto
}

export function scanCandidates(
  mode: MarketMode,
  manualAsset: string,
  quoteData: QuoteResponse | null,
  preferredBuckets: AssetBucket[], // from WindowState.activeBuckets — soft bonus, not filter
  now: Date,
): string[] {
  const localMins    = now.getHours() * 60 + now.getMinutes();
  const trCloseMins  = TIME_CONFIG.trCloseH * 60 + TIME_CONFIG.trCloseM;
  const requiredMins = TIME_CONFIG.minHoldMin + TIME_CONFIG.closeMarginMin;
  const enoughTime   = trCloseMins - localMins >= requiredMins;

  const inXetraCore     = localMins >= 9 * 60 && localMins < 17 * 60 + 30;
  const spreadThreshold = inXetraCore ? RISK.spread.xetraCore : RISK.spread.extended;

  const priceMap = new Map<string, number>();
  quoteData?.crypto.forEach(p => { if (p.price !== null) priceMap.set(p.symbol, p.price); });
  quoteData?.stock.forEach(p  => { if (p.price !== null) priceMap.set(p.symbol, p.price); });

  const manual = manualAsset.trim().toUpperCase() || null;

  const pool = FULL_UNIVERSE.filter(c => {
    if (mode === 'Nur Krypto') return c.bucket === 'crypto';
    if (mode === 'Nur Aktien') return c.bucket !== 'crypto';
    return true; // Beides
  });

  const scored = pool
    .filter(c => c.symbol !== manual)
    .map(c => {
      const price = priceMap.get(c.symbol) ?? null;
      if (!price) return null; // no live price → skip

      // Hard rule: non-crypto needs enough time before TR close (23:00)
      if (c.bucket !== 'crypto' && !enoughTime) return null;

      // Spread quality gate (time-dependent threshold, NOT bucket exclusion)
      const estSpread = estimatedSpreadPct(c.bucket, localMins);
      if (estSpread > spreadThreshold) return null;

      // Small window bonus — preferred bucket scores slightly higher, never excluded
      const windowBonus = preferredBuckets.includes(c.bucket) ? 0.15 : 0.0;
      return { symbol: c.symbol, score: 1.0 + windowBonus };
    })
    .filter((x): x is { symbol: string; score: number } => x !== null);

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, manual ? 2 : 3).map(s => s.symbol);
  return manual ? [manual, ...top] : top;
}
