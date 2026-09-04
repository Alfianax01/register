import React, { useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MatraType } from '@/types';
import { getRanksByMatra } from '@/lib/constants/ranks';
import { getSatkersByMatra } from '@/lib/constants/units';
import { TniEmblem } from '@/components/emblems/TniEmblem';
import { Shield, Award, Briefcase, Building2 } from 'lucide-react';

interface StepMilitaryProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: Record<string, string>;
}

export const StepMilitaryInfo: React.FC<StepMilitaryProps> = ({ formData, setFormData, errors }) => {
  const currentMatra: MatraType = formData.matra || 'AD';

  const availableRanks = useMemo(() => {
    return getRanksByMatra(currentMatra);
  }, [currentMatra]);

  const availableSatkers = useMemo(() => {
    return getSatkersByMatra(currentMatra);
  }, [currentMatra]);

  const availableSatuans = useMemo(() => {
    const found = availableSatkers.find(s => s.name === formData.satker);
    return found ? found.satuans : [];
  }, [availableSatkers, formData.satker]);

  const handleMatraSelect = (matra: MatraType) => {
    const ranks = getRanksByMatra(matra);
    const satkers = getSatkersByMatra(matra);
    const firstSatker = satkers[0];

    setFormData((prev: any) => ({
      ...prev,
      matra,
      pangkat: ranks[0]?.name || '',
      satker: firstSatker?.name || '',
      satuan: firstSatker?.satuans[0] || '',
      nrp: matra === 'NON_TNI' ? (prev.nrp || 'NON-TNI') : prev.nrp
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'satker') {
      const satkerObj = availableSatkers.find(s => s.name === value);
      setFormData((prev: any) => ({
        ...prev,
        satker: value,
        satuan: satkerObj?.satuans[0] || ''
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const matraOptions: { type: MatraType; title: string; subtitle: string; border: string; bg: string }[] = [
    { type: 'AD', title: 'TNI AD', subtitle: 'Angkatan Darat', border: 'border-emerald-600', bg: 'bg-emerald-950/60' },
    { type: 'AL', title: 'TNI AL', subtitle: 'Angkatan Laut', border: 'border-blue-600', bg: 'bg-blue-950/60' },
    { type: 'AU', title: 'TNI AU', subtitle: 'Angkatan Udara', border: 'border-cyan-600', bg: 'bg-cyan-950/60' },
    { type: 'MABES', title: 'Mabes TNI', subtitle: 'Tri Dharma Eka Karma', border: 'border-amber-600', bg: 'bg-amber-950/60' },
    { type: 'NON_TNI', title: 'Non-TNI / Tamu', subtitle: 'Kemhan / Diplomatik / Sipil', border: 'border-slate-600', bg: 'bg-slate-900/60' },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[#1E3B2F] pb-3 mb-4">
        <h3 className="text-base font-serif font-bold text-slate-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#D4AF37]" />
          <span>Bagian 2: Data Kedinasan & Matra</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Pilihan matra secara otomatis memfilter daftar jenjang kepangkatan dan kesatuan resmi.
        </p>
      </div>

      {/* Matra Selection Grid */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
          Pilih Matra / Satuan Induk <span className="text-amber-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {matraOptions.map(item => {
            const isSelected = currentMatra === item.type;
            return (
              <button
                type="button"
                key={item.type}
                onClick={() => handleMatraSelect(item.type)}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                  isSelected
                    ? `${item.border} ${item.bg} ring-2 ring-[#D4AF37] shadow-lg shadow-black/60 scale-[1.02]`
                    : 'border-[#1E3B2F] bg-[#0C1A14]/80 hover:border-slate-500 opacity-75 hover:opacity-100'
                }`}
              >
                <TniEmblem matra={item.type} size="sm" className="mb-2" />
                <span className="text-xs font-bold text-slate-100 font-serif">{item.title}</span>
                <span className="text-[10px] text-slate-400 truncate max-w-full">{item.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* NRP & Pangkat (Dependent) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={currentMatra === 'NON_TNI' ? 'NIP / Nomor Identitas Pegawai / Paspor' : 'NRP (Nomor Registrasi Prajurit)'}
          name="nrp"
          required
          placeholder={currentMatra === 'NON_TNI' ? 'Contoh: 19850101... atau No. Paspor' : 'Contoh: 519284 / 1102941'}
          value={formData.nrp || ''}
          onChange={handleChange}
          error={errors.nrp}
          helperText="Format resmi 5-18 digit angka/huruf tanpa spasi."
          leftIcon={<Award className="w-4 h-4" />}
        />

        <Select
          label="Pangkat / Jenjang Jabatan"
          name="pangkat"
          required
          value={formData.pangkat || ''}
          onChange={handleChange}
          error={errors.pangkat}
          helperText="Daftar pangkat terfilter sesuai matra yang dipilih."
        >
          {availableRanks.map(r => (
            <option key={r.id} value={r.name} className="bg-[#0A1712] text-slate-100">
              {r.name} ({r.golongan})
            </option>
          ))}
        </Select>
      </div>

      {/* Jabatan */}
      <div>
        <Input
          label="Jabatan Struktural / Fungsional Saat Ini"
          name="jabatan"
          required
          placeholder="Contoh: Danjen Kopassus / Asops Kasal / Danskadron 3 / Atase Pertahanan"
          value={formData.jabatan || ''}
          onChange={handleChange}
          error={errors.jabatan}
          helperText="Tuliskan nama jabatan lengkap kedinasan Anda."
          leftIcon={<Briefcase className="w-4 h-4" />}
        />
      </div>

      {/* Satker & Satuan (Dependent Dropdown) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Satuan Kerja (Satker Induk)"
          name="satker"
          required
          value={formData.satker || ''}
          onChange={handleChange}
          error={errors.satker}
          helperText="Pilih kotama/satker induk."
        >
          {availableSatkers.map(s => (
            <option key={s.id} value={s.name} className="bg-[#0A1712] text-slate-100">
              {s.name}
            </option>
          ))}
        </Select>

        {availableSatuans.length > 0 ? (
          <Select
            label="Satuan Unit / Kesatuan Spesifik"
            name="satuan"
            required
            value={formData.satuan || ''}
            onChange={handleChange}
            error={errors.satuan}
            helperText="Unit spesifik di bawah satker terpilih."
          >
            {availableSatuans.map(u => (
              <option key={u} value={u} className="bg-[#0A1712] text-slate-100">
                {u}
              </option>
            ))}
          </Select>
        ) : (
          <Input
            label="Satuan Unit / Kesatuan Spesifik"
            name="satuan"
            required
            placeholder="Tuliskan nama satuan/unit kerja spesifik"
            value={formData.satuan || ''}
            onChange={handleChange}
            error={errors.satuan}
            leftIcon={<Building2 className="w-4 h-4" />}
          />
        )}
      </div>
    </div>
  );
};

