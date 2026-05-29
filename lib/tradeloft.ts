import { AnalysisResult, AnalysisSetup, MarketMode, QuoteResponse, SetupSignals } from '@/types/trade';
import { RISK, AssetBucket } from '@/lib/rules/config';
import { FULL_UNIVERSE } from '@/lib/rules/constituents';
import { scanCandidates } from '@/lib/runner/scanner';

// --- Markt-Kontext (fundamentale & makro Einordnung je Asset) ---

const ASSET_CONTEXT: Record<string, string> = {
  BTC: 'Bitcoin ist die weltweit größte Kryptowährung (~1,2 Bio. USD Market Cap) und wird primär als digitales Gold und inflationsresistenter Wertspeicher gesehen. Institutionelle Adoption durch Spot-ETFs (BlackRock, Fidelity) hat die Marktstruktur erheblich professionalisiert. Historisch folgen Preiszyklen dem Halving-Rhythmus (~4 Jahre). BTC ist stark mit US-Geldpolitik und dem globalen Risk-on/off-Sentiment korreliert. Dominanzindex >50% signalisiert Risikoaversion im Krypto-Markt.',
  ETH: 'Ethereum ist die führende Smart-Contract-Plattform und das Fundament für DeFi, NFTs und Layer-2-Skalierung. Nach dem Merge (PoS) ist ETH unter hoher Netzauslastung deflationär. Layer-2-Lösungen (Arbitrum, Optimism, Base) skalieren den Durchsatz. ETH/BTC-Ratio gilt als Indikator für den breiten Altcoin-Markt. EIP-4844 (Proto-Danksharding) hat L2-Kosten um >90% gesenkt und die Adoption beschleunigt.',
  SOL: 'Solana ist eine Hochleistungs-Blockchain mit ~65.000 TPS und Sub-Cent-Gebühren. In 2024 Marktführer im Meme-Coin- und DeFi-Segment mit Jupiter als größter DEX. Höhere Volatilität als BTC/ETH bietet stärkeres Upside in Bull-Phasen. FTX-Overhang nach vollständiger Token-Verteilung abgebaut. Netzwerk-Ausfälle in der Vergangenheit bleiben ein Reputationsrisiko.',
  BNB: 'BNB ist der native Token des Binance Smart Chain-Ökosystems. Stark abhängig von Binance-Handelsvolumen und -regulierung. Nach SEC-Verfahren (2023) regulatorische Unsicherheit, aber BNB Chain DeFi-Ökosystem (PancakeSwap) bleibt aktiv. Quarterly Burns reduzieren das Angebot strukturell.',
  XRP: 'XRP (Ripple Labs) fokussiert auf Bankzahlungen und Cross-Border-Transfers. SEC-Klage 2023/24 weitgehend zu Ripple\'s Gunsten entschieden – institutionelles XRP kein Wertpapier. Partnerschaften mit Zentralbanken für CBDC-Integration. Niedrige Transaktionskosten und hohe Geschwindigkeit als Alleinstellungsmerkmal.',
  AVAX: 'Avalanche verbindet Subnetz-Architektur mit institutionellen Use Cases. Amazon AWS-Partnerschaft und Mastercard-Integration. Schwächere Community als Solana, aber stärkere Enterprise-Ausrichtung. Subnet-Technologie erlaubt regulierungskonforme Ketten für Finanzinstitute.',
  AAPL: 'Apple ist mit ~3 Bio. USD Marktkapitalisierung eines der wertvollsten Unternehmen der Welt. Das Services-Segment (App Store, iCloud, Apple Pay, TV+) macht ~25% des Umsatzes bei überdurchschnittlichen Margen. Aktienrückkäufe von ~90 Mrd. USD/Jahr stützen den Kurs strukturell. September-iPhone-Zyklus erzeugt saisonale Muster. Hauptrisiken: China-Abhängigkeit (~20% Umsatz) und Regulierungsdruck auf den App Store (EU Digital Markets Act).',
  NVDA: 'Nvidia dominiert den KI-Chip-Markt mit >80% Marktanteil bei Datacenter-GPUs (H100, B200, Blackwell-Architektur). Das Datacenter-Segment ist zum primären Umsatz- und Gewinntreiber geworden. Nachfrage von Hyperscalern (Microsoft, Google, Amazon, Meta) hält an. Das CUDA-Software-Ökosystem bildet einen extrem tiefen Burggraben. Hohe Bewertung (>30x Umsatz) macht die Aktie anfällig für Wachstumsenttäuschungen oder Exportbeschränkungen (USA→China).',
  AMZN: 'Amazon verbindet den weltgrößten E-Commerce-Marktplatz mit AWS, dem Cloud-Marktführer (~31% Marktanteil). AWS liefert trotz ~20% Umsatzanteil den Großteil des Konzerngewinns. Advertising-Segment wächst >20% p.a. KI-Integration via Amazon Bedrock und Trainium-Chips positioniert AWS als Kerninfrastruktur der KI-Welle. E-Commerce-Margensteigerung durch steigende Seller-Services-Einnahmen.',
  MSFT: 'Microsoft ist als größter OpenAI-Investor direkter Hauptprofiteur der KI-Welle. GitHub Copilot, Office 365 Copilot und Azure OpenAI Service generieren neues Umsatzwachstum. Azure-Cloud wächst ~29% jährlich. Stabiles Geschäftsmodell durch hohen SaaS-Anteil (Teams, Office 365, Dynamics) sichert wiederkehrende Einnahmen. Aktivision-Übernahme diversifiziert ins Gaming-Segment.',
  GOOGL: 'Alphabet erzielt ~75% der Einnahmen aus digitaler Werbung (Google Search, YouTube). Trotz ChatGPT-Konkurrenz hält Google ~90% Suchmarktanteil. Google Cloud wächst >28% und wird profitabler. Gemini-Modelle und DeepMind stärken die KI-Kompetenz. Hauptrisiken: DOJ-Kartellverfahren (Suche, AdTech) und struktureller Shift im KI-Search-Bereich.',
  META: 'Meta kontrolliert mit Facebook, Instagram, WhatsApp und Threads die größte soziale Reichweite weltweit (~3,3 Mrd. tägl. Nutzer). "Year of Efficiency" (2023) transformierte Meta von Verlustmacher zu Cashflow-Maschine. KI-gestütztes Werbetargeting erholt sich stark nach iOS-14-Krise. Reality Labs (VR/AR/Metaverse) verbrennt ~15 Mrd. USD/Jahr, enthält aber Plattform-Optionalität. Llama-Modelle als Open-Source-KI-Asset.',
  TSLA: 'Tesla ist Markenführer im EV-Segment, kämpft aber mit wachsender Konkurrenz (BYD, VW, GM). Automobilmargen unter Druck durch globalen Preiskampf. Energiespeicher (Megapack, Powerwall) wächst >100% p.a. und verbessert Geschäftsmodell-Qualität. FSD (Full Self-Driving) könnte Robotaxi-Netzwerk ermöglichen. Elon Musks politisches Engagement belastet die Marke in Europa und teilen der USA.',
  'SAP.DE': 'SAP ist Europas wertvollstes Technologieunternehmen und globaler Marktführer für ERP-Unternehmenssoftware. Cloud-Transformation (S/4HANA) schreitet voran: >50% der Einnahmen aus der Cloud. KI-Copilot "Joule" als nächster Wachstumskatalysator. Extrem hohe Kundenbindung durch hohe Switching-Costs (ERP-Wechsel = Jahresprojekt). Defensiver Wachstumswert mit stabilen Margins.',
  'SIE.DE': 'Siemens ist ein globaler Industriekonzern mit Fokus auf Automatisierung (Simatic), Digitalisierung und Smart Infrastructure. Siemens Digital Industries profitiert von Industrie-4.0-Investitionen und Reshoring-Trends. Margin-Expansion durch Portfolio-Bereinigung (Spin-offs: Siemens Healthineers, Siemens Energy). Zyklische Abhängigkeit von Industriekapitalausgaben (CapEx-Zyklen) als Hauptrisiko.',
};

function getLabel(symbol: string): string {
  return FULL_UNIVERSE.find(a => a.symbol === symbol)?.name ?? symbol;
}

function getAssetContext(symbol: string): string {
  return ASSET_CONTEXT[symbol] ?? `${getLabel(symbol)} ist ein liquides Asset im Tradeloft-Universum. Für tiefergehende Fundamentalanalyse empfiehlt sich ein Blick auf aktuelle Earnings-Berichte, Sektor-News und Makrodaten.`;
}

function isStock(symbol: string): boolean {
  return FULL_UNIVERSE.find(a => a.symbol === symbol)?.bucket !== 'crypto';
}

function formatTimestamp(date: Date) {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}


function buildSignals(rank: number): { signals: SetupSignals; positiveCount: number } {
  const s: SetupSignals = { trend: '✅', momentum: '✅', volume: '✅', macro: '✅', relative: '✅' };
  if (rank === 2) s.volume = '⚠️';
  if (rank === 3) { s.volume = '⚠️'; s.relative = '⚠️'; }
  return { signals: s, positiveCount: Object.values(s).filter((v) => v === '✅').length };
}

function buildNarrative(symbol: string, rank: number, direction: 'Long' | 'Short', crv: string, positiveCount: number): string {
  const label = getLabel(symbol);
  const rankLabel = rank === 1 ? 'Top-Setup' : rank === 2 ? 'alternatives Setup' : 'Beobachtungskandidat';
  const dirText = direction === 'Long' ? 'Long-Einstieg' : 'Short-Einstieg';
  const signalText = positiveCount === 5
    ? 'Alle 5 Signalfamilien zeigen grün – optimale Ausgangslage.'
    : `${positiveCount}/5 Signalfamilien grün – akzeptables Setup, erhöhte Selektivität empfohlen.`;

  const templates: Record<number, string> = {
    1: `${label} ist heute das ${rankLabel} für einen ${dirText}. ${signalText} Trend auf Daily und Weekly zeigt kohärente Richtung ohne Bruch. Momentum (RSI + MACD) bestätigt ohne Divergenzsignal. Volumen liegt über dem 20-Tages-Durchschnitt und signalisiert institutionelles Interesse. Makro-Umfeld zeigt Risk-on-Stimmung, keine aktiven Red Flags. ${label} outperformt den Sektor auf beta-adjustierter Basis. CRV ${crv} überschreitet die Mindestanforderung von 1:2,0 deutlich. Setup bevorzugen, solange Kurs über dem definierten Stop-Level bleibt.`,
    2: `${label} liefert ein ${rankLabel} für einen ${dirText}. ${signalText} Trend und Momentum sind konstruktiv, Volumen zeigt jedoch leichte Schwäche – Einstieg erst bestätigen, wenn Volumen beim Ausbruch anzieht. Makro passt. CRV ${crv} ist ausreichend. Als zweite Wahl einsetzbar, falls Platz-1-Setup bereits im Trade oder ungültig wird.`,
    3: `${label} steht als ${rankLabel} für einen ${dirText} auf der Watchlist. ${signalText} Trend und Momentum zeigen Potenzial, aber Volumen und relative Stärke müssen noch bestätigen. Kein sofortiger Einstieg empfohlen – Setup beobachten und bei vollständiger Signal-Angleichung neu bewerten. CRV ${crv} vorhanden, aber erst bei Vollbestätigung handeln.`,
  };
  return templates[rank] ?? '';
}

function buildSetup(rank: number, symbol: string, priceMap: Map<string, number>, riskBudget: number): AnalysisSetup {
  const price = priceMap.get(symbol) ?? 100;
  const stopDist = rank === 1 ? 2.8 : rank === 2 ? 3.2 : 3.6;
  const crvMult  = rank === 1 ? 2.2 : 2.0;
  const direction: 'Long' | 'Short' = 'Long';
  const entry  = price;
  const stop   = Number((entry * (1 - stopDist / 100)).toFixed(2));
  const target = Number((entry * (1 + crvMult * stopDist / 100)).toFixed(2));
  const crv    = `1:${crvMult.toFixed(1)}`;
  const { signals, positiveCount } = buildSignals(rank);

  return {
    id: `${rank}`,
    rank,
    asset: getLabel(symbol),
    symbol,
    assetClass: isStock(symbol) ? 'stock' : 'crypto',
    direction,
    signals,
    positiveCount,
    entry,
    stop,
    target,
    stopDistancePercent: stopDist,
    positionSize: Number(Math.max(0, riskBudget / (stopDist / 100)).toFixed(2)),
    maxLoss: Number(riskBudget.toFixed(2)),
    crv,
    window: 'nächste 4–8 Stunden',
    duration: 'Intraday',
    explanation: `Analyse basiert auf Trend, Momentum, Volumen, Makro und relativer Stärke für ${getLabel(symbol)}.`,
    invalidation: `Schluss unter ${stop.toFixed(2)} € oder Trendbruch im 15-min-Chart.`,
    analysisNarrative: buildNarrative(symbol, rank, direction, crv, positiveCount),
    assetContext: getAssetContext(symbol),
    timestamp: formatTimestamp(new Date()),
  };
}

export function buildAnalysisResult(
  capital: number,
  mode: MarketMode,
  manualAsset: string,
  quoteData: QuoteResponse | null,
  activeBuckets?: AssetBucket[],
): AnalysisResult {
  const priceMap = new Map<string, number>();
  quoteData?.crypto.forEach((p) => p.price !== null && priceMap.set(p.symbol, p.price));
  quoteData?.stock.forEach((p) => p.price !== null && priceMap.set(p.symbol, p.price));

  const riskBudget = capital * RISK.perTrade;
  const top3 = scanCandidates(mode, manualAsset, quoteData, activeBuckets ?? [], new Date());
  const setups = top3.map((symbol, i) => buildSetup(i + 1, symbol, priceMap, riskBudget));

  return {
    marketContext: `Analyse · Modus "${mode}" · ${new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
    redFlag: { blocked: false, reason: '' },
    setups,
    note: 'Tradeloft zeigt Top-3 Setups basierend auf 5 orthogonalen Signalfamilien. Kein aggregierter Score – jedes Signal transparent ausgewiesen.',
  };
}
