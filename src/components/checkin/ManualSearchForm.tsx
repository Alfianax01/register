'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, UserCheck } from 'lucide-react';

interface ManualSearchFormProps {
  onManualCheckin: (val: string) => void;
  isProcessing: boolean;
}

export const ManualSearchForm: React.FC<ManualSearchFormProps> = ({ onManualCheckin, isProcessing }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    onManualCheckin(searchValue.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2">
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <Input
            placeholder="NRP / Token / Nama prajurit..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            disabled={isProcessing}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isProcessing}
          disabled={!searchValue.trim()}
          className="text-xs h-[42px] px-4 font-medium flex-shrink-0"
        >
          <UserCheck className="w-3.5 h-3.5 mr-1.5" />
          <span>Check-In</span>
        </Button>
      </div>
      <p className="text-[11px] text-slate-500">
        Pencarian manual alternatif jika kamera tidak dapat memindai QR fisik tamu.
      </p>
    </form>
  );
};
