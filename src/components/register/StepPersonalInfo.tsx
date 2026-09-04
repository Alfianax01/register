import React from 'react';
import { Input } from '@/components/ui/Input';
import { User, Phone, Mail, Globe } from 'lucide-react';

interface StepPersonalProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: Record<string, string>;
}

export const StepPersonalInfo: React.FC<StepPersonalProps> = ({ formData, setFormData, errors }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#1E3B2F] pb-3 mb-4">
        <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
          <User className="w-5 h-5 text-[#D4AF37]" />
          <span>Bagian 1: Identitas Tamu Undangan</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Data ini akan dicetak pada ID Card / E-Ticket resmi dan daftar hadir acara.
        </p>
      </div>

      {/* Row: Gelar Depan, Nama Lengkap, Gelar Belakang */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-3">
          <Input
            label="Gelar Depan"
            name="gelar_depan"
            placeholder="Contoh: Dr. / Ir."
            value={formData.gelar_depan || ''}
            onChange={handleChange}
          />
        </div>
        <div className="md:col-span-6">
          <Input
            label="Nama Lengkap"
            name="nama"
            required
            placeholder="Contoh: Agus Subiyanto"
            value={formData.nama || ''}
            onChange={handleChange}
            error={errors.nama}
            autoComplete="name"
          />
        </div>
        <div className="md:col-span-3">
          <Input
            label="Gelar Belakang"
            name="gelar_belakang"
            placeholder="Contoh: S.E., M.Si."
            value={formData.gelar_belakang || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Row: No HP & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nomor WhatsApp / HP Aktif"
          name="no_hp"
          required
          type="tel"
          placeholder="0812xxxxxxxx / +62812xxxxxxxx"
          value={formData.no_hp || ''}
          onChange={handleChange}
          error={errors.no_hp}
          helperText="E-ticket dan notifikasi lokasi kursi akan dikirimkan ke nomor ini."
          leftIcon={<Phone className="w-4 h-4" />}
          autoComplete="tel"
        />

        <Input
          label="Alamat Email Kedinasan / Pribadi"
          name="email"
          type="email"
          placeholder="nama@tni.mil.id / email@domain.com"
          value={formData.email || ''}
          onChange={handleChange}
          error={errors.email}
          helperText="Opsional, untuk salinan digital surat undangan & kartu peserta."
          leftIcon={<Mail className="w-4 h-4" />}
          autoComplete="email"
        />
      </div>

      {/* Row: Negara / Asal Instansi */}
      <div>
        <Input
          label="Negara / Instansi Asal"
          name="negara_instansi"
          placeholder="Contoh: Indonesia / Mabes TNI / Kedubes AS"
          value={formData.negara_instansi || 'Indonesia / TNI - Kemhan RI'}
          onChange={handleChange}
          helperText="Default bagi prajurit TNI adalah Indonesia / TNI - Kemhan RI. Tamu asing dapat menuliskan nama negara/kedubes."
          leftIcon={<Globe className="w-4 h-4" />}
        />
      </div>
    </div>
  );
};

