'use client';

import React, { useState, useEffect } from 'react';
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
  Building,
  Palette,
  SlidersHorizontal,
  Images,
  Shield,
  Check,
  Sparkles
} from 'lucide-react';
import {
  SiteSettings,
  DEFAULT_SITE_SETTINGS,
  THEME_PRESETS,
  PresetThemeType
} from '@/types/settings';
import { useAdmin } from '@/components/layout/AdminContext';

export default function WebsiteCMSPage() {
  const { showToast } = useToast();
  const adminCtx = useAdmin();
  const [activeTab, setActiveTab] = useState<'theme' | 'logo' | 'identity' | 'registration'>('theme');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch('/api/settings/website');
        if (res.ok) {
          const data = await res.json();
          if (data && data.settings) {
            setSettings({ ...DEFAULT_SITE_SETTINGS, ...data.settings });
          }
        }
      } catch (err) {
        console.error('Failed to load site settings:', err);
        showToast('Gagal memuat pengaturan website', { type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [showToast]);

  const handleChange = (field: keyof SiteSettings, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyPreset = (presetKey: PresetThemeType) => {
    const preset = THEME_PRESETS[presetKey];
    if (!preset) return;

    setSettings((prev) => ({
      ...prev,
      theme_preset: presetKey,
      primary_color: preset.primary_color,
      secondary_color: preset.secondary_color,
      gold_accent: preset.gold_accent,
      gold_light: preset.gold_light,
      sidebar_color: preset.sidebar_color,
      navbar_color: preset.navbar_color,
      button_color: preset.button_color,
      accent_color: preset.accent_color,
      bg_color: preset.bg_color,
      card_color: preset.card_color,
      text_primary: preset.text_primary,
      text_secondary: preset.text_secondary,
      border_color: preset.border_color
    }));

    showToast(`Tema preset "${preset.name}" berhasil diterapkan ke formulir. Klik Simpan untuk menerapkannya secara permanen.`, {
      type: 'info'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/settings/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!res.ok) {
        throw new Error('Gagal menyimpan pengaturan');
      }

      showToast('Pengaturan website dan tema berhasil disimpan secara permanen.', {
        type: 'success'
      });

      if (adminCtx?.refreshSiteSettings) {
        await adminCtx.refreshSiteSettings();
      }
    } catch (err) {
      console.error('Save error:', err);
      showToast('Gagal menyimpan perubahan ke database.', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Management Website & Identitas"
        subtitle="Kelola tema warna sistem, logo kedinasan, banner login, dan identitas resmi portal"
        badge="CMS & PENGATURAN"
      />

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'theme'
              ? 'border-[#8B0000] text-[#8B0000]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Tema & Warna Sistem</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logo')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'logo'
              ? 'border-[#8B0000] text-[#8B0000]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Images className="w-4 h-4" />
          <span>Logo & Banner Login</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('identity')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'identity'
              ? 'border-[#8B0000] text-[#8B0000]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Identitas Website</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('registration')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'registration'
              ? 'border-[#8B0000] text-[#8B0000]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Label Form Registrasi</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 1: TEMA & WARNA SISTEM */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            {/* 5 Preset Tema 1-Klik */}
            <Card className="p-5 sm:p-6 bg-white border border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#B8860B] flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Preset Tema Kedinasan (1-Klik Terapkan)</h3>
                    <p className="text-xs text-slate-500">Pilih skema warna resmi institusi TNI sesuai kebutuhan acara kedinasan</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Object.keys(THEME_PRESETS) as PresetThemeType[]).map((key) => {
                  const preset = THEME_PRESETS[key];
                  const isCurrent = settings.theme_preset === key;

                  return (
                    <div
                      key={key}
                      onClick={() => handleApplyPreset(key)}
                      className={`cursor-pointer rounded-xl p-4 border-2 transition-all hover:shadow-md ${
                        isCurrent
                          ? 'border-[#8B0000] bg-red-50/20 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-white shadow-xs inline-block"
                            style={{ backgroundColor: preset.primary_color }}
                          />
                          <h4 className="text-xs font-bold text-slate-900">{preset.name}</h4>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-white bg-[#8B0000] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Aktif</span>
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                        {preset.description}
                      </p>

                      {/* Color Palette Preview Swatches */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                        <div className="flex-1 text-center">
                          <div className="h-6 rounded border border-slate-200 shadow-2xs" style={{ backgroundColor: preset.primary_color }} />
                          <span className="text-[9px] text-slate-400 block mt-0.5">Primary</span>
                        </div>
                        <div className="flex-1 text-center">
                          <div className="h-6 rounded border border-slate-200 shadow-2xs" style={{ backgroundColor: preset.sidebar_color }} />
                          <span className="text-[9px] text-slate-400 block mt-0.5">Sidebar</span>
                        </div>
                        <div className="flex-1 text-center">
                          <div className="h-6 rounded border border-slate-200 shadow-2xs" style={{ backgroundColor: preset.gold_accent }} />
                          <span className="text-[9px] text-slate-400 block mt-0.5">Gold</span>
                        </div>
                        <div className="flex-1 text-center">
                          <div className="h-6 rounded border border-slate-200 shadow-2xs" style={{ backgroundColor: preset.bg_color }} />
                          <span className="text-[9px] text-slate-400 block mt-0.5">BG</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Custom Color Pickers */}
            <Card className="p-5 sm:p-6 bg-white border border-slate-200">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">Kustomisasi Kode Warna (HEX)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Red / Header
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.primary_color || '#8B0000'}
                      onChange={(e) => handleChange('primary_color', e.target.value)}
                      className="w-10 h-10 p-0 border border-slate-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.primary_color || '#8B0000'}
                      onChange={(e) => handleChange('primary_color', e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dark Red / Sidebar Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.sidebar_color || '#6B0000'}
                      onChange={(e) => handleChange('sidebar_color', e.target.value)}
                      className="w-10 h-10 p-0 border border-slate-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.sidebar_color || '#6B0000'}
                      onChange={(e) => handleChange('sidebar_color', e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gold Accent (Aksen Emas)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.gold_accent || '#B8860B'}
                      onChange={(e) => handleChange('gold_accent', e.target.value)}
                      className="w-10 h-10 p-0 border border-slate-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.gold_accent || '#B8860B'}
                      onChange={(e) => handleChange('gold_accent', e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.bg_color || '#F5F6F8'}
                      onChange={(e) => handleChange('bg_color', e.target.value)}
                      className="w-10 h-10 p-0 border border-slate-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.bg_color || '#F5F6F8'}
                      onChange={(e) => handleChange('bg_color', e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase font-mono"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: LOGO & BANNER LOGIN */}
        {activeTab === 'logo' && (
          <div className="space-y-6">
            <Card className="p-5 sm:p-6 bg-white border border-slate-200">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <Images className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">Pengaturan Banner & Logo Kedinasan</h3>
              </div>

              <div className="space-y-6">
                {/* Banner Login (1920x500) */}
                <ImageUploadField
                  label="Banner Header Halaman Login (1920x500 px)"
                  hint="Gambar banner lebar beresolusi tinggi untuk background header halaman login admin. Jika dikosongkan, menggunakan warna solid merah maroon dengan pola hexagonal militer."
                  value={settings.banner_login || ''}
                  onChange={(val) => handleChange('banner_login', val)}
                  maxInputSizeKB={5120}
                  aspectHint="Rekomendasi 1920x500 px"
                />

                {/* Banner Live Preview */}
                {settings.banner_login && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-700 block">
                      Pratinjau Banner Header Login
                    </span>
                    <div
                      className="w-full h-36 rounded-xl border border-slate-300 shadow-inner flex items-center justify-center relative overflow-hidden"
                      style={{
                        backgroundImage: `url(${settings.banner_login})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div className="absolute inset-0 bg-black/40" />
                      <div className="relative z-10 text-center text-white px-4">
                        <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest block">
                          TENTARA NASIONAL INDONESIA
                        </span>
                        <h4 className="text-sm font-black uppercase">
                          {settings.nama_sistem || 'PORTAL RAPIM TNI 2026'}
                        </h4>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  {/* Logo Header / Login */}
                  <ImageUploadField
                    label="Logo Utama / Header Login"
                    hint="Logo lambang TNI atau institusi terkait yang muncul di tengah banner halaman login dan dokumen kedinasan."
                    value={settings.logo_header || settings.navbar_logo || ''}
                    onChange={(val) => {
                      handleChange('logo_header', val);
                      handleChange('navbar_logo', val);
                    }}
                    maxInputSizeKB={2048}
                  />

                  {/* Logo Sidebar */}
                  <ImageUploadField
                    label="Logo Sidebar Panel Admin"
                    hint="Logo kecil yang ditampilkan pada pojok kiri atas bilah menu navigasi admin."
                    value={settings.logo_sidebar || ''}
                    onChange={(val) => handleChange('logo_sidebar', val)}
                    maxInputSizeKB={2048}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: IDENTITAS WEBSITE */}
        {activeTab === 'identity' && (
          <div className="space-y-6">
            <Card className="p-5 sm:p-6 bg-white border border-slate-200">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <Building className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">Identitas Resmi Institusi & Acara</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Sistem / Acara (Judul Utama)
                  </label>
                  <input
                    type="text"
                    value={settings.nama_sistem || ''}
                    onChange={(e) => handleChange('nama_sistem', e.target.value)}
                    placeholder="Contoh: PORTAL RAPIM TNI 2026"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Ditampilkan pada header login, tab browser, dan kartu tiket undangan resmi.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subjudul / Deskripsi Sistem
                  </label>
                  <input
                    type="text"
                    value={settings.subjudul || ''}
                    onChange={(e) => handleChange('subjudul', e.target.value)}
                    placeholder="Contoh: Sistem Informasi Presensi, Akreditasi, dan Tata Kelola Kedinasan"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Teks Footer Kedinasan
                  </label>
                  <textarea
                    rows={2}
                    value={settings.footer || ''}
                    onChange={(e) => handleChange('footer', e.target.value)}
                    placeholder="Contoh: PUSAT INFORMASI PENGOLAHAN DATA TENTARA NASIONAL INDONESIA (PUSINFOLAHTA TNI)"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Ditampilkan di bagian paling bawah halaman login dan seluruh panel sistem.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: LABEL FORM REGISTRASI */}
        {activeTab === 'registration' && (
          <div className="space-y-6">
            <Card className="p-5 sm:p-6 bg-white border border-slate-200">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <FileText className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">Label Formulir Registrasi Publik</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Label Matra</label>
                  <input
                    type="text"
                    value={settings.label_matra || 'Matra'}
                    onChange={(e) => handleChange('label_matra', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Label Pangkat</label>
                  <input
                    type="text"
                    value={settings.label_pangkat || 'Pangkat'}
                    onChange={(e) => handleChange('label_pangkat', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Label Korps</label>
                  <input
                    type="text"
                    value={settings.label_korps || 'Korps'}
                    onChange={(e) => handleChange('label_korps', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Label Satuan</label>
                  <input
                    type="text"
                    value={settings.label_satuan || 'Kesatuan / Kotama'}
                    onChange={(e) => handleChange('label_satuan', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Label Jabatan</label>
                  <input
                    type="text"
                    value={settings.label_jabatan || 'Jabatan Dinas'}
                    onChange={(e) => handleChange('label_jabatan', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Label Kategori</label>
                  <input
                    type="text"
                    value={settings.label_kategori || 'Kategori Undangan'}
                    onChange={(e) => handleChange('label_kategori', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500">
            Perubahan identitas dan tema warna akan langsung aktif secara global setelah disimpan.
          </span>
          <Button
            type="submit"
            size="md"
            disabled={loading || saving}
            className="gap-2 text-xs font-bold bg-[#8B0000] hover:bg-[#6B0000] text-white shadow-sm"
          >
            {saving ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
