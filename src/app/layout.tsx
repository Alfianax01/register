import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'E-Registrasi & Presensi Resmi RAPIM TNI 2026',
  description: 'Portal Resmi E-Registrasi, E-Ticket QR Code, Penempatan Kursi Paripurna dan Wisma Tamu Rapat Pimpinan TNI Tahun 2026.',
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
    <html lang="id" className="dark">
      <body className="min-h-screen flex flex-col bg-[#070E0B] text-slate-100 selection:bg-[#D4AF37] selection:text-black">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

