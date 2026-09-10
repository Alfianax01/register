'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import {
  Globe,
  FileText,
  Save,
  RotateCw,
  ExternalLink,
  Sparkles,
  Building,
  Images,
  Shield
} from 'lucide-react';
import { TniEmblem } from '@/components/emblems/TniEmblem';
import { SiteSettings, DEFAULT_SITE_SETTINGS } from '@/types/settings';

export default function WebsiteCMSPage() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'landing' | 'labels' | 'media'>('landing');
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, meRes] = await Promise.all([
        fetch('/api/settings/website'),
        fetch('/api/auth/me')
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.settings) {
          setSettings({
            ...DEFAULT_SITE_SETTINGS,
            ...data.settings
          });
        }
      }

      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.user);
      }
    } catch {
      showToast('Gagal memuat pengaturan website', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SiteSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
        showToast('✓ Pengaturan website berhasil disimpan ke sistem', { type: 'success' });
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Gagal menyimpan pengaturan', { type: 'error' });
      }
    } catch {
      showToast('Gagal menghubungi server database', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('Kembalikan semua nilai ke pengaturan awal standar TNI?')) {
      setSettings(DEFAULT_SITE_SETTINGS);
      showToast('Pengaturan telah direset ke default standar (klik Simpan untuk menerapkan)', { type: 'info' });
    }
  };

  const tabs: { key: 'landing' | 'labels' | 'media'; label: string; icon: React.ReactNode }[] = [
    { key: 'landing', label: 'Landing Page & Branding', icon: <Globe className="w-4 h-4 text-blue-600" /> },
    { key: 'labels', label: 'Label Form Registrasi', icon: <FileText className="w-4 h-4 text-emerald-600" /> },
    { key: 'media', label: 'Media & Aset Gambar', icon: <Images className="w-4 h-4 text-violet-600" /> },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
      <AdminHeader
        title="Manajemen Konten & Website"
        subtitle="Kelola branding landing page, informasi kegiatan, media aset gambar, dan penyesuaian label formulir pendaftaran."
        user={currentUser}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          {/* Tab Selection */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-lg flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-blue-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span>Lihat Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefault}
              disabled={loading || saving}
              className="text-xs text-slate-600 border-slate-200 hover:bg-slate-50"
            >
              Reset Default
            </Button>

            <Button
              size="sm"
              onClick={() => handleSave()}
              disabled={loading || saving}
              className="gap-1.5 text-xs bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-xs"
            >
              {saving ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </Button>
          </div>
        </div>

        {/* Tab Content Form */}
        <form onSubmit={handleSave} className="space-y-6">

          {/* ================================================================
              TAB: Landing Page & Branding
              ================================================================ */}
          {activeTab === 'landing' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Hero Section & Judul */}
              <Card className="p-5 sm:p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Hero Section & Judul</h2>
                    <p className="text-xs text-slate-500">Teks utama yang dilihat publik pada halaman pembuka</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Judul Utama Acara (Hero Title)
                    </label>
                    <input
                      type="text"
                      value={settings.hero_title}
                      onChange={(e) => handleInputChange('hero_title', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder="Contoh: Rapat Pimpinan TNI Tahun 2026"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Deskripsi / Subtitle Hero
                    </label>
                    <textarea
                      rows={3}
                      value={settings.hero_subtitle}
                      onChange={(e) => handleInputChange('hero_subtitle', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder="Deskripsi singkat mengenai sistem registrasi resmi..."
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Tema Resmi Acara (Event Theme)
                    </label>
                    <input
                      type="text"
                      value={settings.event_theme}
                      onChange={(e) => handleInputChange('event_theme', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder="Contoh: TNI Modern, Tangguh, dan Adaptif..."
                    />
                  </div>
                </div>
              </Card>

              {/* Card 2: Jadwal, Lokasi & Info Acara */}
              <Card className="p-5 sm:p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Jadwal & Lokasi Acara</h2>
                    <p className="text-xs text-slate-500">Parameter pelaksanaan yang tampil di landing page</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Lokasi Pelaksanaan (Venue)
                    </label>
                    <input
                      type="text"
                      value={settings.event_location}
                      onChange={(e) => handleInputChange('event_location', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder="Gedung Ahmad Yani, Mabes TNI Cilangkap"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Tanggal Pelaksanaan
                    </label>
                    <input
                      type="text"
                      value={settings.event_date}
                      onChange={(e) => handleInputChange('event_date', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder="4 – 5 September 2026"
                    />
                  </div>

                  {/* Logo Navbar quick upload */}
                  <div className="pt-2 border-t border-slate-100">
                    <ImageUploadField
                      label="Logo Navbar (Quick Upload)"
                      value={settings.navbar_logo}
                      onChange={(val) => handleInputChange('navbar_logo', val)}
                      maxInputSizeKB={500}
                      hint="Tampil di pojok kiri navbar publik. Maks 500KB."
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ================================================================
              TAB: Label Form Registrasi
              ================================================================ */}
          {activeTab === 'labels' && (
            <Card className="p-5 sm:p-6 bg-white border border-slate-200 rounded-xl space-y-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Kustomisasi Label Formulir Pendaftaran</h2>
                  <p className="text-xs text-slate-500">Sesuaikan judul atau keterangan teks yang tampil di formulir publik</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {[
                  { field: 'label_nama' as keyof SiteSettings, label: 'Label Nama Lengkap' },
                  { field: 'label_matra' as keyof SiteSettings, label: 'Label Matra / Kategori' },
                  { field: 'label_pangkat' as keyof SiteSettings, label: 'Label Pangkat Kedinasan' },
                  { field: 'label_nrp' as keyof SiteSettings, label: 'Label NRP / NIP' },
                  { field: 'label_jabatan' as keyof SiteSettings, label: 'Label Jabatan Kedinasan' },
                  { field: 'label_satker' as keyof SiteSettings, label: 'Label Satker / Kesatuan Asal' },
                  { field: 'label_email' as keyof SiteSettings, label: 'Label Alamat Email' },
                  { field: 'label_phone' as keyof SiteSettings, label: 'Label Nomor WhatsApp / HP' },
                ].map(({ field, label }) => (
                  <div key={field}>
                    <label className="font-semibold text-slate-700 block mb-1">{label}</label>
                    <input
                      type="text"
                      value={settings[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                ))}

                <div className="md:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Label Kebutuhan Penginapan (Mess / Wisma)
                  </label>
                  <input
                    type="text"
                    value={settings.label_akomodasi}
                    onChange={(e) => handleInputChange('label_akomodasi', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* ================================================================
              TAB: Media & Aset Gambar
              ================================================================ */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800">
                <p className="font-semibold mb-1">ℹ️ Cara Kerja Upload Gambar</p>
                <p className="text-blue-700">
                  Gambar disimpan sebagai base64 di database — tidak ada file eksternal yang perlu dikelola. Hero Banner dikompres otomatis di browser sebelum dikirim supaya ukuran data tetap efisien.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card: Logo & Ikon */}
                <Card className="p-5 sm:p-6 bg-white border border-slate-200 rounded-xl space-y-5 shadow-xs">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center">
                      <Images className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Logo & Ikon</h2>
                      <p className="text-xs text-slate-500">Gambar berukuran kecil untuk identitas portal</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <ImageUploadField
                      label="Logo Navbar"
                      value={settings.navbar_logo}
                      onChange={(val) => handleInputChange('navbar_logo', val)}
                      maxInputSizeKB={500}
                      hint="Tampil di pojok kiri navbar halaman publik. Rekomendasikan format PNG/SVG transparan."
                    />

                    <div className="border-t border-slate-100 pt-5">
                      <ImageUploadField
                        label="Logo Hero"
                        value={settings.hero_logo}
                        onChange={(val) => handleInputChange('hero_logo', val)}
                        maxInputSizeKB={500}
                        hint="Tampil di atas judul utama di landing page. Format PNG/SVG dengan background transparan."
                      />
                    </div>

                    <div className="border-t border-slate-100 pt-5">
                      <ImageUploadField
                        label="Favicon (Ikon Tab Browser)"
                        value={settings.favicon}
                        onChange={(val) => handleInputChange('favicon', val)}
                        maxInputSizeKB={100}
                        hint="Tampil di tab browser. Gunakan file ICO, PNG 32×32, atau SVG. Maks 100KB."
                        aspectHint="32×32 px"
                      />
                    </div>
                  </div>
                </Card>

                {/* Card: Hero Banner */}
                <Card className="p-5 sm:p-6 bg-white border border-slate-200 rounded-xl space-y-5 shadow-xs">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                      <Images className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Hero Banner</h2>
                      <p className="text-xs text-slate-500">Background section utama landing page</p>
                    </div>
                  </div>

                  <ImageUploadField
                    label="Gambar Background Hero"
                    value={settings.hero_banner}
                    onChange={(val) => handleInputChange('hero_banner', val)}
                    maxInputSizeKB={3072}
                    compress={true}
                    maxWidth={1280}
                    quality={0.75}
                    hint="Otomatis dikompres & di-resize ke maks 1280px lebar. File asli maks 3MB (hasil setelah kompresi jauh lebih kecil)."
                    aspectHint="1920×1080 px (16:9)"
                  />

                  {/* Preview hero banner yang lebih besar */}
                  {settings.hero_banner && (
                    <div className="mt-2">
                      <p className="text-[11px] text-slate-500 mb-1.5 font-medium">Preview tampilan hero:</p>
                      <div
                        className="w-full h-28 rounded-lg border border-slate-200 bg-cover bg-center bg-no-repeat relative overflow-hidden"
                        style={{ backgroundImage: `url(${settings.hero_banner})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/60 flex items-end p-3">
                          <p className="text-[10px] font-semibold text-slate-800 bg-white/80 px-2 py-0.5 rounded">
                            {settings.hero_title || 'Judul Acara'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* ==========================================================
                  CARD: Pratinjau Branding Langsung (Live Preview)
                  ========================================================== */}
              <Card className="p-5 sm:p-6 bg-white border border-slate-200 rounded-xl space-y-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Pratinjau Branding Langsung (Live Preview)</h2>
                      <p className="text-xs text-slate-500">Tampilan real-time Navbar & Hero Logo sebelum perubahan disimpan</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Real-time Preview
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Preview 1: Navbar Logo Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 block">
                        Navbar Logo Preview
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">44px × 44px | gap 12px</span>
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-slate-50">
                      <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-400" />
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                        <span>Navbar Publik (Header)</span>
                      </div>
                      <div className="p-4 bg-white/95 flex items-center justify-between">
                        <div className="flex items-center gap-[12px]">
                          {settings.navbar_logo ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={settings.navbar_logo}
                              alt="Logo Navbar Preview"
                              className="w-[44px] h-[44px] object-contain bg-transparent block select-none"
                              style={{ width: '44px', height: '44px', objectFit: 'contain', backgroundColor: 'transparent' }}
                            />
                          ) : (
                            <div className="w-[44px] h-[44px] rounded-xl bg-[#1E40AF] flex items-center justify-center text-white shadow-xs">
                              <Shield className="w-6 h-6 stroke-[2.2]" />
                            </div>
                          )}
                          <div className="flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block leading-tight">
                              TENTARA NASIONAL INDONESIA
                            </span>
                            <span className="text-[14px] font-extrabold text-[#0F172A] block leading-tight mt-0.5">
                              Portal RAPIM 2026
                            </span>
                          </div>
                        </div>
                        <div className="text-[11px] font-semibold text-[#1E40AF] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg shadow-2xs">
                          Cari E-Ticket
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview 2: Hero Logo Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 block">
                        Hero Logo Preview
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Container 24px | 96px/72px/64px</span>
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-slate-50">
                      <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-400" />
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                        <span>Hero Section Branding</span>
                      </div>
                      <div className="p-6 bg-gradient-to-b from-white to-[#f8fafc] flex flex-col items-center justify-center text-center space-y-3">
                        {/* Premium Container */}
                        <div
                          className="bg-white border border-[#e2e8f0] rounded-[24px] p-[16px] shadow-sm inline-flex items-center justify-center transition-all hover:shadow-md"
                          style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '24px', padding: '16px' }}
                        >
                          {settings.hero_logo ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={settings.hero_logo}
                              alt="Logo Hero Preview"
                              className="w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] lg:w-[96px] lg:h-[96px] object-contain bg-transparent block select-none"
                              style={{ objectFit: 'contain', backgroundColor: 'transparent' }}
                            />
                          ) : (
                            <div className="w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] lg:w-[96px] lg:h-[96px] flex items-center justify-center bg-transparent">
                              <TniEmblem matra="MABES" size="lg" className="scale-110 sm:scale-125 lg:scale-150" />
                            </div>
                          )}
                        </div>

                        {/* Institutional Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1E40AF] text-[11px] font-semibold tracking-wide shadow-2xs">
                          <Shield className="w-3.5 h-3.5 text-[#1E40AF]" />
                          <span>MARKAS BESAR TENTARA NASIONAL INDONESIA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500">
              Perubahan akan langsung tercermin di portal registrasi dan landing page setelah disimpan.
            </span>
            <Button
              type="submit"
              size="sm"
              disabled={loading || saving}
              className="gap-1.5 text-xs bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-xs"
            >
              {saving ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
