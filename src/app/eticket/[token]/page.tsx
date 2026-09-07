'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { EticketContainer } from '@/components/eticket/EticketContainer';

export default function ETicketAliasPage() {
  const params = useParams();
  const token = params.token as string;

  return <EticketContainer initialToken={token} />;
}
