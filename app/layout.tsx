import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tradeloft',
  description: 'Professionelles Intraday-Trading-Dashboard mit Live-Daten, Analyse-Runner und Trade-Log.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="bg-bg-primary text-text-primary antialiased">{children}</body>
    </html>
  );
}
