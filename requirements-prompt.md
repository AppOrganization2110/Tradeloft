# Requirements-Prompt für Claude Code
# Einfach komplett kopieren und in Claude Code eingeben

/requirements

Baue ein persönliches Intraday-Trading-Dashboard als Next.js 14 Web-App
(App Router, Tailwind CSS). Einzelnutzer, kein Backend, kein Deployment.
Datenspeicherung via localStorage (JSON).

---

## WISSENSCHAFTLICHE GRUNDPRINZIPIEN (nicht verhandelbar)

Diese App folgt einem klaren Prinzip aus quantitativer Forschung:
- Das LLM ist NUR Erklärungsschicht – niemals Signalquelle
- Signale werden in 5 orthogonale Familien getrennt (keine Doppelzählung)
- Kein aggregierter "Confidence-Score" – stattdessen transparente Signaltabelle
- Red-Flag-Check blockiert Analyse hart bevor ein Setup angezeigt wird
- Alle gespeicherten Daten sind Phase-2-ready (für späteren Backtester)

---

## SEITEN

### 1. Dashboard (Startseite)
- Live-Kurse: BTC, ETH, SOL (CoinGecko API, kostenlos, kein Key nötig)
- Live-Kurse: DAX, SAP, Siemens, Apple, Nvidia (Yahoo Finance API, kein Key)
- Datenanzeige immer MIT Zeitstempel ("Daten von: 14:32:07 Uhr") und Alter in Sekunden
- Handelsstatus: TR Aktien Mo–Fr 07:30–23:00, Krypto 24/7
- Heutiger Kapitalstand + Tagesverlust-Limit-Anzeige (max. 6% des Kapitals)
- Dark/Light Mode Toggle (persistent via localStorage)
- Warnung wenn Tagesverlust-Limit erreicht: "HANDELSSTOPP FÜR HEUTE"

### 2. Analyse-Runner

EINGABE (vor dem Start):
- Aktuelles Kapital in €
- Asset-Modus: [Nur Krypto] [Nur Aktien] [Beides]
- Asset-Universum:
  - Standard: BTC/ETH/SOL + Krypto Top-20 + DAX Top 10 + US Mega Caps
  - Erweitert: Standard + Relative-Stärke-Ausreißer heute
  - Manuell: Freitextfeld für spezifisches Asset

SCHRITT 1 — RED-FLAG-CHECK (vor jeder Analyse, hart blockierend):
Prüfe via Web Search ob heute einer dieser Faktoren zutrifft:
- FOMC / EZB / Fed-Entscheidung heute → ANALYSE GESPERRT
- Earnings des gewählten Assets heute → ASSET GESPERRT
- VIX > 30 (extremes Marktrisiko) → ANALYSE GESPERRT
- US-Feiertag nachmittags (dünnes Volumen) → WARNUNG
Wenn gesperrt: Rote Fehlermeldung anzeigen, kein Setup ausgeben.

SCHRITT 2 — ANALYSE via Claude API:
API-Aufruf: claude-sonnet-4-20250514, Web Search Tool aktiviert, max_tokens: 3000
Der Prompt wird dynamisch gebaut (siehe MASTER-PROMPT unten).

SCHRITT 3 — AUSGABE: Top-3-Setups, jedes Setup zeigt:
- Asset + Richtung (Long/Short)
- SIGNAL-TABELLE (5 orthogonale Familien, jede unabhängig bewertet):
  | Familie           | Signal                        | Status     |
  |-------------------|-------------------------------|------------|
  | Trend             | Daily + Weekly Richtung       | ✅ / ❌ / ⚠️ |
  | Momentum          | RSI(14) + MACD (divergenzfrei)| ✅ / ❌ / ⚠️ |
  | Volumen/Liquidität| Rel. Volumen + VWAP-Abstand   | ✅ / ❌ / ⚠️ |
  | Makro/Event       | Marktstimmung + keine Events  | ✅ / ❌ / ⚠️ |
  | Relative Stärke   | Beta-adj. vs. Sektor heute    | ✅ / ❌ / ⚠️ |
- Anzahl grüner Signale (z.B. "4/5 Familien positiv") – KEIN aggregierter Score
- Trade-Parameter (Entry, SL, TP, Positionsgröße nach Risiko-Formel)
- Erklärungstext (2–3 Sätze, LLM-generiert)
- Invalidierungsbedingungen
- Button "Als Trade speichern"

WICHTIG: Setup wird nur angezeigt wenn mind. 4/5 Signalfamilien grün sind.
Bei 3/5 oder weniger: "Kein sauberes Setup – heute kein Trade."

### 3. Trade-Log
- Alle gespeicherten Analysen, neueste zuerst
- Pro Eintrag (vollständig für Phase-2-Backtester):
  - ISO-Zeitstempel (Datum + Uhrzeit exakt)
  - Asset + Kürzel
  - Richtung (Long/Short)
  - Entry-Preis, SL, TP, Positionsgröße in €
  - Alle 5 Signalstatus zum Zeitpunkt der Analyse
  - Kompletter Analyse-Text
  - Marktmodus zum Zeitpunkt (nur Krypto/nur Aktien/beides)
  - Kapitalbasis zum Zeitpunkt
- Nachträgliche Felder (manuell ausfüllbar):
  - Tatsächlicher Exit-Preis
  - Ergebnis in € (Gewinn/Verlust)
  - Exit-Zeitstempel
  - Notiz
- Kapital wird nach Ergebnis-Eingabe automatisch aktualisiert
- Tagesverlust wird live berechnet und im Dashboard angezeigt
- JSON-Export-Button (für späteren Backtester)

### 4. Kapital-Tracker
- Linienchart: kumuliertes Kapital über Zeit (Recharts)
- Balkenchart: Gewinn/Verlust pro Trade (grün/rot, Recharts)
- Statistiken:
  - Anzahl Trades gesamt
  - Win-Rate in %
  - Ø Gewinn pro Win-Trade in €
  - Ø Verlust pro Loss-Trade in €
  - Bester Trade / Schlechtester Trade
  - Aktueller Drawdown vom Peak in %
  - Längste Verlustserie

---

## MASTER-PROMPT (dynamisch gebaut, {PLATZHALTER} werden ersetzt)

```
Du bist ein professioneller Intraday-Analyst auf Prop-Desk-Niveau.
Deine Rolle: NUR Erklärung und Interpretation. Keine Halluzinationen.
Alle Preise und Daten MÜSSEN via Web Search live abgerufen werden.

KONTEXT:
- Kapital: {KAPITAL} €
- Modus: {MODUS}
- Universum: {UNIVERSUM}
- Broker: Trade Republic | Nur SPOT | Kein Hebel | Keine Overnight-Positionen
- Handelszeiten: Aktien Mo–Fr 07:30–23:00 Uhr, Krypto 24/7

RISIKO-REGELN (absolut):
- Max. Risiko pro Trade: 2% des Kapitals (konservativ nach wissenschaftlicher Evidenz)
- TR-Gebühren: 2 € fix (1 € Kauf + 1 € Verkauf)
- Kursverlust-Budget: {KAPITAL} × 2% − 2 €
- Positionsgröße = Kursverlust-Budget ÷ Stop-Abstand %
- Positionsgröße MAX = verfügbares Kapital
- Mindest-CRV: 1:2,0 (konservativer als bisher)
- Tagesverlust-Limit: 6% des Kapitals – dann kein weiterer Trade heute

SIGNAL-ANALYSE (5 orthogonale Familien – getrennt bewerten, NICHT addieren):

Familie 1 – TREND:
- Daily-Trend (Higher Highs/Lower Lows, EMA 50/200)
- Weekly-Trend (übergeordnete Richtung)
→ Grün: Beide Zeitrahmen zeigen dieselbe Richtung

Familie 2 – MOMENTUM (auf Divergenz prüfen!):
- RSI(14): Keine negative Divergenz bei Long, keine positive bei Short
- MACD(12/26/9): Histogram-Richtung bestätigt Trade
→ Grün: Beide bestätigen, keine Divergenz

Familie 3 – VOLUMEN & LIQUIDITÄT:
- Relatives Volumen: Heute überdurchschnittlich?
- VWAP-Abstand: Trade in Richtung VWAP oder nach Abweichung zurück?
→ Grün: Volumen bestätigt Bewegung, keine extreme VWAP-Abweichung

Familie 4 – MAKRO & EVENT:
- Gesamtmarktstimmung heute (Risk-on/Risk-off)
- Keine blockierenden Events (FOMC, Earnings, VIX>30)
→ Grün: Makro spricht für Setup, keine Events

Familie 5 – RELATIVE STÄRKE:
- Outperformt das Asset heute seinen Sektor/Gesamtmarkt?
- Sektor-adjustiert (nicht nur roher Kursvergleich)
→ Grün: Asset zeigt echte relative Stärke, nicht nur Beta

AUSGABE — exakt dieses Format, Top 3:

---
MARKTLAGE
[3–4 Sätze: Stimmung, Makro, Besonderheiten. Quellenangabe für Live-Daten.]

RED FLAG STATUS: ✅ Keine Flags aktiv ODER ❌ [Grund] → GESPERRT

---
SETUP #1 [stärkstes Setup]

Asset: [Name + Kürzel] | Richtung: [Long/Short]

Signalstatus:
- Trend: [✅/❌/⚠️] [1 Satz Begründung]
- Momentum: [✅/❌/⚠️] [1 Satz Begründung]
- Volumen/Liquidität: [✅/❌/⚠️] [1 Satz Begründung]
- Makro/Event: [✅/❌/⚠️] [1 Satz Begründung]
- Relative Stärke: [✅/❌/⚠️] [1 Satz Begründung]
Ergebnis: [X]/5 Familien positiv

Trade-Parameter:
- Einstieg: [€] [Market / Auf Bestätigung warten]
- Take-Profit: [€]
- Stop-Loss: [€]
- Stop-Abstand: [%]
- Positionsgröße: [€] (Rechnung: {KAPITAL} × 2% − 2 € = X € ÷ Y% = Z €)
- Max. Verlust: [€] (Kursverlust + 2 € Gebühren)
- CRV: [x:x]
- Einstiegsfenster: [Uhrzeit]
- Haltedauer: [ca. X Stunden]

Erklärung: [2–3 Sätze – NUR Interpretation, keine erfundenen Preise]
Invalidierung: [konkrete, messbare Bedingungen]
Datenstand: [Zeitstempel der verwendeten Live-Daten]

---
SETUP #2 [gleiches Format]
SETUP #3 [gleiches Format]

HINWEIS AM ENDE: Alle Preise via Web Search abgerufen um [Uhrzeit].
Falls Web Search Daten nicht verfügbar: Explizit "KEINE LIVE-DATEN – Trade nicht eingehen"
```

---

## TECH-DETAILS

APIs:
- Claude API: claude-sonnet-4-20250514, tools: [{type: "web_search_20250305", name: "web_search"}], max_tokens: 3000
- CoinGecko: https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=eur&include_last_updated_at=true
- Yahoo Finance: https://query1.finance.yahoo.com/v8/finance/chart/{TICKER}?interval=1d

Daten-Handling:
- IMMER Zeitstempel der API-Antwort speichern und anzeigen
- Daten älter als 5 Minuten: gelbe Warnung
- Daten älter als 15 Minuten: rote Warnung + "Bitte manuell aktualisieren"
- try/catch bei ALLEN API-Calls, Fallback-UI bei Fehler

localStorage-Struktur (Phase-2-ready):
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

Charts: Recharts (LineChart + BarChart)
Sprache: Deutsch durchgehend
Design: Mobile-first, Dark/Light Mode via Tailwind dark:-Klassen
