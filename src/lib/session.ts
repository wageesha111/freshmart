import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';

export const CUSTOMER_COOKIE = 'fm_session';
export const ADMIN_COOKIE = 'fm_admin';
const WEEK_SECONDS = 60 * 60 * 24 * 7;

export interface CustomerSession {
  role: 'customer';
  sub: string;
  email: string;
  name: string;
  exp: number;
}

export interface AdminSession {
  role: 'admin';
  exp: number;
}

type Session = CustomerSession | AdminSession;

// ---------------------------------------------------------------------------
// Secret handling
// ---------------------------------------------------------------------------
const globalForSecret = globalThis as unknown as { __fmDevSessionSecret?: string };

function getSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set (at least 32 characters) in production.');
  }
  // Development only: random per-process secret (sessions reset on restart).
  if (!globalForSecret.__fmDevSessionSecret) {
    globalForSecret.__fmDevSessionSecret = randomBytes(32).toString('hex');
    console.warn('[freshmart] SESSION_SECRET not set; using a temporary development secret.');
  }
  return globalForSecret.__fmDevSessionSecret;
}

// ---------------------------------------------------------------------------
// Token sign / verify (HMAC-SHA256, base64url)
// ---------------------------------------------------------------------------
function sign(payload: Session): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', getSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verify<T extends Session>(token: string | undefined, role: T['role']): T | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;

  const expected = createHmac('sha256', getSecret()).update(body).digest();
  let given: Buffer;
  try {
    given = Buffer.from(sig, 'base64url');
  } catch {
    return null;
  }
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Session;
    if (payload.role !== role) return null;
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload as T;
  } catch {
    return null;
  }
}

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('cookie');
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

function cookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

// ---------------------------------------------------------------------------
// Customer sessions
// ---------------------------------------------------------------------------
export function getCustomerSession(request: Request): CustomerSession | null {
  return verify<CustomerSession>(readCookie(request, CUSTOMER_COOKIE), 'customer');
}

export function setCustomerSession(
  res: NextResponse,
  user: { id: string; email: string; name: string }
): NextResponse {
  const token = sign({
    role: 'customer',
    sub: user.id,
    email: user.email.toLowerCase().trim(),
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + WEEK_SECONDS,
  });
  res.cookies.set(CUSTOMER_COOKIE, token, cookieOptions(WEEK_SECONDS));
  return res;
}

export function clearCustomerSession(res: NextResponse): NextResponse {
  res.cookies.set(CUSTOMER_COOKIE, '', cookieOptions(0));
  return res;
}

// ---------------------------------------------------------------------------
// Admin sessions
// ---------------------------------------------------------------------------
export function isAdmin(request: Request): boolean {
  return verify<AdminSession>(readCookie(request, ADMIN_COOKIE), 'admin') !== null;
}

export function setAdminSession(res: NextResponse, remember: boolean): NextResponse {
  const ttl = remember ? WEEK_SECONDS : 60 * 60 * 8; // token validity
  const token = sign({ role: 'admin', exp: Math.floor(Date.now() / 1000) + ttl });
  // "Remember this device" = persistent cookie; otherwise a browser-session cookie.
  res.cookies.set(ADMIN_COOKIE, token, cookieOptions(remember ? ttl : undefined));
  return res;
}

export function clearAdminSession(res: NextResponse): NextResponse {
  res.cookies.set(ADMIN_COOKIE, '', cookieOptions(0));
  return res;
}

/** Constant-time check of the admin password against ADMIN_PASSWORD. */
export function checkAdminPassword(input: string): 'ok' | 'invalid' | 'not_configured' {
  const configured = process.env.ADMIN_PASSWORD?.trim();
  if (!configured) return 'not_configured';
  const a = createHash('sha256').update(input).digest();
  const b = createHash('sha256').update(configured).digest();
  return timingSafeEqual(a, b) ? 'ok' : 'invalid';
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------
export function unauthorized(message = 'Please sign in to continue.') {
  return NextResponse.json({ success: false, code: 'UNAUTHORIZED', error: message }, { status: 401 });
}

export function forbiddenAdmin() {
  return NextResponse.json(
    { success: false, code: 'ADMIN_REQUIRED', error: 'Admin access required.' },
    { status: 401 }
  );
}
