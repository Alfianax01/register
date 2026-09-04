import React from 'react';
import { TniEmblem } from '@/components/emblems/TniEmblem';
import { Shield, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#050B08] border-t border-[#193327] text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Logo */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <TniEmblem matra="MABES" size="md" />
              <div>
                <h4 className="text-slate-100 font-serif font-bold text-sm tracking-wide">
                  MARKAS BESAR TENTARA NASIONAL INDONESIA
                </h4>
                <p className="text-[#D4AF37] font-sans text-xs">
                  Panitia Penyelenggara Rapat Pimpinan TNI 2026
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              Sistem Informasi Registrasi Resmi, Manajemen Penempatan Kursi Paripurna, dan Presensi QR-Code Terpadu Tri Matra (TNI AD, TNI AL, TNI AU).
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sistem Terenkripsi & Terverifikasi Keamanan Siber Militer</span>
            </div>
          </div>

          {/* Col 2: Sekretariat & Lokasi */}
          <div className="space-y-3">
            <h5 className="text-slate-200 font-semibold text-xs uppercase tracking-wider text-[#D4AF37]">
              Lokasi Penyelenggaraan
            </h5>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span>Gedung Ahmad Yani, Mabes TNI Cilangkap, Jakarta Timur</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>Dresscode: PDU / PDH / PSL / Batik Dinas</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Bantuan & Hotline */}
          <div className="space-y-3">
            <h5 className="text-slate-200 font-semibold text-xs uppercase tracking-wider text-[#D4AF37]">
              Bantuan Panitia
            </h5>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>Hotline: (021) 8459-5000 / 0811-TNI-2026</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>Email: sekretariat.rapim@tni.mil.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#13271E] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <p>
            &copy; {new Date().getFullYear()} Tentara Nasional Indonesia. Hak Cipta Dilindungi Undang-Undang.
          </p>
          <div className="flex items-center gap-4">
            <span>Standar Pengamanan Data Personel Militer</span>
            <span>&bull;</span>
            <span className="text-[#D4AF37]">TRI DHARMA EKA KARMA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

