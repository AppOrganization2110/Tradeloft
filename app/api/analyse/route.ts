import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildAnalysisResult } from '@/lib/tradeloft';
import { MarketMode, QuoteResponse } from '@/types/trade';

const SYSTEM_PROMPT = `Du bist Tradeloft, ein professioneller Intraday-Trading-Assistent für den deutschen Trader Thomas.
Thomas handelt über Trade Republic (SPOT only, kein Hebel, kein Overnight, kein Short-Selling, nur Long-Positionen).

Wichtigste Handelsregeln:
- Max. 2% Risiko pro Trade (Positionsgröße wird danach berechnet)
- Mindest-CRV: 1:2,0
- Kein Trade bei: FOMC/EZB-Entscheidung heute, VIX>30, Earnings des Assets heute
- Tagesverlust-Limit: 6% des Kapitals → HANDELSSTOPP
- Mindestens 4/5 Signalfamilien müssen grün sein (Trend, Momentum, Volumen, Makro, Relative Stärke)

Antworte IMMER als reines JSON-Objekt ohne Markdown-Backticks oder zusätzlichen Text.`;

export async function POST(req: NextRequest) {
  let capital = 10000;
  let mode: MarketMode = 'Beides';
  let manualAsset = '';
  let quoteData: QuoteResponse | null = null;

  try {
    const body = await req.json() as {
      capital: number;
      mode: MarketMode;
      manualAsset: string;
      quoteData: QuoteResponse | null;
    };
    capital = body.capital;
    mode = body.mode;
    manualAsset = body.manualAsset;
    quoteData = body.quoteData;
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 });
  }

  // Build static analysis (trade parameters, signals, etc.)
  const staticResult = buildAnalysisResult(capital, mode, manualAsset, quoteData);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // No API key — return static result
    return NextResponse.json(staticResult);
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    // Price summary for context
    const priceLines: string[] = [];
    quoteData?.crypto.forEach(p => {
      if (p.price !== null) {
        priceLines.push(`${p.symbol}: ${p.price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`);
      }
    });
    quoteData?.stock.forEach(p => {
      if (p.price !== null && !p.symbol.startsWith('^')) {
        priceLines.push(`${p.symbol}: ${p.price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`);
      }
    });

    const setupLines = staticResult.setups.map(s => {
      const price = quoteData?.crypto.find(p => p.symbol === s.symbol)?.price
        ?? quoteData?.stock.find(p => p.symbol === s.symbol)?.price
        ?? null;
      const priceStr = price !== null ? `${price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` : 'kein Kurs';
      return `- Platz ${s.rank}: ${s.symbol} (${s.asset}), Kurs: ${priceStr}, Entry: ${s.entry.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €, Stop: ${s.stop.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €, Ziel: ${s.target.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €, CRV: ${s.crv}`;
    }).join('\n');

    const date = new Date().toLocaleDateString('de-DE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const time = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    const symbolsJson = staticResult.setups.map(s => `"${s.symbol}"`).join(', ');

    const userPrompt = `Datum: ${date}, Uhrzeit: ${time} Uhr MEZ
Kapital: ${capital.toLocaleString('de-DE')} €
Analyse-Modus: ${mode}

Top-3 Setups für heute:
${setupLines}

Verfügbare Live-Kurse:
${priceLines.join('\n')}

Liefere folgendes JSON mit präziser, spezifischer Marktanalyse für heute:
{
  "marketContext": "Überblick über die heutige Gesamtmarktlage in 2-3 konkreten Sätzen. Nenne spezifische Kursniveaus aus den oben angegebenen Preisen. Erwähne makroökonomisches Umfeld (US-Futures, DAX-Trend, Risk-on/off).",
  "setups": [
    {
      "symbol": ${symbolsJson.split(', ')[0]},
      "analysisNarrative": "Technische Analyse in 4-6 Sätzen: Trend auf Daily und Weekly, Momentum (RSI-Einschätzung, MACD), Volumen-Situation, Makro-Einfluss. Nenne die konkreten Kurs-Levels aus den Setup-Daten oben.",
      "assetContext": "📊 MARKTLAGE: [Sektor/Markt-Kontext heute für dieses Asset in 1-2 Sätzen] | 🎯 SETUP-BEGRÜNDUNG: [Warum genau dieses Asset heute? Katalysatoren, relative Stärke vs. Sektor] | ⚠️ ENTSCHEIDUNG: [TRADE oder KEIN TRADE] — [Kernbegründung in 1 Satz]",
      "decision": "trade",
      "decisionReason": "Kurze Begründung warum Trade oder Kein Trade (1 Satz)"
    },
    {
      "symbol": ${symbolsJson.split(', ')[1] ?? '""'},
      "analysisNarrative": "...",
      "assetContext": "📊 MARKTLAGE: ... | 🎯 SETUP-BEGRÜNDUNG: ... | ⚠️ ENTSCHEIDUNG: ...",
      "decision": "trade",
      "decisionReason": "..."
    },
    {
      "symbol": ${symbolsJson.split(', ')[2] ?? '""'},
      "analysisNarrative": "...",
      "assetContext": "📊 MARKTLAGE: ... | 🎯 SETUP-BEGRÜNDUNG: ... | ⚠️ ENTSCHEIDUNG: ...",
      "decision": "no-trade",
      "decisionReason": "..."
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const rawText = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('');

    // Strip any accidental markdown fences
    const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(jsonText) as {
      marketContext?: string;
      setups?: Array<{
        symbol: string;
        analysisNarrative?: string;
        assetContext?: string;
        decision?: 'trade' | 'no-trade';
        decisionReason?: string;
      }>;
    };

    const enrichedSetups = staticResult.setups.map(setup => {
      const llm = parsed.setups?.find(s => s.symbol === setup.symbol);
      if (!llm) return setup;
      return {
        ...setup,
        analysisNarrative: llm.analysisNarrative ?? setup.analysisNarrative,
        assetContext: llm.assetContext ?? setup.assetContext,
        decision: llm.decision,
        decisionReason: llm.decisionReason,
      };
    });

    return NextResponse.json({
      ...staticResult,
      marketContext: parsed.marketContext ?? staticResult.marketContext,
      setups: enrichedSetups,
    });
  } catch (err) {
    console.error('[/api/analyse] Claude API error, falling back to static result:', err);
    return NextResponse.json(staticResult);
  }
}
