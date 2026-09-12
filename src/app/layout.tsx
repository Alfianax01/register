import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { AppLayoutWrapper } from '@/components/layout/AppLayoutWrapper';

export const metadata: Metadata = {
  title: 'TNI Event Pass — E-Registrasi & Check-In Modern RAPIM 2026',
  description: 'Aplikasi registrasi terpadu, scanner QR Code cerdas, dan penempatan kursi prajurit TNI RAPIM 2026.',
  icons: {
    icon: '/favicon.ico'
  }
};

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={ibmPlexSans.variable}>
      <body className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans selection:bg-primary selection:text-white">
        <ToastProvider>
          <AppLayoutWrapper>
            {children}
          </AppLayoutWrapper>
        </ToastProvider>
      </body>
    </html>
  );
}
