# Trading Dashboard – CLAUDE.md

## Projektübersicht

Persönliches Intraday-Trading-Dashboard als Web-App (Next.js 14 + Tailwind CSS).
Nutzer: Thomas (Einzelnutzer, kein Multi-User).
Ziel: Tägliche Marktanalyse, Trade-Parameter berechnen, Kapitalentwicklung tracken.
Phase: 1 (Dashboard + Analyse-Runner). Phase 2 (Backtester + Ensemble-Modelle) folgt später.

---

## Wissenschaftliche Grundprinzipien

Diese App folgt quantitativer Forschungsevidenz — nicht Heuristik:

1. **LLM = nur Erklärungsschicht** — niemals Signalquelle
2. **5 orthogonale Signalfamilien** — keine korrelierten Marker doppelt zählen
3. **Kein aggregierter Score** — transparente Signaltabelle statt "85/100 Confidence"
4. **Red-Flag-Check** als harter Blocker vor jeder Analyse
5. **Datentransparenz** — immer Zeitstempel, Warnungen bei veralteten Daten
6. **Phase-2-ready** — alle Trade-Daten strukturiert für späteren Backtester gespeichert

---

## Skill: Trading Analyst

Skill-Pfad: `.claude/skills/trading-analyst/SKILL.md`

**Aktiviere den Skill automatisch bei:**
- Marktanalysen und Trade-Setups
- Fragen zu Assets (BTC, ETH, SOL, DAX-Werte, US-Techs)
- Risikokalkulation und Positionsgrößenberechnung
- Makro-Briefings und Marktstimmung
- Signalanalyse (Trend, Momentum, Volumen, Makro, Relative Stärke)

**Referenz-Dateien lesen bei:**
- Tiefenanalysen → `references/indicators.md`
- Chartmuster → `references/patterns.md`
- Makro-Kalender → `references/macro-calendar.md`
- Crypto On-Chain → `references/crypto-onchain.md`

---

## Trading-Universum

**Krypto (24/7):** BTC, ETH, SOL + Top-20 Marktkapitalisierung (keine Meme-Coins)
**Aktien (Mo–Fr 07:30–23:00 Uhr):** DAX-Werte, europäische Blue Chips, US-Tech/Large Caps
**Broker:** Trade Republic (SPOT only, kein Hebel, keine Overnight-Positionen)

---

## Risiko-Regeln (wissenschaftlich kalibriert)

```
Max. Risiko pro Trade:     2% des aktuellen Kapitals (nicht 5%!)
TR-Ordergebühren:          2 € (1 € Kauf + 1 € Verkauf)
Kursverlust-Budget:        Kapital × 2% − 2 €
Positionsgröße:            Kursverlust-Budget ÷ Stop-Abstand in %
Positionsgröße MAX:        ≤ verfügbares Kapital
Mindest-CRV:               1:2,0
Tagesverlust-Limit:        6% des Kapitals → HANDELSSTOPP für heute
Max. offene Trades:        1 (kein Cluster-Risiko bei Small Capital)
```

**Warum 2% statt 5%:**
10 Verluste bei 5% = nur noch 60% Kapital.
10 Verluste bei 2% = noch 82% Kapital.
Kapitalerhalt hat Vorrang vor schnellem Wachstum.

**Kein Trade wenn:**
- Red Flag aktiv (FOMC, Earnings, VIX > 30)
- Weniger als 4/5 Signalfamilien grün
- Tagesverlust-Limit erreicht
- Keine Live-Daten verfügbar

---

## Signal-Analyse: 5 orthogonale Familien

RSI und MACD sind korreliert — sie zählen als EINE Familie (Momentum), nicht zwei separate Schichten.
Multi-Timeframe gehört zu Familie 1 (Trend) — nicht separat zählen.

| Familie | Was sie misst | Grün wenn |
|---|---|---|
| 1. Trend | Daily + Weekly Richtung | Beide Zeitrahmen gleiche Richtung |
| 2. Momentum | RSI(14) + MACD, divergenzfrei | Kein Divergenz-Signal gegen Trade |
| 3. Volumen/Liquidität | Relatives Volumen + VWAP | Überdurchschnittliches Volumen bestätigt |
| 4. Makro/Event | Gesamtstimmung + keine Events | Risk-on/off passt, keine Red Flags |
| 5. Relative Stärke | Beta-adj. vs. Sektor heute | Asset outperformt Sektor |

**Mindestanforderung: 4/5 grün** → Setup anzeigen
**Unter 4/5** → "Kein sauberes Setup – heute kein Trade"

---

## Red-Flag-Check (harter Blocker)

Vor jeder Analyse via Web Search prüfen:
- FOMC / EZB / Fed-Entscheidung heute → ❌ ANALYSE GESPERRT
- Earnings des gewählten Assets heute → ❌ ASSET GESPERRT
- VIX > 30 → ❌ ANALYSE GESPERRT
- US-Feiertag nachmittags → ⚠️ WARNUNG (kein Blocker)

---

## Echtzeit-Daten

**Aktien + ETFs:** Yahoo Finance API (kostenlos, kein Key)
**Krypto:** CoinGecko API (kostenlos, 30 req/min ohne Key)
**News/Makro/Red-Flags:** Web Search Tool (Claude's built-in search)

```
Yahoo Finance:  https://query1.finance.yahoo.com/v8/finance/chart/{TICKER}?interval=1d
CoinGecko:      https://api.coingecko.com/api/v3/simple/price?ids={ID}&vs_currencies=eur&include_last_updated_at=true
```

**Daten-Frische-Regeln:**
- Zeitstempel IMMER anzeigen ("Daten von: 14:32:07 Uhr")
- > 5 Minuten alt → gelbe Warnung
- > 15 Minuten alt → rote Warnung + "Bitte manuell aktualisieren"
- Keine Daten → kein Trade, Fehlermeldung anzeigen

---

## Tech Stack

```
Framework:      Next.js 14 (App Router)
Styling:        Tailwind CSS + Dark/Light Mode
Daten:          Yahoo Finance API + CoinGecko API (clientseitig)
KI-Analyse:     Claude API (claude-sonnet-4-20250514) + Web Search Tool
Speicherung:    localStorage (JSON, Phase-2-ready Struktur)
Charts:         Recharts (LineChart + BarChart)
Deployment:     Lokal (npm run dev)
```

---

## App-Seiten

1. **Dashboard** — Live-Kurse, Kapitalstand, Handelsstatus, Tagesverlust-Anzeige
2. **Analyse-Runner** — Red-Flag-Check → Modus wählen → Analyse starten → Top-3-Setups
3. **Trade-Log** — Gespeicherte Analysen, manuelles Ergebnis eintragen, JSON-Export
4. **Kapital-Tracker** — Linienchart Kapitalentwicklung, Balkenchart P&L, Statistiken

---

## localStorage-Struktur (Phase-2-ready)

```json
{
  "capital": 100.00,
  "capitalHistory": [{"date": "ISO", "value": 100.00}],
  "trades": [{
    "id": "uuid",
    "entryTimestamp": "ISO",
    "exitTimestamp": "ISO|null",
    "asset": "BTC",
    "ticker": "bitcoin",
    "direction": "long",
    "entryPrice": 0,
    "exitPrice": null,
    "stopLoss": 0,
    "takeProfit": 0,
    "positionSize": 0,
    "plannedRisk": 0,
    "actualPnL": null,
    "signals": {
      "trend": "green|red|warning",
      "momentum": "green|red|warning",
      "volume": "green|red|warning",
      "macro": "green|red|warning",
      "relativeStrength": "green|red|warning"
    },
    "mode": "crypto|stocks|both",
    "capitalAtEntry": 0,
    "fullAnalysisText": "",
    "notes": ""
  }],
  "dailyLoss": {"date": "ISO-date", "loss": 0},
  "settings": {"theme": "dark|light"}
}
```

---

## Code-Standards

- Deutsch als UI-Sprache
- Komponenten in `components/`, Seiten in `app/`
- Fehlerbehandlung bei ALLEN API-Calls (try/catch + Fallback-UI)
- Keine API Keys im Code (alle verwendeten APIs sind kostenlos ohne Key)
- Mobile-first Tailwind-Klassen
- Dark/Light Mode persistent via localStorage

---

## Projektstruktur

```
trading-dashboard/
├── CLAUDE.md
├── .claude/
│   └── skills/
│       └── trading-analyst/
│           ├── SKILL.md
│           └── references/
│               ├── indicators.md
│               ├── patterns.md
│               ├── macro-calendar.md
│               └── crypto-onchain.md
├── app/
│   ├── page.tsx              ← Dashboard
│   ├── analyse/page.tsx      ← Analyse-Runner
│   ├── trades/page.tsx       ← Trade-Log
│   └── kapital/page.tsx      ← Kapital-Tracker
├── components/
│   ├── KursWidget.tsx
│   ├── SignalTabelle.tsx
│   ├── TradeParameter.tsx
│   ├── DatenZeitstempel.tsx
│   └── KapitalChart.tsx
├── lib/
│   ├── yahoo-finance.ts
│   ├── coingecko.ts
│   ├── claude-api.ts
│   └── storage.ts
└── package.json
```

---

## Phase 2 (später)

Nach ausreichend gesammelten Trade-Daten:
- Deterministischer Backtester in Python
- Analyse welche Signalfamilien wirklich predictive sind
- Ensemble-Modelle (Logit + Random Forest + Regime-Modell)
- Walk-Forward-Validierung
- ES/CVaR Risikomaße
