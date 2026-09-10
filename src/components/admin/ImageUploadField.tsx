'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

export interface ImageUploadFieldProps {
  /** Label deskriptif yang ditampilkan di atas komponen */
  label: string;
  /** Nilai saat ini: base64 data URI atau URL. String kosong = belum ada gambar */
  value: string;
  /** Callback dipanggil dengan base64 data URI setelah file diproses, atau '' saat dihapus */
  onChange: (value: string) => void;
  /** Ukuran maksimal file dalam KB SEBELUM kompresi. Default: 2048 (2MB) */
  maxInputSizeKB?: number;
  /** Untuk gambar besar: kompres & resize di canvas sebelum encode base64. Default: false */
  compress?: boolean;
  /** Lebar maksimal setelah resize (pixel). Hanya berlaku kalau compress=true. Default: 1280 */
  maxWidth?: number;
  /** Kualitas kompresi JPEG 0–1. Hanya berlaku kalau compress=true. Default: 0.78 */
  quality?: number;
  /** Teks saran dimensi yang ditampilkan di bawah tombol upload (opsional) */
  aspectHint?: string;
  /** Deskripsi singkat untuk keperluan apa gambar ini */
  hint?: string;
}

/**
 * Komponen upload gambar reusable untuk panel admin.
 * Mendukung validasi, kompresi canvas, preview langsung, dan hapus gambar.
 */
export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  maxInputSizeKB = 2048,
  compress = false,
  maxWidth = 1280,
  quality = 0.78,
  aspectHint,
  hint
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];

  /** Mengompres gambar menggunakan Canvas API dan mengembalikan base64 data URI */
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        let { width, height } = img;

        // Resize proporsional jika lebih lebar dari maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Tidak bisa membuat canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // SVG tidak bisa dikompres — biarkan apa adanya
        const outputType = file.type === 'image/svg+xml' ? 'image/svg+xml' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputType, quality);
        resolve(dataUrl);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Gagal memuat gambar'));
      };

      img.src = objectUrl;
    });
  };

  /** Membaca file sebagai base64 data URI tanpa kompresi */
  const readAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input agar file yang sama bisa dipilih ulang
    if (inputRef.current) inputRef.current.value = '';

    setError(null);

    // Validasi tipe file
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Format tidak didukung. Gunakan PNG, JPG, JPEG, SVG, atau WEBP.');
      return;
    }

    // Validasi ukuran sebelum kompresi
    const sizeKB = file.size / 1024;
    if (sizeKB > maxInputSizeKB) {
      setError(`Ukuran file terlalu besar (${Math.round(sizeKB)} KB). Maks ${maxInputSizeKB} KB.`);
      return;
    }

    setProcessing(true);
    try {
      let dataUrl: string;
      if (compress && file.type !== 'image/svg+xml') {
        dataUrl = await compressImage(file);
      } else {
        dataUrl = await readAsDataUrl(file);
      }
      onChange(dataUrl);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Gagal memproses gambar';
      setError(errMsg);
    } finally {
      setProcessing(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const hasImage = !!value;

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
        {label}
      </label>

      {/* Hint */}
      {hint && (
        <p className="text-[11px] text-slate-400 -mt-1">{hint}</p>
      )}

      {/* Preview Area */}
      {hasImage && (
        <div className="relative inline-flex group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={`Preview ${label}`}
            className="max-h-24 max-w-[180px] object-contain rounded-lg border border-slate-200 bg-slate-50 shadow-xs p-1"
          />
          {/* Tombol Hapus overlay */}
          <button
            type="button"
            onClick={handleRemove}
            title="Hapus gambar"
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-xs opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Hapus gambar"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Upload Button & Input */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={processing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors disabled:opacity-60 disabled:cursor-wait"
        >
          {processing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          <span>{processing ? 'Memproses...' : hasImage ? 'Ganti Gambar' : 'Upload Gambar'}</span>
        </button>

        {hasImage && (
          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Hapus</span>
          </button>
        )}

        {/* Aspect hint */}
        {aspectHint && (
          <span className="text-[11px] text-slate-400">Saran: {aspectHint}</span>
        )}
      </div>

      {/* Input tersembunyi */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Error message */}
      {error && (
        <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-md px-2.5 py-1.5">
          {error}
        </p>
      )}
    </div>
  );
};
