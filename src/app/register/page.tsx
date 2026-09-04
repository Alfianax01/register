'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationProgress } from '@/components/register/RegistrationProgress';
import { StepPersonalInfo } from '@/components/register/StepPersonalInfo';
import { StepMilitaryInfo } from '@/components/register/StepMilitaryInfo';
import { StepAccommodation } from '@/components/register/StepAccommodation';
import { StepConfirmation } from '@/components/register/StepConfirmation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TniEmblem } from '@/components/emblems/TniEmblem';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const STEPS = [
  { title: 'Identitas', subtitle: 'Nama & Kontak' },
  { title: 'Kedinasan', subtitle: 'Matra & Pangkat' },
  { title: 'Akomodasi', subtitle: 'Wisma Inap' },
  { title: 'Konfirmasi', subtitle: 'Penerbitan QR' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Captcha state
  const [captchaNum1, setCaptchaNum1] = useState(7);
  const [captchaNum2, setCaptchaNum2] = useState(5);
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    gelar_depan: '',
    gelar_belakang: '',
    no_hp: '',
    email: '',
    negara_instansi: 'Indonesia / TNI - Kemhan RI',
    matra: 'AD',
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

  useEffect(() => {
    // Generate random simple math question
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 8) + 2;
    setCaptchaNum1(n1);
    setCaptchaNum2(n2);
  }, []);

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!formData.nama.trim()) errs.nama = 'Nama lengkap wajib diisi';
      if (!formData.no_hp.trim()) errs.no_hp = 'Nomor WhatsApp / HP wajib diisi';
    } else if (step === 2) {
      if (!formData.nrp.trim()) errs.nrp = 'NRP / Nomor Identitas wajib diisi';
      if (!formData.pangkat.trim()) errs.pangkat = 'Pangkat wajib dipilih';
      if (!formData.jabatan.trim()) errs.jabatan = 'Jabatan wajib diisi';
      if (!formData.satker.trim()) errs.satker = 'Satker wajib dipilih';
    } else if (step === 4) {
      const expected = captchaNum1 + captchaNum2;
      if (parseInt(captchaAnswer.trim(), 10) !== expected) {
        errs.captcha = 'Jawaban verifikasi tidak tepat';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setApiError('');
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setApiError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          captcha_answer: captchaAnswer,
          captcha_expected: captchaNum1 + captchaNum2
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.existingToken) {
          // Already registered, redirect to their ticket
          router.push(`/ticket/${data.existingToken}`);
          return;
        }
        setApiError(data.error || 'Gagal mengirim pendaftaran.');
        setIsSubmitting(false);
        return;
      }

      // Confetti feedback
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      // Redirect to personal E-Ticket page
      router.push(`/ticket/${data.token}`);

    } catch (err: any) {
      setApiError('Koneksi terganggu. Silakan periksa jaringan Anda dan coba lagi.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center mb-3">
          <TniEmblem matra="MABES" size="lg" />
        </div>
        <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-widest block mb-1">
          FORMULIR ELEKTRONIK RESMI
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-100">
          Registrasi Kehadiran Peserta RAPIM TNI 2026
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
          Silakan lengkapi data kedinasan untuk penerbitan E-Ticket QR Code dan alokasi tempat duduk acara.
        </p>
      </div>

      {/* Stepper Card */}
      <Card variant="gold-border" className="p-6 sm:p-8">
        <RegistrationProgress currentStep={currentStep} totalSteps={STEPS.length} steps={STEPS} />

        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-600 text-red-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={currentStep === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
          {currentStep === 1 && (
            <StepPersonalInfo formData={formData} setFormData={setFormData} errors={errors} />
          )}

          {currentStep === 2 && (
            <StepMilitaryInfo formData={formData} setFormData={setFormData} errors={errors} />
          )}

          {currentStep === 3 && (
            <StepAccommodation formData={formData} setFormData={setFormData} errors={errors} />
          )}

          {currentStep === 4 && (
            <StepConfirmation
              formData={formData}
              captchaQuestion={`Berapa ${captchaNum1} + ${captchaNum2} = ?`}
              captchaAnswer={captchaAnswer}
              setCaptchaAnswer={setCaptchaAnswer}
              errors={errors}
            />
          )}

          {/* Form Actions (Previous & Next/Submit) */}
          <div className="mt-8 pt-6 border-t border-[#1E3B2F] flex items-center justify-between">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={isSubmitting}
                className="text-xs"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>Sebelumnya</span>
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <Button
                type="button"
                variant="gold"
                onClick={handleNext}
                className="text-xs"
              >
                <span>Lanjutkan</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="gold"
                size="lg"
                isLoading={isSubmitting}
                className="text-xs px-6 shadow-xl"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Kirim Pendaftaran & Terbitkan E-Ticket</span>
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

