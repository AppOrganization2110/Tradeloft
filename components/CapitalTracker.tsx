'use client';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TradeLogEntry } from '@/types/trade';

function formatCurrency(value: unknown) {
  if (Array.isArray(value)) {
    const maybeValue = value[0];
    if (typeof maybeValue === 'number') return `${maybeValue.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €`;
    if (typeof maybeValue === 'string') return `${maybeValue} €`;
    return '–';
  }

  if (typeof value === 'number') {
    return `${value.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €`;
  }
  if (typeof value === 'string') {
    return `${value} €`;
  }
  return '–';
}

export default function CapitalTracker({ tradeLog }: { tradeLog: TradeLogEntry[] }) {
  const chartData = tradeLog
    .filter((entry) => typeof entry.result === 'number')
    .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))
    .map((entry, index) => ({
      name: `${index + 1}`,
      capital: entry.capital + (entry.result ?? 0),
      profit: entry.result ?? 0,
    }));

  const closedTrades = tradeLog.filter((entry) => typeof entry.result === 'number');
  const wins = closedTrades.filter((entry) => (entry.result ?? 0) > 0);
  const losses = closedTrades.filter((entry) => (entry.result ?? 0) <= 0);
  const peak = Math.max(0, ...chartData.map((item) => item.capital));
  const trough = Math.min(...chartData.map((item) => item.capital), peak);
  const currentDrawdown = peak > 0 ? Math.round(((peak - trough) / peak) * 100) : 0;

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-6 shadow-card">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-700 bg-bg-tertiary p-4">
            <h2 className="text-lg font-semibold text-white">Kapitalentwicklung</h2>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#00d4aa" stopOpacity={0.08} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: '#111118', borderColor: '#2a2e3a' }} />
                  <Area type="monotone" dataKey="capital" stroke="#00d4aa" fill="url(#capitalGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-bg-tertiary p-4">
            <h2 className="text-lg font-semibold text-white">Statistiken</h2>
            <div className="mt-5 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-4">
                <p className="text-slate-400">Trades gesamt</p>
                <p className="mt-2 text-xl text-white">{tradeLog.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-4">
                <p className="text-slate-400">Win-Rate</p>
                <p className="mt-2 text-xl text-white">{closedTrades.length ? `${Math.round((wins.length / closedTrades.length) * 100)}%` : '–'}</p>
              </div>
              <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-4">
                <p className="text-slate-400">Ø Gewinn / Win-Trade</p>
                <p className="mt-2 text-xl text-white">{wins.length ? `${(wins.reduce((sum, entry) => sum + (entry.result ?? 0), 0) / wins.length).toFixed(0)} €` : '–'}</p>
              </div>
              <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-4">
                <p className="text-slate-400">Ø Verlust / Loss-Trade</p>
                <p className="mt-2 text-xl text-white">{losses.length ? `${(losses.reduce((sum, entry) => sum + (entry.result ?? 0), 0) / losses.length).toFixed(0)} €` : '–'}</p>
              </div>
              <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-4">
                <p className="text-slate-400">Bester Trade</p>
                <p className="mt-2 text-xl text-white">{closedTrades.length ? `${Math.max(...closedTrades.map((entry) => entry.result ?? 0)).toFixed(0)} €` : '–'}</p>
              </div>
              <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-4">
                <p className="text-slate-400">Schlechtester Trade</p>
                <p className="mt-2 text-xl text-white">{closedTrades.length ? `${Math.min(...closedTrades.map((entry) => entry.result ?? 0)).toFixed(0)} €` : '–'}</p>
              </div>
              <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-4">
                <p className="text-slate-400">Aktueller Drawdown</p>
                <p className="mt-2 text-xl text-white">{currentDrawdown}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-700 bg-bg-tertiary p-6 shadow-card">
        <h2 className="text-lg font-semibold text-white">Gewinn/Verlust pro Trade</h2>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: '#111118', borderColor: '#2a2e3a' }} />
              <Bar dataKey="profit">{chartData.map((entry, idx) => <Cell key={idx} fill={entry.profit >= 0 ? '#00c853' : '#ff4444'} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
