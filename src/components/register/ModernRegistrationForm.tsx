'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { MatraType } from '@/types';
import { getRanksByMatra } from '@/lib/constants/ranks';
import { getSatkersByMatra } from '@/lib/constants/units';
import { isValidNRP, isValidPhone } from '@/lib/security/sanitizer';
import {
  User,
  Shield,
  Briefcase,
  Building2,
  Phone,
  Mail,
  CheckCircle2,
  Eye,
  ArrowRight,
  Loader2,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';

const DRAFT_STORAGE_KEY = 'tni_registration_draft';

const INITIAL_FORM_DATA = {
  nama: '',
  no_hp: '',
  email: '',
  negara_instansi: 'Indonesia / TNI - Kemhan RI',
  matra: 'AD' as MatraType,
  nrp: '',
  pangkat: 'Jenderal TNI',
  jabatan: '',
  satker: 'Mabes TNI AD (Jakarta Pusat)',
  satuan: 'Staf Umum Kasad'
};

interface ModernRegistrationFormProps {
  onSuccess?: (token: string, guest: any, fullData?: any) => void;
}

export const ModernRegistrationForm: React.FC<ModernRegistrationFormProps> = ({
  onSuccess
}) => {
  const router = useRouter();
  const { showToast } = useToast();

  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State: Always starts clean
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // Clear any residual session draft on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch {}
  }, []);

  const availableRanks = useMemo(() => {
    return getRanksByMatra(formData.matra);
  }, [formData.matra]);

  const availableSatkers = useMemo(() => {
    return getSatkersByMatra(formData.matra);
  }, [formData.matra]);

  const availableSatuans = useMemo(() => {
    const found = availableSatkers.find(s => s.name === formData.satker);
    return found ? found.satuans : [];
  }, [availableSatkers, formData.satker]);

  // Realtime field validation
  const validateField = (field: string, val: any) => {
    let err = '';
    if (field === 'nama') {
      if (!val.trim()) {
        err = 'Nama lengkap wajib diisi.';
      } else if (val.trim().length > 150) {
        err = 'Nama lengkap tidak boleh melebihi 150 karakter.';
      }
    }

    if (field === 'email') {
      if (!val.trim()) {
        err = 'Alamat email wajib diisi untuk penerbitan e-ticket.';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val.trim())) {
          err = 'Format alamat email tidak valid (contoh: nama@domain.com).';
        }
      }
    }

    if (field === 'no_hp' && val.trim()) {
      if (!isValidPhone(val.trim())) {
        err = 'Format nomor HP tidak valid (contoh: 0812xxxxxxxx atau 62812xxxxxxxx).';
      }
    }

    if (field === 'nrp') {
      if (!val.trim()) {
        err = 'NRP / NIP wajib diisi.';
      } else if (formData.matra !== 'NON_TNI' && !isValidNRP(val)) {
        err = 'Format NRP tidak valid (5-20 karakter alfanumerik).';
      }
    }

    if (field === 'jabatan' && !val.trim()) {
      err = 'Jabatan dinas wajib diisi.';
    }

    setErrors(prev => {
      const next = { ...prev };
      if (err) next[field] = err;
      else delete next[field];
      return next;
    });

    return !err;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleMatraChange = (matra: MatraType) => {
    const ranks = getRanksByMatra(matra);
    const satkers = getSatkersByMatra(matra);
    const firstSatker = satkers[0];

    setFormData(prev => ({
      ...prev,
      matra,
      pangkat: ranks[0]?.name || '',
      satker: firstSatker?.name || '',
      satuan: firstSatker?.satuans[0] || '',
      nrp: matra === 'NON_TNI' ? (prev.nrp === 'NON-TNI' ? '' : prev.nrp) : (prev.nrp === 'NON-TNI' ? '' : prev.nrp)
    }));
  };

  const validateAll = (): boolean => {
    const isNamaValid = validateField('nama', formData.nama);
    const isEmailValid = validateField('email', formData.email);
    const isPhoneValid = validateField('no_hp', formData.no_hp);
    const isNrpValid = validateField('nrp', formData.nrp);
    const isJabatanValid = validateField('jabatan', formData.jabatan);

    return isNamaValid && isEmailValid && isPhoneValid && isNrpValid && isJabatanValid;
  };

  const handleSubmit = async () => {
    if (!validateAll()) {
      showToast('Periksa Isian Formulir', {
        type: 'error',
        message: 'Mohon lengkapi seluruh kolom wajib bertanda bintang sebelum mengirim pendaftaran.'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        nama: formData.nama.trim(),
        no_hp: formData.no_hp ? formData.no_hp.trim() : undefined,
        email: formData.email.trim(),
        negara_instansi: formData.negara_instansi.trim(),
        matra: formData.matra,
        pangkat: formData.pangkat.trim(),
        nrp: formData.nrp.trim(),
        jabatan: formData.jabatan.trim(),
        satker: formData.satker.trim(),
        satuan: formData.satuan.trim()
      };

      console.log('Frontend Submit Payload:', payload);

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store'
      });

      const data = await res.json();
      console.log('Response Registrasi:', data);

      if (!res.ok) {
        showToast('Pendaftaran Ditolak', {
          type: 'error',
          message: data.error || data.message || `Gagal memproses pendaftaran (Kode ${res.status}).`
        });
        setIsSubmitting(false);
        return;
      }

      // Success
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {}

      // Reset form
      setFormData(INITIAL_FORM_DATA);
      setErrors({});
      setIsPreviewOpen(false);

      if (payload.email && data.emailStatus === 'sent') {
        showToast('Registrasi Berhasil & Email Terkirim', {
          type: 'success',
          message: 'E-Ticket resmi telah dikirimkan ke alamat email Anda.'
        });
      } else {
        showToast('Registrasi Berhasil', {
          type: 'success',
          message: 'E-Ticket & QR Code pendaftaran Anda telah aktif. Mengalihkan...'
        });
      }

      // Redirect
      if (onSuccess) {
        onSuccess(data.token, data.guest, data);
      } else {
        router.push(`/ticket/${data.token}`);
      }

    } catch (err: any) {
      console.error('Submit Error:', err);
      showToast('Koneksi Terputus', {
        type: 'error',
        message: err?.message || 'Gagal menghubungi server database. Periksa jaringan Anda.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="w-full space-y-8"
    >
      {/* SECTION 1: DATA PRIBADI */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Bagian 1: Data Pribadi & Kontak
            </h2>
            <p className="text-xs text-slate-500">
              Identitas diri dan kontak resmi peserta untuk penerbitan E-Ticket
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nama Lengkap */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <Input
              name="nama"
              value={formData.nama}
              onChange={handleInputChange}
              maxLength={150}
              placeholder="Contoh: Jenderal TNI Agus Subiyanto, S.E., M.Si."
              required
              className="text-xs sm:text-sm"
            />
            {errors.nama ? (
              <p className="text-[11px] text-rose-600 mt-1">{errors.nama}</p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">
                Tuliskan nama lengkap beserta gelar jika ada (maksimal 150 karakter).
              </p>
            )}
          </div>

          {/* Nomor WhatsApp (Opsional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Nomor WhatsApp (Opsional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                name="no_hp"
                value={formData.no_hp}
                onChange={handleInputChange}
                placeholder="Contoh: 08123456789"
                className="pl-9 text-xs sm:text-sm"
              />
            </div>
            {errors.no_hp ? (
              <p className="text-[11px] text-rose-600 mt-1">{errors.no_hp}</p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">
                Diisi jika ingin menerima notifikasi e-ticket via WhatsApp.
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Alamat Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="nama@tni.mil.id atau email dinas"
                required
                className="pl-9 text-xs sm:text-sm"
              />
            </div>
            {errors.email ? (
              <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">
                Alamat email aktif untuk pengiriman berkas E-Ticket PDF resmi.
              </p>
            )}
          </div>

          {/* Asal Negara / Instansi */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Asal Negara / Instansi Induk
            </label>
            <Input
              name="negara_instansi"
              value={formData.negara_instansi}
              onChange={handleInputChange}
              placeholder="Indonesia / TNI - Kemhan RI"
              className="text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: DATA KEDINASAN */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Bagian 2: Data Kedinasan & Penugasan
            </h2>
            <p className="text-xs text-slate-500">
              Kualifikasi kepangkatan militer dan penempatan satuan dinas peserta
            </p>
          </div>
        </div>

        {/* Matra Selector Pills */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-2">
            Matra / Kategori Kedinasan <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { code: 'AD' as MatraType, label: 'TNI AD', color: 'bg-[#1F7A3E]' },
              { code: 'AL' as MatraType, label: 'TNI AL', color: 'bg-[#475569]' },
              { code: 'AU' as MatraType, label: 'TNI AU', color: 'bg-[#2563EB]' },
              { code: 'MABES' as MatraType, label: 'Mabes TNI', color: 'bg-slate-800' },
              { code: 'NON_TNI' as MatraType, label: 'Sipil / Non-TNI', color: 'bg-slate-600' }
            ].map(m => {
              const isSelected = formData.matra === m.code;
              return (
                <button
                  key={m.code}
                  type="button"
                  onClick={() => handleMatraChange(m.code)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    isSelected
                      ? `${m.color} text-white border-transparent shadow-sm ring-2 ring-offset-1 ring-blue-500`
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pangkat */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Pangkat / Golongan <span className="text-rose-500">*</span>
            </label>
            <select
              name="pangkat"
              value={formData.pangkat}
              onChange={handleInputChange}
              aria-label="Pilih Pangkat atau Golongan"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              {availableRanks.map(r => (
                <option key={r.id} value={r.name}>
                  {r.name} ({r.golongan})
                </option>
              ))}
            </select>
          </div>

          {/* NRP / NIP */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              NRP / NIP <span className="text-rose-500">*</span>
            </label>
            <Input
              name="nrp"
              value={formData.nrp}
              onChange={handleInputChange}
              placeholder={formData.matra === 'NON_TNI' ? 'Nomor NIP atau tanda pengenal' : 'Nomor Registrasi Pokok (NRP)'}
              required
              className="text-xs sm:text-sm font-mono"
            />
            {errors.nrp ? (
              <p className="text-[11px] text-rose-600 mt-1">{errors.nrp}</p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">
                {formData.matra === 'NON_TNI' ? 'Gunakan tanda strip (-) jika tidak memiliki NIP' : 'Wajib 5-20 digit angka resmi prajurit'}
              </p>
            )}
          </div>

          {/* Jabatan */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Jabatan Kedinasan <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                name="jabatan"
                value={formData.jabatan}
                onChange={handleInputChange}
                placeholder="Contoh: Panglima Kodam / Asops Kasad / Pejabat Tinggi"
                required
                className="pl-9 text-xs sm:text-sm"
              />
            </div>
            {errors.jabatan && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.jabatan}</p>
            )}
          </div>

          {/* Satker */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Satuan Kerja (Satker) <span className="text-rose-500">*</span>
            </label>
            <select
              name="satker"
              value={formData.satker}
              onChange={(e) => {
                const newSatker = e.target.value;
                const found = availableSatkers.find(s => s.name === newSatker);
                setFormData(prev => ({
                  ...prev,
                  satker: newSatker,
                  satuan: found?.satuans[0] || ''
                }));
              }}
              aria-label="Pilih Satuan Kerja"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              {availableSatkers.map(s => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-Satuan */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Sub-Satuan / Detasemen
            </label>
            <select
              name="satuan"
              value={formData.satuan}
              onChange={handleInputChange}
              aria-label="Pilih Sub-Satuan atau Detasemen"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              {availableSatuans.map(sub => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => {
            if (validateAll()) {
              setIsPreviewOpen(true);
            } else {
              showToast('Periksa Isian', {
                type: 'error',
                message: 'Mohon lengkapi kolom wajib sebelum membuka pratinjau.'
              });
            }
          }}
          className="w-full sm:w-auto gap-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border-slate-300 hover:bg-slate-50"
        >
          <Eye className="w-4 h-4" />
          <span>Pratinjau Data</span>
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className="w-full sm:w-auto gap-2 text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses Pendaftaran...</span>
            </>
          ) : (
            <>
              <span>Kirim Pendaftaran</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {/* MODAL PRATINJAU DATA */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Pratinjau Data Pendaftaran"
        description="Periksa kembali identitas dan data kedinasan Anda sebelum dikirimkan ke panitia."
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
              Data Pribadi
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block">Nama Lengkap:</span>
                <span className="font-bold text-slate-900">{formData.nama || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">WhatsApp / HP:</span>
                <span className="font-mono text-slate-900">{formData.no_hp || '(Tidak diisi)'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Alamat Email:</span>
                <span className="font-mono text-slate-900">{formData.email || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Instansi / Negara:</span>
                <span className="text-slate-900">{formData.negara_instansi || '-'}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
              Data Kedinasan
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block">Matra Dinas:</span>
                <span className="font-bold text-slate-900">{formData.matra}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Pangkat / Golongan:</span>
                <span className="font-semibold text-slate-900">{formData.pangkat}</span>
              </div>
              <div>
                <span className="text-slate-500 block">NRP / NIP:</span>
                <span className="font-mono font-semibold text-slate-900">{formData.nrp || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Jabatan Dinas:</span>
                <span className="font-semibold text-slate-900">{formData.jabatan || '-'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Satuan Kerja / Detasemen:</span>
                <span className="text-slate-900">{formData.satker} &bull; {formData.satuan}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-[11px] leading-relaxed">
            <p>
              <strong>Informasi Alokasi:</strong> Penempatan kursi pleno dan wisma akomodasi resmi akan dialokasikan secara otomatis berdasarkan hierarki kepangkatan dinas setelah pemindaian QR Code di lokasi gerbang masuk (*Check-In Gate*).
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setIsPreviewOpen(false)}
            >
              Kembali & Sunting
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              onClick={() => {
                setIsPreviewOpen(false);
                handleSubmit();
              }}
              className="gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Konfirmasi & Kirim</span>
            </Button>
          </div>
        </div>
      </Modal>
    </form>
  );
};
