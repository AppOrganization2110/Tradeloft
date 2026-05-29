'use client';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TradeLogEntry } from '@/types/trade';

export default function CapitalTracker({ capital, tradeLog }: { capital: number; tradeLog: TradeLogEntry[] }) {
  const capitalHistory = tradeLog
    .slice()
    .reverse()
    .map((entry, index) => ({ name: `T-${tradeLog.length - index}`, value: entry.capital }));

  const pnlHistory = tradeLog.map((entry) => ({ name: entry.asset, result: entry.result ?? 0 }));

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-700 bg-bg-secondary p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Kapital-Tracker</h2>
            <p className="mt-1 text-sm text-text-secondary">Visualisiere Kapitalverlauf und Trade-P&L.</p>
          </div>
          <p className="text-sm text-slate-300">Aktuelles Kapital: {capital.toFixed(2)} €</p>
        </div>

        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={capitalHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#2a2a3a" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#111118', borderColor: '#2a2a3a', color: '#e8e8f0' }} />
              <Area type="monotone" dataKey="value" stroke="#00d4aa" fill="url(#capitalGradient)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-700 bg-bg-tertiary p-6 shadow-card">
        <h3 className="text-lg font-semibold text-white">Letzte Trade-P&L</h3>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={pnlHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#2a2a3a" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#111118', borderColor: '#2a2a3a', color: '#e8e8f0' }} />
              <Bar dataKey="result" fill="#00d4aa" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
