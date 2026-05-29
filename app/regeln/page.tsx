import Link from 'next/link';

export const metadata = {
  title: 'Analyse-Regeln · Tradeloft',
  description: 'Dokumentation der systematischen Analyse-Regeln für Intraday-Trades.',
};

export default function RegelnPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-40 mb-8 rounded-b-3xl border border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-6 shadow-card" style={{ backdropFilter: 'blur(12px)' }}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-[var(--accent-cyan)]">Tradeloft Regeln</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--text-primary)]">Systematische Analyse-Regeln</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Transparente Dokumentation aller Regeln, nach denen die Tradeloft-Analyse arbeitet.
              </p>
            </div>
            <Link href="/" className="btn-ghost">← Zurück zum Dashboard</Link>
          </div>
        </header>

        <div className="space-y-8">
          {/* Risiko-Regeln */}
          <section className="space-y-4">
            <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-6 shadow-card">
              <h2 className="text-2xl font-semibold text-white">💰 Risiko-Regeln</h2>
              <p className="mt-3 text-text-secondary">Kalibrierte Positiony-Sizing und maximale Risikobudgets pro Trade.</p>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-white">Maximales Risiko pro Trade</p>
                  <p className="mt-2 text-sm text-text-secondary">2% des aktuellen Kapitals</p>
                  <p className="mt-1 text-xs text-slate-500">Beispiel: Bei 10.000 € Kapital = max. 200 € Risiko</p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-white">Ordergebühren (Trade Republic)</p>
                  <p className="mt-2 text-sm text-text-secondary">2 € pro Trade (1 € Kauf + 1 € Verkauf)</p>
                  <p className="mt-1 text-xs text-slate-500">Wird im Risiko-Budget bereits berücksichtigt</p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-white">Kursverlust-Budget Formel</p>
                  <code className="mt-3 block font-mono text-sm text-accent-cyan">Kapital × 2% − 2 €</code>
                  <p className="mt-2 text-xs text-slate-500">Davon wird die Positionsgröße abgeleitet</p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-white">Minimum Cost-Risk-Ratio (CRV)</p>
                  <p className="mt-2 text-sm text-text-secondary">1:2,0</p>
                  <p className="mt-1 text-xs text-slate-500">Gewinnpotential muss mind. 2x das Risiko betragen</p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-white">Tagesverlust-Limit (Hard Stop)</p>
                  <p className="mt-2 text-sm text-text-secondary">6% des Kapitals → HANDELSSTOPP für den Tag</p>
                  <p className="mt-1 text-xs text-slate-500">Bei Erreichen: Keine neuen Trades bis morgen</p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-white">Maximale offene Positionen</p>
                  <p className="mt-2 text-sm text-text-secondary">1 Trade gleichzeitig</p>
                  <p className="mt-1 text-xs text-slate-500">Konzentrierte Fokussierung auf jeden Setups</p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-white">Positionsgröße Formel</p>
                  <code className="mt-3 block font-mono text-sm text-accent-cyan">Kursverlust-Budget ÷ Stop-Abstand %</code>
                  <p className="mt-2 text-xs text-slate-500">Cap: nicht größer als verfügbares Kapital</p>
                </div>
              </div>
            </div>
          </section>

          {/* Signal-Familien */}
          <section className="space-y-4">
            <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-6 shadow-card">
              <h2 className="text-2xl font-semibold text-white">📊 5 Orthogonale Signal-Familien</h2>
              <p className="mt-3 text-text-secondary">Unabhängige Marker ohne Doppelzählung. Mindestens 4/5 grün = Setup.</p>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-accent-cyan">1️⃣ Trend (Richtung)</p>
                  <p className="mt-2 text-sm text-text-secondary">Daily + Weekly Richtung</p>
                  <p className="mt-2 text-xs text-slate-500">✅ Grün wenn: Beide Zeitrahmen zeigen gleiche Richtung</p>
                  <p className="text-xs text-slate-500">❌ Rot wenn: Widerspruch zwischen den Zeitrahmen</p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-accent-cyan">2️⃣ Momentum (Kraft)</p>
                  <p className="mt-2 text-sm text-text-secondary">RSI(14) + MACD, divergenzfrei</p>
                  <p className="mt-2 text-xs text-slate-500">✅ Grün wenn: Kein Divergenz-Signal gegen Trade</p>
                  <p className="text-xs text-slate-500">❌ Rot wenn: Bearish/Bullish Divergenz erkannt</p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-accent-cyan">3️⃣ Volumen & Liquidität</p>
                  <p className="mt-2 text-sm text-text-secondary">Relatives Volumen + VWAP</p>
                  <p className="mt-2 text-xs text-slate-500">✅ Grün wenn: Überdurchschnittliches Volumen bestätigt</p>
                  <p className="text-xs text-slate-500">❌ Rot wenn: Schwaches Volumen, illiquide</p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-accent-cyan">4️⃣ Makro & Umwelt</p>
                  <p className="mt-2 text-sm text-text-secondary">Gesamtstimmung + Red-Flag-Check</p>
                  <p className="mt-2 text-xs text-slate-500">✅ Grün wenn: Risk-on Stimmung, keine Events</p>
                  <p className="text-xs text-slate-500">❌ Rot wenn: Risk-off oder kritische Events</p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-accent-cyan">5️⃣ Relative Stärke (Beta)</p>
                  <p className="mt-2 text-sm text-text-secondary">Beta-adjustiert vs. Sektor heute</p>
                  <p className="mt-2 text-xs text-slate-500">✅ Grün wenn: Asset outperformt seinen Sektor</p>
                  <p className="text-xs text-slate-500">❌ Rot wenn: Underperformance vs. Peers</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-400/10 p-4">
                <p className="font-semibold text-amber-200">⚠️ Setup-Schwelle</p>
                <p className="mt-2 text-sm text-text-secondary">Nur Setups mit mindestens 4/5 grünen Signalen werden angezeigt.</p>
              </div>
            </div>
          </section>

          {/* Red-Flag-Check */}
          <section className="space-y-4">
            <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-6 shadow-card">
              <h2 className="text-2xl font-semibold text-white">🚩 Red-Flag-Check (Harter Blocker)</h2>
              <p className="mt-3 text-text-secondary">Alle nachfolgenden Bedingungen SPERREN die gesamte Analyse.</p>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                  <p className="font-semibold text-rose-300">❌ FOMC / EZB / Fed-Entscheidung</p>
                  <p className="mt-1 text-sm text-rose-200">Heute anstehend → Analyse GESPERRT</p>
                </div>

                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                  <p className="font-semibold text-rose-300">❌ Earnings des Assets</p>
                  <p className="mt-1 text-sm text-rose-200">Heute nach Börsenscuss → Nur dieses Asset GESPERRT</p>
                </div>

                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                  <p className="font-semibold text-rose-300">❌ VIX &gt; 30</p>
                  <p className="mt-1 text-sm text-rose-200">Volatilität zu hoch → Analyse GESPERRT</p>
                </div>

                <div className="rounded-2xl border border-amber-500/30 bg-amber-400/10 p-4">
                  <p className="font-semibold text-amber-200">⚠️ US-Feiertag nachmittags</p>
                  <p className="mt-1 text-sm text-amber-200">Reduzierte Liquidität → Warnung, aber nicht blockiert</p>
                </div>
              </div>
            </div>
          </section>

          {/* Trading-Universum */}
          <section className="space-y-4">
            <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-6 shadow-card">
              <h2 className="text-2xl font-semibold text-white">🌍 Trading-Universum</h2>
              <p className="mt-3 text-text-secondary">Verfügbare Asset-Klassen und deren Handelszeiten.</p>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-cyan-300">💵 Kryptowährungen (24/7)</p>
                  <p className="mt-2 text-sm text-text-secondary">
                    Kern: <span className="font-mono">BTC · ETH · SOL</span>
                  </p>
                  <p className="mt-2 text-sm text-text-secondary">
                    Erweitert (Top-20 nach Marktkapitalisierung, ausreichend liquide):<br />
                    <span className="font-mono">BNB · XRP · ADA · AVAX · DOT · MATIC · LINK · UNI · AAVE · ATOM · LTC · NEAR</span>
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Quelle: CoinGecko API · Keine Meme-Coins · Keine illiquiden Coins</p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-cyan-300">📈 Aktien (Mo–Fr 07:30–23:00 Uhr)</p>
                  <p className="mt-2 text-sm text-text-secondary">
                    US-Tech / Large Caps:<br />
                    <span className="font-mono">AAPL · NVDA · AMZN · MSFT · GOOGL · META · TSLA · AMD</span>
                  </p>
                  <p className="mt-2 text-sm text-text-secondary">
                    DAX-Werte:<br />
                    <span className="font-mono">SAP · Siemens · Allianz · BMW · Mercedes-Benz · BASF · Deutsche Telekom · Deutsche Bank · Volkswagen</span>
                  </p>
                  <p className="mt-2 text-sm text-text-secondary">
                    EU Blue Chips:<br />
                    <span className="font-mono">ASML · Novo Nordisk · TotalEnergies · LVMH</span>
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Quelle: Finnhub API · Nur auf Trade Republic handelbar · Nur Börsenhandelszeiten</p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-cyan-300">🔀 Modus-Steuerung</p>
                  <p className="mt-2 text-sm text-text-secondary">
                    <strong>Nur Krypto</strong> → Analyse ausschließlich aus dem Krypto-Universum<br />
                    <strong>Nur Aktien</strong> → Analyse ausschließlich aus dem Aktien-Universum<br />
                    <strong>Beides</strong> → Beste Assets aus beiden Klassen gemischt
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Der Modus bestimmt vollständig, welche Assets analysiert werden – unabhängig von Kursdaten.</p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-cyan-300">🏦 Broker & Beschränkungen</p>
                  <p className="mt-2 text-sm text-text-secondary">Trade Republic: SPOT only, kein Hebel, keine Overnight-Positionen</p>
                  <p className="mt-2 text-xs text-slate-500">Konservatives Einzelhandel-Setup für Intraday</p>
                </div>
              </div>
            </div>
          </section>

          {/* Datentransparenz */}
          <section className="space-y-4">
            <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-6 shadow-card">
              <h2 className="text-2xl font-semibold text-white">⏱️ Datentransparenz & Alter</h2>
              <p className="mt-3 text-text-secondary">Kontinuierliche Überwachung der Datenfrische für vertrauensvolle Analysen.</p>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-white">Zeitstempel IMMER sichtbar</p>
                  <p className="mt-1 text-sm text-text-secondary">Format: &quot;Daten von: 14:32:07 · vor 23s&quot;</p>
                </div>

                <div className="rounded-2xl border border-amber-500/30 bg-amber-400/10 p-4">
                  <p className="font-semibold text-amber-200">&gt; 5 Minuten alt</p>
                  <p className="mt-1 text-sm text-amber-200">Gelbe Warnung: &quot;Achtung: Daten älter als 5 Minuten&quot;</p>
                </div>

                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                  <p className="font-semibold text-rose-300">&gt; 15 Minuten alt</p>
                  <p className="mt-1 text-sm text-rose-200">Rote Warnung: &quot;Bitte aktualisieren: Daten älter als 15 Minuten&quot;</p>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-white">Automatisches Polling</p>
                  <p className="mt-1 text-sm text-text-secondary">Daten aktualisieren sich alle 15 Sekunden im Hintergrund</p>
                </div>
              </div>
            </div>
          </section>

          {/* KI-Hinweis */}
          <section className="space-y-4">
            <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-6 shadow-card">
              <h2 className="text-2xl font-semibold text-white">🤖 LLM als Erklärungsschicht</h2>
              <p className="mt-3 text-text-secondary">Wissenschaftliche Grundprämisse: KI ist NICHT die Signalquelle.</p>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-white">Was Claude NICHT macht</p>
                  <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                    <li>• Vorhersagen treffen oder Preisziele setzen</li>
                    <li>• Aggregate Scores (z.B. &quot;85/100 Confidence&quot;) erfinden</li>
                    <li>• Signale generieren oder erfinden</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                  <p className="font-semibold text-white">Was Claude MACHT</p>
                  <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                    <li>• Verfügbare Daten in strukturierte Tabellen organisieren</li>
                    <li>• Signalkombinationen logisch erklären</li>
                    <li>• Risiko- und Handelsszenarien ausformulieren</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Keine aggregierten Scores */}
          <section className="space-y-4">
            <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-6 shadow-card">
              <h2 className="text-2xl font-semibold text-white">📋 Transparente Signaltabelle (NICHT aggregiert)</h2>
              <p className="mt-3 text-text-secondary">Jedes Signal wird explizit ausgewiesen – kein versteckter Score dahinter.</p>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-4 py-2 text-left font-semibold text-slate-300">Signal</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-300">Status</th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-300">Bedeutung</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    <tr className="border-b border-slate-700">
                      <td className="px-4 py-3">Trend</td>
                      <td className="px-4 py-3"><span className="text-emerald-300">✅ Grün</span></td>
                      <td className="px-4 py-3 text-slate-400">Beide Zeitrahmen zeigen Richtung</td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-4 py-3">Momentum</td>
                      <td className="px-4 py-3"><span className="text-emerald-300">✅ Grün</span></td>
                      <td className="px-4 py-3 text-slate-400">Kein Divergenz-Signal</td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-4 py-3">Volumen</td>
                      <td className="px-4 py-3"><span className="text-emerald-300">✅ Grün</span></td>
                      <td className="px-4 py-3 text-slate-400">Überdurchschnittlich, bestätigt</td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="px-4 py-3">Makro</td>
                      <td className="px-4 py-3"><span className="text-emerald-300">✅ Grün</span></td>
                      <td className="px-4 py-3 text-slate-400">Risk-on, keine Red Flags</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Relative Stärke</td>
                      <td className="px-4 py-3"><span className="text-emerald-300">✅ Grün</span></td>
                      <td className="px-4 py-3 text-slate-400">Asset outperformt Sektor</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-700 bg-bg-tertiary p-4">
                <p className="font-semibold text-white">Mindestanforderung für Setup</p>
                <p className="mt-2 text-sm text-text-secondary">4/5 der oben genannten Signale müssen grün sein</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
