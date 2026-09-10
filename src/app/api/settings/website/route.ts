import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings, saveSiteSettings } from '@/lib/settings/siteSettings';
import { verifySessionToken } from '@/lib/security/auth';
import { SESSION_COOKIE_NAME } from '@/lib/security/session';

export const dynamic = 'force-dynamic';
// Body size limit untuk App Router Next.js 14 (App Router tidak support export const config)
// Payload base64 gambar terkompresi biasanya < 500KB — default Next.js 4MB sudah cukup.
// Jika upload gambar besar gagal (413 error), set NEXT_BODY_SIZE_LIMIT env var di .env.local.

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    console.error('[API Settings Website] GET error:', err);
    return NextResponse.json({ error: 'Gagal mengambil pengaturan website' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token =
      req.cookies.get(SESSION_COOKIE_NAME)?.value ||
      req.cookies.get('session_token')?.value;

    const session = token ? verifySessionToken(token) : null;
    if (!session) {
      return NextResponse.json({ error: 'Sesi login tidak sah atau telah kedaluwarsa' }, { status: 401 });
    }

    const body = await req.json();
    const updated = await saveSiteSettings(body);

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    console.error('[API Settings Website] POST error:', err);
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan website' }, { status: 500 });
  }
}

