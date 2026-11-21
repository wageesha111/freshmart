import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return NextResponse.json({ success: true, admin: isAdmin(request) });
}
