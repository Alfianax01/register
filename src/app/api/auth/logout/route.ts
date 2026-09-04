import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Berhasil keluar dari sistem' });
  response.cookies.delete('tni_session');
  return response;
}

