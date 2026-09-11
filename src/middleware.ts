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
    if (session && session.role) {
      // Jika sudah login, langsung arahkan ke Direktori Peserta
      return NextResponse.redirect(new URL('/admin/guests', req.url));
    }
    // Jika belum login, izinkan akses ke halaman login
    return NextResponse.next();
  }

  // 3. Normalisasi /admin/login jika ada yang mencoba mengaksesnya
  if (pathname === '/admin/login') {
    if (session && session.role) {
      return NextResponse.redirect(new URL('/admin/guests', req.url));
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 4. URL /admin tidak boleh menampilkan dashboard dan tidak boleh redirect ke login -> WAJIB 404
  if (pathname === '/admin' || pathname === '/admin/') {
    return NextResponse.rewrite(new URL('/not-found', req.url), {
      status: 404
    });
  }

  // 5. Proteksi Seluruh Rute Admin (/admin/*)
  // 5. Proteksi API Routes yang sensitif (/api/guests, /api/export, /api/checkin, /api/stats)
  const isProtectedApi =
    pathname.startsWith('/api/guests') ||
    pathname.startsWith('/api/export') ||
    pathname.startsWith('/api/checkin') ||
    pathname === '/api/stats';

  if (isProtectedApi) {
    const validRoles = ['admin', 'superadmin', 'SUPER_ADMIN', 'PANITIA_GATE', 'PANITIA_AKOMODASI'];
    if (!session || !validRoles.includes(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Sesi panitia tidak valid atau telah berakhir.' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 6. Proteksi Seluruh Rute Admin (/admin/*)
  if (pathname.startsWith('/admin/')) {
    // /admin/scanner, /admin/guests, /admin/monitoring, /admin/checkin, /admin/allocation, /admin/placement
    const allowedAdminRoutes = [
      '/admin/scanner',
      '/admin/guests',
      '/admin/monitoring',
      '/admin/checkin',
      '/admin/allocation',
      '/admin/placement',
      '/admin/dashboard',
      '/admin/website'
    ];

    const isAllowed = allowedAdminRoutes.some(
      route => pathname === route || pathname.startsWith(route + '/')
    );

    if (!isAllowed) {
      return NextResponse.rewrite(new URL('/not-found', req.url), {
        status: 404
      });
    }

    // Role validation: Hanya role panitia resmi yang diizinkan
    const validRoles = ['admin', 'superadmin', 'SUPER_ADMIN', 'PANITIA_GATE', 'PANITIA_AKOMODASI'];
    if (!session || !validRoles.includes(session.role)) {
      return NextResponse.rewrite(new URL('/not-found', req.url), {
        status: 404
      });
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/api/guests/:path*',
    '/api/export/:path*',
    '/api/checkin/:path*',
    '/api/stats'
  ]
};

