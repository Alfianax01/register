import type { Metadata } from 'next';
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
        <ToastProvider>
          <AppLayoutWrapper>
            {children}
          </AppLayoutWrapper>
        </ToastProvider>
      </body>
    </html>
  );
}
