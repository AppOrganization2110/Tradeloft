# Tradeloft – CLAUDE.md

## Projektübersicht

Persönliches Intraday-Trading-Dashboard "Tradeloft" als Web-App (Next.js 14 + Tailwind CSS).
Nutzer: Thomas (Einzelnutzer, kein Multi-User).
Ziel: Tägliche Marktanalyse, Trade-Parameter berechnen, Kapitalentwicklung tracken.
Phase: 1 (Dashboard + Analyse-Runner). Phase 2 (Backtester + Ensemble-Modelle) folgt später.

---

## Wissenschaftliche Grundprinzipien

1. **LLM = nur Erklärungsschicht** — niemals Signalquelle
2. **5 orthogonale Signalfamilien** — keine korrelierten Marker doppelt zählen
3. **Kein aggregierter Score** — transparente Signaltabelle statt "85/100 Confidence"
4. **Red-Flag-Check** als harter Blocker vor jeder Analyse
5. **Datentransparenz** — immer Zeitstempel, Warnungen bei veralteten Daten
6. **Phase-2-ready** — alle Trade-Daten strukturiert für späteren Backtester gespeichert

---

## Design & UX Standards (nicht verhandelbar)

### Aesthetic
- **Stil:** Professional Trading Terminal – dark-first, industrial/utilitarian mit eleganten Akzenten
- **Feeling:** Bloomberg Terminal trifft modernes Fintech – präzise, dicht, professionell
- **NICHT:** Generische AI-Aesthetics, lila Gradienten, cookie-cutter Dashboards

### Farbpalette (CSS Variables)
```css
--bg-primary: #0a0a0f;        /* Tiefdunkler Hintergrund */
--bg-secondary: #111118;      /* Card-Hintergrund */
--bg-tertiary: #1a1a24;       /* Erhöhte Elemente */
--border: #2a2a3a;            /* Subtile Borders */
--text-primary: #e8e8f0;      /* Haupttext */
--text-secondary: #8888aa;    /* Sekundärtext */
--text-muted: #555570;        /* Deaktiviert/Muted */
--accent-cyan: #00d4aa;       /* Primärer Akzent */
--accent-cyan-dim: #00d4aa22; /* Akzent transparent */
--gain: #00c853;              /* Gewinn/Positiv */
--loss: #ff4444;              /* Verlust/Negativ */
--warning: #ffaa00;           /* Warnung */
--warning-dim: #ffaa0022;     /* Warnung transparent */
```

### Typografie
- **Zahlen & Kurse:** `IBM Plex Mono` – tabellarisch, präzise
- **UI-Text & Labels:** `IBM Plex Sans` – clean, professionell
- **Keine generischen Fonts:** kein Inter, Roboto, Arial, System-UI

### Layout-Prinzipien
- Mobile-first (375px Basis), dann Desktop
- Zahlen immer **rechtsbündig**
- Währungen konsistent: `€ XX,XX` (Komma, nicht Punkt)
- Wichtigste Info (Kapitalstand, aktueller Kurs) always-visible
- Dichte Information ohne Überfüllung – Trading-Terminal-Feeling

### Komponenten-Standards

**Buttons:**
- Mindesthöhe: 44px (Touch-freundlich)
- Primary: `--accent-cyan` Hintergrund, dunkler Text
- Destructive: `--loss` Farbe
- Disabled: `--text-muted`, kein Cursor

**Kurs-Widgets:**
- Positive Änderung: `--gain` + Pfeil ↑
- Negative Änderung: `--loss` + Pfeil ↓
- Kursänderung kurz aufblinken (300ms Flash-Animation) bei Update

**Signal-Tabelle:**
- ✅ grün (`--gain`) mit farbigem Hintergrund
- ❌ rot (`--loss`) mit farbigem Hintergrund
- ⚠️ gelb (`--warning`) mit farbigem Hintergrund
- Nicht nur Icon – auch Zellhintergrund einfärben

**Trade-Parameter:**
- Tabellarisch, Zahlen rechtsbündig aligned
- Entry/TP/SL klar visuell getrennt

**Charts (Recharts):**
- Dunkles Theme durchgehend
- Grid: `--border` Farbe, dezent
- Tooltips: styled mit `--bg-tertiary` Background
- Linien: `--accent-cyan` für Kapital, `--gain`/`--loss` für P&L

**Navigation:**
- Sticky am oberen Rand
- Aktive Seite: `--accent-cyan` Unterstrich + Textfarbe
- App-Name "Tradeloft" mit Monospace-Font

### Ladezustände
- ALLE API-Calls: Skeleton Loader (animiertes Pulsieren) – kein leerer Screen
- Kein stiller Fehler – immer sichtbare Fehlermeldung in `--loss` Farbe

### Datentransparenz-UI
- Zeitstempel immer sichtbar: "Daten von: 14:32:07 · vor 23s"
- > 5 Min alt: gelbe Warnung mit `--warning` Farbe
- > 15 Min alt: rote Warnung + "Bitte aktualisieren"
- Handelsstopp-Banner: volle Breite, `--loss` Hintergrund, nicht übersehbar

### Animationen (sparsam, gezielt)
- Kursänderung: 300ms Flash grün/rot
- Seitenübergänge: subtiles Fade (150ms)
- Skeleton: Pulsieren bei Laden
- KEINE Dauerbewegungen, KEINE ablenkenden Animationen

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
Max. Risiko pro Trade:     2% des aktuellen Kapitals
TR-Ordergebühren:          2 € (1 € Kauf + 1 € Verkauf)
Kursverlust-Budget:        Kapital × 2% − 2 €
Positionsgröße:            Kursverlust-Budget ÷ Stop-Abstand in %
Positionsgröße MAX:        ≤ verfügbares Kapital
Mindest-CRV:               1:2,0
Tagesverlust-Limit:        6% des Kapitals → HANDELSSTOPP für heute
Max. offene Trades:        1
```

**Kein Trade wenn:**
- Red Flag aktiv (FOMC, Earnings, VIX > 30)
- Weniger als 4/5 Signalfamilien grün
- Tagesverlust-Limit erreicht
- Keine Live-Daten verfügbar

---

## Signal-Analyse: 5 orthogonale Familien

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

- FOMC / EZB / Fed-Entscheidung heute → ❌ ANALYSE GESPERRT
- Earnings des Assets heute (Finnhub) → ❌ ASSET GESPERRT
- VIX > 30 → ❌ ANALYSE GESPERRT
- US-Feiertag nachmittags → ⚠️ WARNUNG

---

## Echtzeit-Daten

**Aktien/DAX:** Finnhub API (FINNHUB_API_KEY aus .env)
```
Quote:    https://finnhub.io/api/v1/quote?symbol={TICKER}&token={KEY}
Earnings: https://finnhub.io/api/v1/calendar/earnings?token={KEY}
News:     https://finnhub.io/api/v1/news?category=general&token={KEY}
```

**Krypto:** CoinGecko (kein Key)
```
https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=eur&include_last_updated_at=true
```

**Daten-Frische-Regeln:**
- Zeitstempel IMMER anzeigen
- > 5 Min alt → gelbe Warnung
- > 15 Min alt → rote Warnung + "Bitte aktualisieren"
- Keine Daten → Fehlermeldung, kein Trade

---

## Tech Stack

```
Framework:   Next.js 14 (App Router)
Styling:     Tailwind CSS + CSS Variables
Fonts:       IBM Plex Mono + IBM Plex Sans (Google Fonts)
Daten:       Finnhub API + CoinGecko API
KI-Analyse:  Claude API (claude-sonnet-4-20250514) + Web Search Tool
Speicherung: localStorage (JSON, Phase-2-ready)
Charts:      Recharts
Deployment:  Lokal (npm run dev)
```

---

## App-Seiten

1. **Dashboard** — Live-Kurse, Kapitalstand, Handelsstatus, Tagesverlust-Anzeige
2. **Analyse-Runner** — Red-Flag-Check → Modus → Analyse → Top-3-Setups
3. **Trade-Log** — Gespeicherte Analysen, Ergebnis eintragen, JSON-Export
4. **Kapital-Tracker** — Linienchart, Balkenchart P&L, Statistiken

## Aktueller Implementierungsstand

- UI-Design und Terminal-Optik wurden in `app/page.tsx`, `components/LiveQuotes.tsx`, `components/AnalysisRunner.tsx`, `components/TradeLog.tsx`, `components/CapitalTracker.tsx`, und `components/TradeloftApp.tsx` umgesetzt.
- Farbsystem, typografische Standards und dunkles Dashboard-Theme sind in `app/globals.css` definiert.
- Build ist erfolgreich: `npm run build` wurde ohne Fehler ausgeführt.

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
- API Key nur via process.env.FINNHUB_API_KEY – niemals hardcoden
- Mobile-first Tailwind-Klassen
- Dark/Light Mode persistent via localStorage

---

## Projektstruktur

```
trading-dashboard/
├── CLAUDE.md
├── .env                      ← FINNHUB_API_KEY (niemals committen)
├── .gitignore                ← .env drin
├── .claude/
│   └── skills/
│       └── trading-analyst/
│           ├── SKILL.md
│           └── references/
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
│   ├── finnhub.ts
│   ├── coingecko.ts
│   ├── claude-api.ts
│   └── storage.ts
└── package.json
```

---

## Phase 2 (später)

- Deterministischer Backtester in Python
- Analyse welche Signalfamilien wirklich predictive sind
- Ensemble-Modelle (Logit + Random Forest + Regime-Modell)
- Walk-Forward-Validierung
- ES/CVaR Risikomaße
