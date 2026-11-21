import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = getCustomerSession(request);
  return NextResponse.json({
    success: true,
    data: session ? { name: session.name, email: session.email } : null,
  });
}
