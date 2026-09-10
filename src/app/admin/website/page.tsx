'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  Globe,
  FileText,
  Save,
  RotateCw,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { SiteSettings, DEFAULT_SITE_SETTINGS } from '@/types/settings';

export default function WebsiteCMSPage() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'landing' | 'labels'>('landing');
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

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
      <AdminHeader
        title="Manajemen Konten & Website"
        subtitle="Kelola branding landing page, informasi kegiatan, dan penyesuaian label formulir pendaftaran."
        user={currentUser}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          {/* Tab Selection */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('landing')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'landing'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Landing Page & Branding</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('labels')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'labels'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Label Form Registrasi</span>
            </button>
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
          {activeTab === 'landing' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Branding & Hero */}
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

              {/* Card 2: Lokasi, Tanggal & Logo */}
              <Card className="p-5 sm:p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Jadwal, Lokasi & Logo</h2>
                    <p className="text-xs text-slate-500">Parameter pelaksanaan dan lambang kedinasan</p>
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

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>URL / Path Logo Navbar (Kosongkan jika default badge)</span>
                    </label>
                    <input
                      type="text"
                      value={settings.navbar_logo}
                      onChange={(e) => handleInputChange('navbar_logo', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                      placeholder="/tni.png atau https://..."
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>URL / Path Logo Hero (Opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={settings.hero_logo}
                      onChange={(e) => handleInputChange('hero_logo', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                      placeholder="/tni.png atau https://..."
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

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
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Label Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={settings.label_nama}
                    onChange={(e) => handleInputChange('label_nama', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Label Matra / Kategori
                  </label>
                  <input
                    type="text"
                    value={settings.label_matra}
                    onChange={(e) => handleInputChange('label_matra', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Label Pangkat Kedinasan
                  </label>
                  <input
                    type="text"
                    value={settings.label_pangkat}
                    onChange={(e) => handleInputChange('label_pangkat', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Label NRP / NIP
                  </label>
                  <input
                    type="text"
                    value={settings.label_nrp}
                    onChange={(e) => handleInputChange('label_nrp', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Label Jabatan Kedinasan
                  </label>
                  <input
                    type="text"
                    value={settings.label_jabatan}
                    onChange={(e) => handleInputChange('label_jabatan', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Label Satker / Kesatuan Asal
                  </label>
                  <input
                    type="text"
                    value={settings.label_satker}
                    onChange={(e) => handleInputChange('label_satker', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Label Alamat Email
                  </label>
                  <input
                    type="text"
                    value={settings.label_email}
                    onChange={(e) => handleInputChange('label_email', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Label Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={settings.label_phone}
                    onChange={(e) => handleInputChange('label_phone', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

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
