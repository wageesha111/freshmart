import { NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/session';

export async function POST() {
  return clearAdminSession(NextResponse.json({ success: true }));
}
