import type { Metadata } from 'next';
import { Montserrat, Poppins } from 'next/font/google';
import './globals.css';
import SiteNav from '@/components/chrome/SiteNav';
import SiteFooter from '@/components/chrome/SiteFooter';
import ScrollProgress from '@/components/chrome/ScrollProgress';
import SmoothScroll from '@/components/chrome/SmoothScroll';
import PageTransition from '@/components/chrome/PageTransition';

/**
 * FILLIT sets headings in Gotham and body copy in Visby CF. Both are licensed
 * faces we cannot redistribute, so the two closest geometric sans families on
 * Google Fonts stand in: Montserrat for Gotham, Poppins for Visby CF.
 */
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fillit-market-intelligence.vercel.app'),
  title: {
    default: 'FILLIT Market Intelligence — Divesh Anand',
    template: '%s · FILLIT Market Intelligence',
  },
  description:
    '636 companies visited across the UAE over seven weeks. The field research, the database and the findings, from a market research internship at FILLIT Diesel Trading LLC.',
  openGraph: {
    title: 'FILLIT Market Intelligence — Divesh Anand',
    description: '636 companies. Seven weeks. One market, mapped.',
    type: 'website',
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AE" className={`${montserrat.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <ScrollProgress />
        <SiteNav />
        <main id="main">
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
