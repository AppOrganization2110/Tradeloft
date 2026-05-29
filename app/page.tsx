import Link from 'next/link';
import TradeloftApp from '@/components/TradeloftApp';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-40 mb-8 rounded-b-3xl border border-[var(--border)] bg-[var(--bg-secondary)] px-5 py-6 shadow-card" style={{ backdropFilter: 'blur(12px)' }}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-[var(--accent-cyan)]">Tradeloft</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--text-primary)]">Professionelles Intraday-Trading</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Tradeloft vereint Live-Kurse, Analyse-Runner, Trade-Log und Kapital-Tracker in einer präzisen Trading-Terminal-Oberfläche.
              </p>
            </div>
            <nav className="flex flex-wrap gap-3">
              <button type="button" className="btn-ghost">Dashboard</button>
              <button type="button" className="btn-ghost">Analyse</button>
              <button type="button" className="btn-ghost">Trade-Log</button>
              <button type="button" className="btn-ghost">Kapital</button>
              <Link href="/regeln" className="btn-ghost">Regeln</Link>
            </nav>
          </div>
        </header>

        <TradeloftApp />
      </div>
    </main>
  );
}
