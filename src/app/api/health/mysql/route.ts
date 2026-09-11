import { NextResponse } from 'next/server';
import { mysqlAdapter } from '@/lib/db/mysql';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const shouldInit = url.searchParams.get('init') === 'true';

    if (shouldInit && mysqlAdapter.isConfigured()) {
      try {
        await mysqlAdapter.initSchema();
      } catch (initErr) {
        console.warn('[Health Check] initSchema warning:', initErr);
      }
    }

    const testResult = await mysqlAdapter.testConnection();

    const statusCode = testResult.connected ? 200 : testResult.configured ? 503 : 200;

    return NextResponse.json(
      {
        status: testResult.connected ? 'HEALTHY' : testResult.configured ? 'UNHEALTHY' : 'NOT_CONFIGURED',
        timestamp: new Date().toISOString(),
        driver: process.env.DATABASE_DRIVER || 'mysql',
        ...testResult
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
        error: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}

