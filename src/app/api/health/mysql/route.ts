import { NextRequest, NextResponse } from 'next/server';
import { mysqlAdapter } from '@/lib/db/mysql';
import { verifySessionToken } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const shouldInit = url.searchParams.get('init') === 'true';

    // Inisialisasi skema hanya boleh dipanggil oleh Super Admin
    if (shouldInit) {
      const sessionCookie = req.cookies.get('tni_session')?.value || req.cookies.get('session_token')?.value;
      const session = sessionCookie ? verifySessionToken(sessionCookie) : null;
      const roleStr = (session?.role || '') as string;
      if (!session || (roleStr !== 'admin' && roleStr !== 'superadmin' && roleStr !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Akses ditolak: Inisialisasi skema membutuhkan hak akses Super Admin.' }, { status: 401 });
      }

      if (mysqlAdapter.isConfigured()) {
        try {
          await mysqlAdapter.initSchema();
        } catch (initErr) {
          console.warn('[Health Check] initSchema warning:', initErr);
        }
      }
    }

    const testResult = await mysqlAdapter.testConnection();
    const statusCode = testResult.connected ? 200 : testResult.configured ? 503 : 200;

    // Sanitasi: Jangan ekspos host, user, password, dan nama database ke publik
    return NextResponse.json(
      {
        status: testResult.connected ? 'HEALTHY' : testResult.configured ? 'UNHEALTHY' : 'NOT_CONFIGURED',
        timestamp: new Date().toISOString(),
        driver: process.env.DATABASE_DRIVER || 'mysql',
        connected: testResult.connected,
        configured: testResult.configured,
        recordCount: testResult.recordCount,
        tablesCount: testResult.tables?.length || 0
      },
      {
        status: statusCode,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        connected: false,
        error: 'Pengecekan koneksi database gagal.'
      },
      { status: 500 }
    );
  }
}

