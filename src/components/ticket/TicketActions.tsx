'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Download, Printer, Copy, Check, MessageSquare, FileText } from 'lucide-react';

interface TicketActionsProps {
  guest: any;
  qrCodeUrl: string;
}

export const TicketActions: React.FC<TicketActionsProps> = ({ guest, qrCodeUrl }) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('Tautan Tersalin', {
      type: 'info',
      message: 'Link personal E-Ticket berhasil disalin ke clipboard.'
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `QR_Pass_TNI_${guest.nrp || guest.nama}.png`;
    link.click();
    showToast('Mengunduh QR Pass', {
      type: 'success',
      message: 'Berkas QR Code PNG berhasil diunduh.'
    });
  };

  const handleDownloadPdf = () => {
    const token = guest.qr_token;
    if (token) {
      window.open(`/api/ticket/${token}/pdf`, '_blank');
      showToast('Mengunduh Berkas PDF', {
        type: 'info',
        message: 'Membuka berkas E-Ticket PDF resmi format cetak A4.'
      });
    } else {
      showToast('Token tidak ditemukan', { type: 'error' });
    }
  };

  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const text = encodeURIComponent(
      `E-TICKET RESMI RAPIM TNI 2026\n` +
      `Nama: ${guest.nama}\n` +
      `Pangkat: ${guest.pangkat} (NRP ${guest.nrp})\n` +
      `Kursi: ${guest.seat?.seat_number || 'Sedang Dialokasikan'}\n\n` +
      `Buka E-Ticket Digital:\n${url}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-2.5 no-print">
      {/* Primary PDF Download Action */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleDownloadPdf}
        className="w-full text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white shadow-sm flex items-center justify-center gap-2 py-3 rounded-lg"
      >
        <FileText className="w-4 h-4 text-blue-200" />
        <span>Unduh E-Ticket PDF Resmi (Format A4)</span>
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="md" onClick={handleDownloadQr} className="text-xs">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          <span>Unduh QR Pass</span>
        </Button>

        <Button variant="outline" size="md" onClick={handlePrint} className="text-xs">
          <Printer className="w-3.5 h-3.5 mr-1.5" />
          <span>Cetak ID Card</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="md" onClick={handleWhatsAppShare} className="text-xs">
          <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
          <span>Kirim WhatsApp</span>
        </Button>

        <Button variant="secondary" size="md" onClick={handleCopyLink} className="text-xs">
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              <span>Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              <span>Salin Link</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
