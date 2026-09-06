import React from 'react';
import {
  Clock,
  MapPin,
  Shirt,
  Building2
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="w-full flex-1 flex flex-col bg-white">
      {/* =========================================================================
          INFORMASI & KETENTUAN ACARA (Section Utama Landing Page)
          ========================================================================= */}
      <section className="py-8 sm:py-12 border-b border-slate-200/80 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-semibold text-[#1E40AF] tracking-widest uppercase bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-sm">
              Petunjuk Pelaksanaan
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0F172A] tracking-tight pt-1">
              Informasi & Ketentuan Acara
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto leading-relaxed">
              Informasi penting seputar tata tertib kehadiran, jadwal gerbang, pakaian dinas, dan akomodasi wisma RAPIM TNI 2026.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Panel 1 */}
            <div className="p-5 sm:p-6 rounded-xl bg-slate-50/70 border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1E40AF] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-[#0F172A]">
                Jadwal & Kedatangan
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Pemeriksaan barcode presensi dibuka mulai pukul <strong>06.30 WIB</strong>. Seluruh delegasi diharapkan telah menempati kursi sidang paling lambat pukul <strong>07.30 WIB</strong> sebelum sidang pembukaan resmi dimulai.
              </p>
            </div>

            {/* Panel 2 */}
            <div className="p-5 sm:p-6 rounded-xl bg-slate-50/70 border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-[#0F172A]">
                Lokasi & Akses Gerbang
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Bertempat di <strong>Gedung Ahmad Yani, Mabes TNI Cilangkap, Jakarta Timur</strong>. Akses kendaraan dinas dan tamu diarahkan melalui <strong>Gate Utama Hankam</strong> dengan menunjukkan E-Ticket QR Code.
              </p>
            </div>

            {/* Panel 3 */}
            <div className="p-5 sm:p-6 rounded-xl bg-slate-50/70 border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-[#0F172A] flex items-center justify-center">
                <Shirt className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-[#0F172A]">
                Ketentuan Pakaian Dinas
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Prajurit TNI aktif mengenakan <strong>PDU I</strong> untuk upacara pembukaan. Tamu undangan instansi sipil/kementerian mengenakan <strong>PSL / PSH</strong> atau <strong>Batik Nasional Lengan Panjang</strong>.
              </p>
            </div>

            {/* Panel 4 */}
            <div className="p-5 sm:p-6 rounded-xl bg-slate-50/70 border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-[#0F172A]">
                Akomodasi & Wisma
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Bagi delegasi perwira dari luar Garnisun Jakarta, panitia menyediakan fasilitas akomodasi di <strong>Wisma Soedirman</strong> dan <strong>Wisma Bahari</strong> yang dapat dipilih saat registrasi.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
