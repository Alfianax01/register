import { NextRequest, NextResponse } from 'next/server';
import { verifySessionEdge, SESSION_COOKIE_NAME } from '@/lib/security/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Ambil session token dari cookie resmi atau fallback
  const token =
    req.cookies.get(SESSION_COOKIE_NAME)?.value ||
    req.cookies.get('session_token')?.value;

  const session = await verifySessionEdge(token);

  // 2. Proteksi Halaman Login (/login)
  if (pathname === '/login') {
    if (session) {
      // Jika sudah login, langsung arahkan ke Dashboard Admin
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    // Jika belum login, izinkan akses ke halaman login
    return NextResponse.next();
  }

  // 3. Normalisasi /admin/login jika ada yang mencoba mengaksesnya
  if (pathname === '/admin/login') {
    if (session) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 4. Proteksi Seluruh Rute Admin (/admin dan /admin/*)
  if (pathname.startsWith('/admin')) {
    // Jika sesi tidak valid atau belum login:
    // STEALTH MODE: JANGAN redirect ke /login, JANGAN 401/403.
    // Rewrite ke 404 Not Found resmi agar keberadaan portal admin tidak bocor ke publik.
    if (!session) {
      return NextResponse.rewrite(new URL('/not-found', req.url), {
        status: 404
      });
    }

    // Role-based protection check jika diperlukan di masa depan
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login'
  ]
};

