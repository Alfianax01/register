import Link from 'next/link';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-xs space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8 text-slate-600" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400">
            Error 404
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Halaman atau dokumen yang Anda minta tidak tersedia di server portal resmi RAPIM TNI 2026.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#1E40AF] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          Markas Besar Tentara Nasional Indonesia &bull; Cilangkap
        </div>
      </div>
    </div>
  );
}

