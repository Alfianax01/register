'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { MatraType } from '@/types';
import { getRanksByMatra } from '@/lib/constants/ranks';
import { getSatkersByMatra } from '@/lib/constants/units';
import { isValidNRP } from '@/lib/security/sanitizer';
import {
  User,
  Shield,
  Award,
  Briefcase,
  Building2,
  Phone,
  Mail,
  Bed,
  CheckCircle2,
  Eye,
  ArrowRight,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';

const DRAFT_STORAGE_KEY = 'tni_registration_draft';

interface ModernRegistrationFormProps {
  onSuccess?: (token: string, guest: any, fullData?: any) => void;
}

export const ModernRegistrationForm: React.FC<ModernRegistrationFormProps> = ({
  onSuccess
}) => {
  const router = useRouter();
  const { showToast } = useToast();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    gelar_depan: '',
    gelar_belakang: '',
    no_hp: '',
    email: '',
    negara_instansi: 'Indonesia / TNI - Kemhan RI',
    matra: 'AD' as MatraType,
    nrp: '',
    pangkat: 'Jenderal TNI',
    jabatan: '',
    satker: 'Mabes TNI AD (Jakarta Pusat)',
    satuan: 'Staf Umum Kasad',
    butuh_akomodasi: false,
    tgl_checkin: '2026-09-04',
    tgl_checkout: '2026-09-06',
    catatan_khusus: ''
  });

  // Hydrate draft from sessionStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedDraft = sessionStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed && typeof parsed === 'object') {
            setFormData(prev => ({
              ...prev,
              ...parsed
            }));
          }
        }
      }
    } catch (err) {
      console.warn('Gagal memuat draf formulir dari sessionStorage', err);
    }
  }, []);

  // Auto-save draft to sessionStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        if (formData.nama || formData.no_hp || formData.nrp || formData.jabatan) {
          sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
        }
      }
    } catch (err) {
      console.warn('Gagal menyimpan draf formulir ke sessionStorage', err);
    }
  }, [formData]);

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
    if (field === 'nama' && !val.trim()) err = 'Nama lengkap wajib diisi.';
    if (field === 'no_hp' && !val.trim()) err = 'Nomor WhatsApp / HP wajib diisi.';
    if (field === 'email') {
      if (val && typeof val === 'string' && val.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val.trim())) {
          err = 'Format alamat email tidak valid (contoh: nama@domain.com).';
        }
      }
    }
    if (field === 'nrp') {
      if (!val.trim()) {
        err = 'NRP / NIP wajib diisi.';
      } else if (formData.matra !== 'NON_TNI' && !isValidNRP(val)) {
        err = 'Format NRP tidak valid (5-18 karakter angka/huruf).';
      }
    }
    if (field === 'jabatan' && !val.trim()) err = 'Jabatan dinas wajib diisi.';

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
      nrp: matra === 'NON_TNI' ? (prev.nrp || 'NON-TNI') : prev.nrp
    }));
  };

  const validateAll = (): boolean => {
    const isNamaValid = validateField('nama', formData.nama);
    const isNrpValid = validateField('nrp', formData.nrp);
    const isJabatanValid = validateField('jabatan', formData.jabatan);
    const isPhoneValid = validateField('no_hp', formData.no_hp);
    const isEmailValid = validateField('email', formData.email);

    return isNamaValid && isNrpValid && isJabatanValid && isPhoneValid && isEmailValid;
  };

  const handleSubmit = async () => {
    if (!validateAll()) {
      showToast('Periksa Isian Formulir', {
        type: 'error',
        message: 'Mohon lengkapi kolom yang bertanda bintang sebelum mengirim.'
      });
      return;
    }

    setIsSubmitting(true);
    setIsPreviewOpen(false);

    try {
      // Checklist #7: Frontend Logging
      console.log("Payload Registrasi:", formData);

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      console.log("Response Registrasi:", data);

      if (!res.ok) {
        if (res.status === 409 && data.existingToken) {
          showToast('Prajurit Sudah Terdaftar', {
            type: 'info',
            message: data.error || 'Membuka E-Ticket yang sudah ada...'
          });
          onSuccess?.(data.existingToken, data.guest);
          return;
        }

        // Checklist #6: Real error message from backend
        showToast('Pendaftaran Gagal', {
          type: 'error',
          message: data.error || data.message || `Kode respon ${res.status}: Gagal memproses pendaftaran.`
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

      // Checklist #8: State persistence across sessions
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(DRAFT_STORAGE_KEY);
          sessionStorage.setItem('tni_registration_success', JSON.stringify({
            token: data.token,
            participant: data.participant || data.guest,
            qrCode: data.qrCode
          }));
          localStorage.setItem('tni_ticket_' + data.token, JSON.stringify(data.participant || data.guest));
          localStorage.setItem('latest_registered_token', data.token);
        }
      } catch (storageErr) {
        console.warn('Storage error:', storageErr);
      }

      if (formData.email && data.emailStatus === 'failed') {
        showToast('Registrasi Berhasil (Email Belum Terkirim)', {
          type: 'info',
          message: 'E-Ticket & QR Code resmi tersimpan, tetapi email belum terkirim karena SMTP belum dikonfigurasi di .env.local.'
        });
      } else if (formData.email && data.emailStatus === 'sent') {
        showToast('Registrasi & Email Terkirim', {
          type: 'success',
          message: 'E-Ticket resmi telah dikirim ke email Anda. Mengalihkan ke tiket...'
        });
      } else {
        showToast('Registrasi Berhasil', {
          type: 'success',
          message: 'E-Ticket & QR Code resmi telah diterbitkan. Mengalihkan ke tiket...'
        });
      }

      // Checklist #4: Automatic redirect to ticket page
      if (onSuccess) {
        onSuccess(data.token, data.guest, data);
      } else {
        router.push(`/ticket/${data.token}`);
      }

    } catch (err: any) {
      // Checklist #7: Error logging
      console.error("Submit Error:", err);
      showToast('Koneksi Terputus', {
        type: 'error',
        message: err?.message || 'Gagal menghubungi server. Periksa jaringan Anda.'
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
      className="w-full flex flex-col space-y-6"
    >
      {/* Step Pills Navigation (Linear Style) */}
      <nav aria-label="Tahap Pendaftaran" className="flex items-center gap-1 border-b border-slate-100 pb-3">
        {[
          { id: 1, label: 'Identitas Diri' },
          { id: 2, label: 'Data Dinas' },
          { id: 3, label: 'Akomodasi' }
        ].map((step) => {
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="font-mono text-slate-400 mr-1.5">{step.id}.</span>
              {step.label}
            </button>
          );
        })}
      </nav>

      {/* Step 1: Identitas Pribadi */}
      {activeStep === 1 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-3">
              <Input
                label="Gelar Depan"
                name="gelar_depan"
                placeholder="Dr. / Ir."
                value={formData.gelar_depan}
                onChange={handleInputChange}
              />
            </div>
            <div className="sm:col-span-6">
              <Input
                label="Nama Lengkap"
                name="nama"
                required
                placeholder="Nama prajurit / tamu..."
                value={formData.nama}
                onChange={handleInputChange}
                error={errors.nama}
                autoComplete="name"
              />
            </div>
            <div className="sm:col-span-3">
              <Input
                label="Gelar Belakang"
                name="gelar_belakang"
                placeholder="S.E., M.Si."
                value={formData.gelar_belakang}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="WhatsApp / Nomor HP"
              name="no_hp"
              type="tel"
              required
              placeholder="0812xxxxxxxx"
              value={formData.no_hp}
              onChange={handleInputChange}
              error={errors.no_hp}
              helperText="E-ticket digital akan dikirimkan ke nomor ini."
              leftIcon={<Phone className="w-3.5 h-3.5" />}
              autoComplete="tel"
            />

            <Input
              label="Alamat Email Dinas / Pribadi"
              name="email"
              type="email"
              placeholder="nama@tni.mil.id"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              helperText="E-Ticket resmi dan QR Code akan dikirim otomatis ke email ini."
              leftIcon={<Mail className="w-3.5 h-3.5" />}
              autoComplete="email"
            />
          </div>

          <div>
            <Input
              label="Asal Negara / Instansi"
              name="negara_instansi"
              placeholder="Indonesia / TNI - Kemhan RI"
              value={formData.negara_instansi}
              onChange={handleInputChange}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => {
                const isNamaValid = validateField('nama', formData.nama);
                const isPhoneValid = validateField('no_hp', formData.no_hp);
                const isEmailValid = validateField('email', formData.email);
                if (isNamaValid && isPhoneValid && isEmailValid) {
                  setActiveStep(2);
                } else {
                  showToast('Periksa Isian', {
                    type: 'error',
                    message: 'Mohon lengkapi data identitas dengan benar sebelum melanjutkan.'
                  });
                }
              }}
            >
              <span>Lanjut ke Data Dinas</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Data Kedinasan */}
      {activeStep === 2 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Matra Segmented Control */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 select-none">
              Pilih Matra / Kesatuan Induk <span className="text-blue-600 font-bold">*</span>
            </label>
            <div className="grid grid-cols-5 gap-1 sm:gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
              {(['AD', 'AL', 'AU', 'MABES', 'NON_TNI'] as MatraType[]).map((m) => {
                const labels: Record<string, string> = {
                  AD: 'TNI AD',
                  AL: 'TNI AL',
                  AU: 'TNI AU',
                  MABES: 'Mabes',
                  NON_TNI: 'Sipil'
                };
                const isSelected = formData.matra === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMatraChange(m)}
                    className={`py-2 px-0.5 sm:px-1 text-[11px] sm:text-xs font-medium rounded-md transition-all text-center truncate ${
                      isSelected
                        ? 'bg-white text-blue-700 font-semibold shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {labels[m]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label={formData.matra === 'NON_TNI' ? 'NIP / Nomor Identitas Pegawai' : 'NRP Prajurit'}
              name="nrp"
              required
              placeholder="Contoh: 519284 / 1102941"
              value={formData.nrp}
              onChange={handleInputChange}
              error={errors.nrp}
              helperText="Nomor registrasi prajurit resmi."
              leftIcon={<Award className="w-3.5 h-3.5" />}
            />

            <Select
              label="Pangkat / Golongan"
              name="pangkat"
              required
              value={formData.pangkat}
              onChange={handleInputChange}
            >
              {availableRanks.map(r => (
                <option key={r.id} value={r.name}>
                  {r.name} ({r.golongan})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Input
              label="Jabatan Kedinasan Saat Ini"
              name="jabatan"
              required
              placeholder="Contoh: Danjen Kopassus / Asops Kasal / Danskadron"
              value={formData.jabatan}
              onChange={handleInputChange}
              error={errors.jabatan}
              leftIcon={<Briefcase className="w-3.5 h-3.5" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              label="Satuan Kerja (Satker Induk)"
              name="satker"
              required
              value={formData.satker}
              onChange={(e) => {
                const val = e.target.value;
                const found = availableSatkers.find(s => s.name === val);
                setFormData(prev => ({ ...prev, satker: val, satuan: found?.satuans[0] || '' }));
              }}
            >
              {availableSatkers.map(s => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </Select>

            {availableSatuans.length > 0 ? (
              <Select
                label="Unit / Kesatuan Spesifik"
                name="satuan"
                required
                value={formData.satuan}
                onChange={handleInputChange}
              >
                {availableSatuans.map(u => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                label="Unit / Kesatuan Spesifik"
                name="satuan"
                required
                placeholder="Tuliskan nama unit kerja..."
                value={formData.satuan}
                onChange={handleInputChange}
              />
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setActiveStep(1)}
            >
              Kembali
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setActiveStep(3)}
            >
              <span>Lanjut ke Akomodasi</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Akomodasi & Review */}
      {activeStep === 3 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Accommodation Toggle */}
          <div
            onClick={() => setFormData(prev => ({ ...prev, butuh_akomodasi: !prev.butuh_akomodasi }))}
            className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 select-none ${
              formData.butuh_akomodasi
                ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border ${
              formData.butuh_akomodasi ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
            }`}>
              {formData.butuh_akomodasi && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">
                Memerlukan Fasilitas Penginapan (Wisma Mabes TNI)
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Alokasi kamar di Wisma Soedirman (VVIP), Wisma Kartika, atau Mess Perwira.
              </p>
            </div>
          </div>

          {formData.butuh_akomodasi && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 animate-in fade-in duration-150">
              <Input
                label="Tanggal Check-In"
                name="tgl_checkin"
                type="date"
                value={formData.tgl_checkin}
                onChange={handleInputChange}
              />
              <Input
                label="Tanggal Check-Out"
                name="tgl_checkout"
                type="date"
                value={formData.tgl_checkout}
                onChange={handleInputChange}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 select-none">
              Preferensi / Kebutuhan Khusus (Opsional)
            </label>
            <textarea
              name="catatan_khusus"
              rows={2}
              value={formData.catatan_khusus}
              onChange={handleInputChange}
              placeholder="Catatan alergi makanan jamuan, kebutuhan medis khusus..."
              className="block w-full rounded-lg bg-white text-slate-900 border border-slate-200 text-xs p-3 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 placeholder:text-slate-400"
            />
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setActiveStep(2)}
              className="w-full sm:w-auto"
            >
              Kembali
            </Button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  if (validateAll()) setIsPreviewOpen(true);
                  else {
                    showToast('Data Belum Lengkap', {
                      type: 'error',
                      message: 'Harap lengkapi nama, NRP, dan jabatan terlebih dahulu.'
                    });
                  }
                }}
                className="w-full sm:w-auto"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                <span>Preview Data</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                loadingText="Memproses Pendaftaran..."
                className="w-full sm:w-auto font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Kirim Registrasi</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal before Submit */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Konfirmasi Data Registrasi"
        description="Periksa kembali data Anda sebelum E-Ticket QR Code resmi diterbitkan."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-900 text-sm">
                {formData.gelar_depan ? `${formData.gelar_depan} ` : ''}
                {formData.nama}
                {formData.gelar_belakang ? `, ${formData.gelar_belakang}` : ''}
              </span>
              <Badge variant="primary">{formData.matra}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Pangkat / NRP</span>
                <span className="font-semibold text-slate-800">{formData.pangkat} &bull; {formData.nrp}</span>
              </div>
              <div>
                <span className="text-slate-400 block">WhatsApp</span>
                <span className="font-mono text-slate-800">{formData.no_hp}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Jabatan</span>
                <span className="text-slate-800">{formData.jabatan}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Satker & Kesatuan</span>
                <span className="text-slate-800">{formData.satuan} ({formData.satker})</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px]">
              <span className="text-slate-500">Penginapan Wisma:</span>
              <span className={formData.butuh_akomodasi ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                {formData.butuh_akomodasi ? `Ya (${formData.tgl_checkin} s/d ${formData.tgl_checkout})` : 'Tidak Menginap'}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsPreviewOpen(false)}
            >
              Perbaiki Data
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Memproses..."
            >
              <span>Konfirmasi & Terbitkan</span>
            </Button>
          </div>
        </div>
      </Modal>
    </form>
  );
};

