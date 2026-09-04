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
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Input manual NRP / Token / Nama..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            disabled={isProcessing}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button
          type="submit"
          variant="gold"
          size="md"
          isLoading={isProcessing}
          disabled={!searchValue.trim()}
          className="text-xs"
        >
          <UserCheck className="w-4 h-4 mr-1.5" />
          <span>Check-In</span>
        </Button>
      </div>
      <p className="text-[11px] text-slate-400">
        Gunakan jika tamu tidak membawa smartphone/kartu QR fisik. Masukkan 6 digit NRP prajurit.
      </p>
    </form>
  );
};

