import TradeloftApp from '@/components/TradeloftApp';

const navItems = ['Dashboard', 'Analyse', 'Trade-Log', 'Kapital'];

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-40 mb-8 rounded-b-3xl border-b border-slate-700 bg-bg-secondary/95 pb-6 backdrop-blur-xl">
          <div className="flex flex-col gap-6 py-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-accent-cyan">Tradeloft</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Professionelles Intraday-Trading</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                Tradeloft vereint Live-Kurse, Analyse-Runner, Trade-Log und Kapital-Tracker in einer präzisen Trading-Terminal-Oberfläche.
              </p>
            </div>
            <nav className="flex flex-wrap gap-3">
              {navItems.map((item) => (
                <button
                  key={item}
                  className="min-h-[44px] rounded-full border border-slate-700 bg-bg-tertiary px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-accent-cyan hover:text-white"
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <TradeloftApp />
      </div>
    </main>
  );
}
