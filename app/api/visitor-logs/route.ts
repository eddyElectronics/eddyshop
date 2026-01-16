import { NextRequest, NextResponse } from 'next/server';
import { addVisitorLog, getVisitorLogs, getVisitorStats } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Parse user agent to get device info
function parseUserAgent(ua: string | null): {
  deviceType: string;
  browser: string;
  os: string;
} {
  if (!ua) {
    return { deviceType: 'Unknown', browser: 'Unknown', os: 'Unknown' };
  }

  // Device type detection
  let deviceType = 'Desktop';
  if (/mobile/i.test(ua)) {
    deviceType = 'Mobile';
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = 'Tablet';
  }

  // Browser detection
  let browser = 'Unknown';
  if (/edg/i.test(ua)) {
    browser = 'Edge';
  } else if (/chrome/i.test(ua)) {
    browser = 'Chrome';
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browser = 'Safari';
  } else if (/firefox/i.test(ua)) {
    browser = 'Firefox';
  } else if (/opera|opr/i.test(ua)) {
    browser = 'Opera';
  }

  // OS detection
  let os = 'Unknown';
  if (/windows/i.test(ua)) {
    os = 'Windows';
  } else if (/macintosh|mac os/i.test(ua)) {
    os = 'macOS';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  } else if (/android/i.test(ua)) {
    os = 'Android';
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = 'iOS';
  }

  return { deviceType, browser, os };
}

// POST - Log a new visit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get('user-agent');
    const referrer = request.headers.get('referer') || body.referrer || null;
    
    // Get IP address from headers (for proxied requests)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? (forwarded.split(',')[0] ?? 'unknown').trim() : 
               request.headers.get('x-real-ip') || 
               'unknown';

    const { deviceType, browser, os } = parseUserAgent(userAgent);

    const log = await addVisitorLog({
      ipAddress: ip,
      userAgent: userAgent,
      referrer: referrer,
      pageUrl: body.pageUrl || '/',
      country: null, // Could be populated using a geolocation service
      city: null,
      deviceType,
      browser,
      os,
      sessionId: body.sessionId || null,
    });

    if (!log) {
      return NextResponse.json({ error: 'Failed to log visit' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Visitor log POST error:', error);
    return NextResponse.json({ error: 'Failed to log visit' }, { status: 500 });
  }
}

// GET - Get visitor logs (admin only)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    
    // Get stats
    if (type === 'stats') {
      const stats = await getVisitorStats();
      return NextResponse.json(stats, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      });
    }

    // Get logs with pagination
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const result = await getVisitorLogs({ limit, offset, startDate, endDate });
    
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error) {
    console.error('Visitor log GET error:', error);
    return NextResponse.json({ error: 'Failed to get visitor logs' }, { status: 500 });
  }
}
