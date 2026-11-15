import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/components/AppContext';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'KaljiHome — Elderly Care & Medication Management Platform',
  description: 'Smart, interconnected healthcare and medication management platform for Indian older adults and their Care Circles.',
  icons: {
    icon: '/assets/kaljihome_icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/assets/kaljihome_icon.svg" />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-[#FAF8F5]">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <AppProvider>
          <Header />
          <Navigation />
          <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
