# Tradeloft

Next.js 14 App Router dashboard for personal intraday trading research.

## Setup

Create a `.env` file with your Finnhub API key:

```bash
FINNHUB_API_KEY=your_key_here
```

## Features

- Live-Kurse für BTC / ETH / SOL sowie ausgewählte Aktien und Indexdaten
- Persistente Einstellungen und Trade-Log via `localStorage`
- Analyse-Runner mit Asset-Modus, Universum und manueller Asset-Eingabe
- Trade-Log inklusive Ergebnis, Exit-Details und JSON-Export
- Kapital-Tracker mit Linienchart und Balkenchart
- Dark/Light-Mode Toggle

## Setup

```bash
npm install
npm run dev
```

## Notes

- Die App verwendet einen internen Next.js API-Route-Proxy für live Daten von CoinGecko und Yahoo Finance.
- Die Analyse-Ergebnisse sind derzeit lokal generiert und als Architekturvorlage für spätere API-/LLM-Integration gedacht.

## GitHub & Vercel Deployment

1. Erstelle ein GitHub-Repository (z. B. `trading-dashboard`).
2. Füge das Remote hinzu:
	```bash
	git remote add origin https://github.com/<dein-benutzername>/trading-dashboard.git
	git branch -M main
	git push -u origin main
	```
3. Öffne `vercel.com` und importiere das GitHub-Repo.
4. Setze in den Vercel-Einstellungen die Umgebungsvariable:
	- `FINNHUB_API_KEY`
5. Vercel erkennt `Next.js` automatisch und verwendet:
	- Build Command: `npm run build`
	- Output Directory: `.next`

### Local Deployment

```bash
npm install
npm run dev
```
