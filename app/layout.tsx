import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tradeloft',
  description: 'Tradeloft – professional intraday trading dashboard with live prices, analysis runner, trade log and capital tracker.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="scroll-smooth">
      <body className="bg-bg-primary text-text-primary font-sans antialiased">{children}</body>
    </html>
  );
}
