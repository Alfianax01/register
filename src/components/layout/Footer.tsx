import React from 'react';
import Link from 'next/link';
import { Shield, MapPin, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0F172A] text-white border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Col 1: Brand & Official Seal */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-[#1E40AF] flex items-center justify-center text-white">
                <Shield className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Markas Besar Tentara Nasional Indonesia
                </span>
                <span className="text-[16px] font-semibold text-white block">
                  Panitia Penyelenggara RAPIM TNI 2026
                </span>
              </div>
            </div>
            <p className="text-[14px] text-slate-400 max-w-md leading-relaxed">
              Sistem resmi registrasi digital, akreditasi peserta sidang paripurna, pemindaian presensi gerbang, dan tata kelola penempatan akomodasi kedinasan.
            </p>
          </div>

          {/* Col 2: Navigasi Cepat */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[13px] font-semibold text-slate-300 uppercase tracking-wider">
              Layanan Publik
            </h4>
            <ul className="space-y-2 text-[14px]">
              <li>
                <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                  Registrasi Peserta
                </Link>
              </li>
              <li>
                <Link href="/ticket/my-ticket" className="text-slate-400 hover:text-white transition-colors">
                  Cari E-Ticket Peserta
                </Link>
              </li>
              <li>
                <a href="#form-registrasi" className="text-slate-400 hover:text-white transition-colors">
                  Ketentuan Akomodasi Wisma
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Akses Petugas & Kontak */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[13px] font-semibold text-slate-300 uppercase tracking-wider">
              Sekretariat Panitia
            </h4>
            <div className="space-y-2 text-[13px] text-slate-400 leading-relaxed">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>Gedung Ahmad Yani, Mabes TNI Cilangkap, Jakarta Timur 13870</span>
              </p>
              <p className="text-[12px] text-slate-500 pt-1">
                Akses resmi delegasi dan tamu undangan kedinasan.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-slate-500">
          <p>&copy; 2026 Markas Besar Tentara Nasional Indonesia. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-4 text-[12px]">
            <span>Sistem Keamanan Terpadu</span>
            <span>&bull;</span>
            <span>Protokol Enkripsi SHA-256</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
