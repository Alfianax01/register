'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Download, Printer, Share2, Copy, Check, MessageSquare } from 'lucide-react';

interface TicketActionsProps {
  guest: any;
  qrCodeUrl: string;
}

export const TicketActions: React.FC<TicketActionsProps> = ({ guest, qrCodeUrl }) => {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `QR_Ticket_RAPIM_TNI_${guest.nrp || guest.nama}.png`;
    link.click();
  };

  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const text = encodeURIComponent(
      `*E-TICKET RAPIM TNI 2026*\n` +
      `Nama: ${guest.nama}\n` +
      `Pangkat/NRP: ${guest.pangkat} / ${guest.nrp}\n` +
      `Satuan: ${guest.satuan}\n` +
      `Status: ${guest.status_kehadiran}\n` +
      `Kursi: ${guest.seat?.seat_number || 'Dalam Proses'}\n\n` +
      `Buka E-Ticket & QR Code resmi:\n${url}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-3 no-print">
      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="gold" size="md" onClick={handleDownloadQr} className="text-xs">
          <Download className="w-4 h-4 mr-1.5" />
          <span>Unduh QR Pass</span>
        </Button>

        <Button variant="outline" size="md" onClick={handlePrint} className="text-xs">
          <Printer className="w-4 h-4 mr-1.5" />
          <span>Cetak ID Card</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="ghost" size="md" onClick={handleWhatsAppShare} className="text-xs border border-[#1E3B2F] hover:bg-[#122A1E]">
          <MessageSquare className="w-4 h-4 mr-1.5 text-emerald-400" />
          <span>Kirim WhatsApp</span>
        </Button>

        <Button variant="ghost" size="md" onClick={handleCopyLink} className="text-xs border border-[#1E3B2F] hover:bg-[#122A1E]">
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1.5 text-emerald-400" />
              <span className="text-emerald-400">Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1.5 text-[#D4AF37]" />
              <span>Salin Tautan</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

