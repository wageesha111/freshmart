import { NextResponse } from 'next/server';
import { DEMO_USERS, isDemoLoginEnabled } from '@/lib/auth-store';
import { setCustomerSession } from '@/lib/session';

/** One-click demo login for portfolio visitors. Disabled in production unless ENABLE_DEMO_LOGIN=true. */
export async function POST(request: Request) {
  if (!isDemoLoginEnabled()) {
    return NextResponse.json(
      { success: false, code: 'DEMO_DISABLED', error: 'Demo login is disabled on this site.' },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const demo = DEMO_USERS.find((u) => u.email === body.email);
  if (!demo) {
    return NextResponse.json({ success: false, error: 'Unknown demo profile' }, { status: 400 });
  }

  return setCustomerSession(
    NextResponse.json({ success: true, data: { name: demo.name, email: demo.email } }),
    demo
  );
}
