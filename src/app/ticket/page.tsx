'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  AlertCircle,
  ArrowLeft,
  Phone,
  Mail,
  Award,
  QrCode,
  UserCheck,
  Building2,
  Calendar,
  ArrowRight,
  UserX,
  RefreshCw,
  X
} from 'lucide-react';
import { Guest } from '@/types';

export default function TicketSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<Guest[]>([]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setError('Masukkan NRP, No. HP, Email, atau QR Code ID Anda');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await fetch(`/api/guests?q=${encodeURIComponent(cleanQuery)}`, {
        cache: 'no-store'
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memuat data');
      }

      setResults(data.guests || []);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err?.message || 'Terjadi kendala saat memeriksa database. Silakan coba lagi.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f8fafc] py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-[14px] font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Kembali ke Halaman Pendaftaran</span>
          </Link>
        </div>

        {/* Search Input Box */}
        <Card className="p-6 sm:p-8 bg-white border border-slate-200/90 shadow-md rounded-lg space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                Layanan Mandiri
              </Badge>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-[13px] text-[#64748B] font-medium">
                Pencarian Tiket Peserta
              </span>
            </div>
            <h1 className="text-[22px] sm:text-[26px] font-bold text-[#0F172A] tracking-tight">
              Cari E-Ticket Peserta Acara
            </h1>
            <p className="text-[14px] text-[#475569] leading-relaxed">
              Temukan E-Ticket resmi Anda menggunakan NRP/NIP, nomor WhatsApp, alamat email, atau kode QR token.
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Input
                label="Kriteria Pencarian (NRP / No. HP / Email / Token)"
                placeholder="Contoh: 1102941, 08123456789, atau nama@tni.mil.id"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (error) setError('');
                }}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                rightIcon={
                  query ? (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-slate-400 hover:text-slate-600 p-1"
                      aria-label="Bersihkan pencarian"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : undefined
                }
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[13px] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
                <div className="flex-1">
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={() => handleSearch()}
                    className="mt-1 inline-flex items-center text-xs font-semibold text-rose-700 hover:text-rose-900 underline gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Coba Lagi
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={loading}
                loadingText="Mencari Data..."
                className="w-full sm:flex-1 text-[15px] font-medium h-[48px]"
              >
                <Search className="w-4 h-4 mr-2" />
                <span>Temukan E-Ticket</span>
              </Button>
              {searched && (
                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto h-[48px]"
                >
                  Reset
                </Button>
              )}
            </div>
          </form>

          {/* Supported Criteria Indicators */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wide mb-3">
              Kriteria yang Didukung:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-[#0F172A]">
                <Award className="w-4 h-4 text-[#1E40AF] flex-shrink-0" />
                <span className="text-[13px] font-medium">NRP / NIP Prajurit</span>
              </div>
              <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-[#0F172A]">
                <Phone className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                <span className="text-[13px] font-medium">Nomor WhatsApp / HP</span>
              </div>
              <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-[#0F172A]">
                <Mail className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                <span className="text-[13px] font-medium">Alamat Email Terdaftar</span>
              </div>
              <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-[#0F172A]">
                <QrCode className="w-4 h-4 text-slate-700 flex-shrink-0" />
                <span className="text-[13px] font-medium">QR Token / ID Registrasi</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Loading State Skeleton */}
        {loading && (
          <Card className="p-6 bg-white border border-slate-200 shadow-sm animate-pulse space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-slate-200 rounded w-1/3"></div>
              <div className="h-5 bg-slate-200 rounded w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <div className="h-10 bg-slate-200 rounded w-36"></div>
            </div>
          </Card>
        )}

        {/* Search Results List */}
        {!loading && searched && results.length > 0 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-1">
              <p className="text-[14px] font-medium text-slate-700">
                Ditemukan <span className="font-bold text-[#1E40AF]">{results.length}</span> peserta:
              </p>
              <span className="text-xs text-slate-500">Pilih peserta untuk melihat E-Ticket</span>
            </div>

            <div className="space-y-3">
              {results.map((guest) => {
                const fullName = [guest.gelar_depan, guest.nama, guest.gelar_belakang]
                  .filter(Boolean)
                  .join(' ');

                const isHadir = guest.status_kehadiran === 'HADIR';

                return (
                  <Card
                    key={guest.id}
                    className="p-5 sm:p-6 bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all rounded-lg space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold text-[17px] text-slate-900">
                            {fullName}
                          </span>
                          <Badge variant={guest.matra.toLowerCase() as any} size="sm">
                            {guest.matra === 'NON_TNI' ? 'SIPIL' : `TNI ${guest.matra}`}
                          </Badge>
                          {isHadir ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <UserCheck className="w-3 h-3" /> Hadir di Acara
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              Terdaftar Resmi
                            </span>
                          )}
                        </div>
                        <p className="text-[14px] text-slate-600 font-medium">
                          {guest.pangkat} &bull; <span className="font-mono text-slate-800 font-semibold">{guest.nrp}</span>
                        </p>
                      </div>

                      {guest.registration_id && (
                        <div className="text-left sm:text-right">
                          <span className="text-[11px] text-slate-400 block font-mono">No. Registrasi</span>
                          <span className="text-xs font-mono font-semibold text-slate-700">
                            {guest.registration_id}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{guest.satuan} - {guest.satker}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{guest.jabatan}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="text-xs text-slate-500">
                        {guest.seat_number ? (
                          <span>Kursi: <strong className="text-slate-800">{guest.seat_number}</strong></span>
                        ) : (
                          <span>Kursi: <em className="text-slate-400">Penempatan di Meja Registrasi</em></span>
                        )}
                      </div>

                      <Link href={`/ticket/${guest.qr_token}`} className="w-full sm:w-auto">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full sm:w-auto font-medium"
                        >
                          <span>Buka E-Ticket & QR Code</span>
                          <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State (Searched but 0 results) */}
        {!loading && searched && results.length === 0 && !error && (
          <Card className="p-8 sm:p-10 bg-white border border-slate-200 text-center space-y-4 rounded-lg shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <UserX className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-[17px] font-bold text-slate-900">
                Data Peserta Tidak Ditemukan
              </h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Tidak ada data pendaftaran yang cocok dengan pencarian <strong className="text-slate-800 font-mono">&ldquo;{query}&rdquo;</strong>.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 text-left text-xs text-slate-600 max-w-md mx-auto space-y-2">
              <p className="font-semibold text-slate-800">Petunjuk Pengecekan:</p>
              <ul className="list-disc list-inside space-y-1 text-[12px] text-slate-600">
                <li>Pastikan NRP prajurit diketik dengan benar tanpa tanda spasi.</li>
                <li>Jika mencari dengan No. HP, gunakan awalan <strong>08...</strong> sesuai yang didaftarkan.</li>
                <li>Jika baru saja mendaftar, pastikan formulir pendaftaran telah dikirim hingga selesai.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full sm:w-auto">
                  Daftar Sebagai Peserta Baru
                </Button>
              </Link>
              <Button
                variant="outline"
                size="md"
                onClick={handleReset}
                className="w-full sm:w-auto"
              >
                Coba Cari Lagi
              </Button>
            </div>
          </Card>
        )}

        {/* Registration CTA link footer */}
        <div className="pt-2 text-center">
          <span className="text-[13px] text-[#64748B]">Belum melakukan registrasi acara? </span>
          <Link href="/" className="text-[13px] font-semibold text-[#1E40AF] hover:underline">
            Buka Formulir Pendaftaran &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

