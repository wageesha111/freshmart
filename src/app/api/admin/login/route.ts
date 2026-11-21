import { NextResponse } from 'next/server';
import { checkAdminPassword, setAdminSession } from '@/lib/session';

// Very small in-memory throttle against password guessing (per server instance).
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function clientKey(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
}

export async function POST(request: Request) {
  const key = clientKey(request);
  const now = Date.now();
  const entry = attempts.get(key);
  if (entry && now - entry.first < WINDOW_MS && entry.count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { success: false, error: 'Too many attempts. Please wait 15 minutes and try again.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === 'string' ? body.password.trim() : '';
  const result = checkAdminPassword(password);

  if (result === 'not_configured') {
    return NextResponse.json(
      { success: false, error: 'Admin access is not configured. Set ADMIN_PASSWORD in your environment variables.' },
      { status: 503 }
    );
  }

  if (result !== 'ok') {
    if (!entry || now - entry.first >= WINDOW_MS) attempts.set(key, { count: 1, first: now });
    else entry.count += 1;
    return NextResponse.json(
      { success: false, error: 'Access denied: Invalid business owner passcode.' },
      { status: 401 }
    );
  }

  attempts.delete(key);
  return setAdminSession(NextResponse.json({ success: true }), body.remember !== false);
}
