import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('tni_session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const session = verifySessionToken(sessionCookie);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      username: session.username,
      nama: session.nama,
      role: session.role
    }
  });
}
