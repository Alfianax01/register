import React from 'react';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getMatraBadgeInfo } from '@/lib/utils/formatters';
import { ShieldCheck, CheckCircle2, Lock, FileCheck } from 'lucide-react';

interface StepConfirmationProps {
  formData: any;
  captchaQuestion: string;
  captchaAnswer: string;
  setCaptchaAnswer: (ans: string) => void;
  errors: Record<string, string>;
}

export const StepConfirmation: React.FC<StepConfirmationProps> = ({
  formData,
  captchaQuestion,
  captchaAnswer,
  setCaptchaAnswer,
  errors
}) => {
  const matraInfo = getMatraBadgeInfo(formData.matra || 'AD');

  return (
    <div className="space-y-6">
      <div className="border-b border-[#1E3B2F] pb-3 mb-4">
        <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-[#D4AF37]" />
          <span>Bagian 4: Verifikasi & Konfirmasi Akhir</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Pastikan seluruh data kedinasan Anda sudah benar sebelum diterbitkan E-Ticket resmi.
        </p>
      </div>

      {/* Summary Review Card */}
      <div className="rounded-xl bg-[#0B1A13] border border-[#D4AF37]/40 p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#1A382A] pb-3">
          <div>
            <span className="text-[10px] text-[#D4AF37] font-semibold tracking-wider uppercase">
              KARTU IDENTITAS PESERTA
            </span>
            <h4 className="text-lg font-serif font-bold text-slate-100">
              {formData.gelar_depan ? `${formData.gelar_depan} ` : ''}
              {formData.nama}
              {formData.gelar_belakang ? `, ${formData.gelar_belakang}` : ''}
            </h4>
          </div>
          <Badge variant={formData.matra === 'AD' ? 'ad' : formData.matra === 'AL' ? 'al' : formData.matra === 'AU' ? 'au' : 'gold'}>
            {matraInfo.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">NRP / NIP</span>
            <span className="font-mono font-bold text-slate-200">{formData.nrp || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Pangkat</span>
            <span className="font-semibold text-slate-200">{formData.pangkat || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Jabatan</span>
            <span className="font-semibold text-slate-200">{formData.jabatan || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Satuan Kerja</span>
            <span className="font-semibold text-slate-200">{formData.satker || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Kesatuan</span>
            <span className="font-semibold text-slate-200">{formData.satuan || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">WhatsApp</span>
            <span className="font-mono text-slate-200">{formData.no_hp || '-'}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#1A382A] flex items-center justify-between text-xs">
          <span className="text-slate-400">Fasilitas Wisma Inap:</span>
          <span className={formData.butuh_akomodasi ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
            {formData.butuh_akomodasi
              ? `Ya (${formData.tgl_checkin} s/d ${formData.tgl_checkout})`
              : 'Tidak Menginap'}
          </span>
        </div>
      </div>

      {/* Security Captcha (Anti-Bot OWASP 9.2) */}
      <div className="p-4 rounded-xl bg-[#0F221A] border border-[#1E3B2F] space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
          <Lock className="w-4 h-4" />
          <span>Verifikasi Keamanan (Anti-Spam Bot)</span>
        </div>
        <p className="text-xs text-slate-300">
          Selesaikan perhitungan matematika sederhana berikut untuk membuktikan Anda bukan bot:
        </p>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-[#070E0B] border border-[#D4AF37]/50 font-mono text-base font-bold text-[#F5E296] select-none">
            {captchaQuestion}
          </div>
          <div className="w-36">
            <Input
              type="text"
              placeholder="Jawaban..."
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              error={errors.captcha}
              required
            />
          </div>
        </div>
      </div>

      {/* Official Disclaimer */}
      <div className="flex items-start gap-2.5 text-[11px] text-slate-400 bg-[#070F0B] p-3.5 rounded-lg border border-[#142B20]">
        <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p>
          Dengan menekan tombol <strong className="text-slate-200">Kirim Pendaftaran</strong>, saya menyatakan data yang diisikan adalah benar dan bersedia mematuhi tata tertib protokol kenegaraan selama rangkaian Rapat Pimpinan TNI 2026.
        </p>
      </div>
    </div>
  );
};

