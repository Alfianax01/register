import React from 'react';
import { Input } from '@/components/ui/Input';
import { Bed, Calendar, FileText, CheckSquare, Square } from 'lucide-react';

interface StepAccommodationProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: Record<string, string>;
}

export const StepAccommodation: React.FC<StepAccommodationProps> = ({ formData, setFormData, errors }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const toggleAkomodasi = () => {
    setFormData((prev: any) => ({
      ...prev,
      butuh_akomodasi: !prev.butuh_akomodasi,
      tgl_checkin: !prev.butuh_akomodasi ? (prev.tgl_checkin || '2026-09-04') : prev.tgl_checkin,
      tgl_checkout: !prev.butuh_akomodasi ? (prev.tgl_checkout || '2026-09-06') : prev.tgl_checkout
    }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#1E3B2F] pb-3 mb-4">
        <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
          <Bed className="w-5 h-5 text-[#D4AF37]" />
          <span>Bagian 3: Fasilitas Akomodasi & Catatan Khusus</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Fasilitas wisma disediakan bagi perwira luar Jakarta dan tamu delegasi kenegaraan.
        </p>
      </div>

      {/* Accommodation Toggle Box */}
      <div
        onClick={toggleAkomodasi}
        className={`p-5 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
          formData.butuh_akomodasi
            ? 'bg-[#122A1E] border-[#D4AF37] ring-1 ring-[#D4AF37]'
            : 'bg-[#0E1F18] border-[#1D3B2F] hover:border-[#2D5845]'
        }`}
      >
        <div className="mt-0.5 text-[#D4AF37]">
          {formData.butuh_akomodasi ? (
            <CheckSquare className="w-6 h-6 text-[#D4AF37]" />
          ) : (
            <Square className="w-6 h-6 text-slate-500" />
          )}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-100 font-serif">
            Memerlukan Tempat Menginap (Wisma / Mess Mabes TNI)
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Centang jika Anda memerlukan alokasi kamar di Wisma Soedirman (VVIP/VIP), Wisma Kartika (Pamen), atau Mess Perwira Mabes TNI Cilangkap selama rangkaian acara berlangsung.
          </p>
        </div>
      </div>

      {/* If checked, show dates */}
      {formData.butuh_akomodasi && (
        <div className="p-5 rounded-xl bg-[#0B1A13] border border-[#1E3B2F] space-y-4 animate-in fade-in duration-200">
          <h5 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Jadwal Penginapan</span>
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tanggal Check-In"
              name="tgl_checkin"
              type="date"
              value={formData.tgl_checkin || '2026-09-04'}
              onChange={handleChange}
              min="2026-09-01"
              max="2026-09-10"
              helperText="Waktu check-in wisma dibuka mulai pukul 13.00 WIB."
            />
            <Input
              label="Tanggal Check-Out"
              name="tgl_checkout"
              type="date"
              value={formData.tgl_checkout || '2026-09-06'}
              onChange={handleChange}
              min="2026-09-04"
              max="2026-09-10"
              helperText="Waktu check-out wisma paling lambat pukul 12.00 WIB."
            />
          </div>
        </div>
      )}

      {/* Special Medical / Dietary Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#D4AF37]" />
          <span>Preferensi / Catatan Khusus (Opsional)</span>
        </label>
        <textarea
          name="catatan_khusus"
          rows={3}
          value={formData.catatan_khusus || ''}
          onChange={handleChange}
          placeholder="Tuliskan jika memiliki kebutuhan medis khusus, alergi makanan untuk jamuan, atau kebutuhan pendampingan disabilitas..."
          className="block w-full rounded-lg bg-[#0F221A] text-slate-100 border border-[#1E3B2F] text-sm p-3.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent placeholder:text-slate-500"
        />
        <p className="mt-1 text-[11px] text-slate-400">
          Informasi ini akan diteruskan ke Tim Medis Puskes TNI dan Panitia Konsumsi.
        </p>
      </div>
    </div>
  );
};

