import { NextResponse } from 'next/server';
import { clearCustomerSession } from '@/lib/session';

export async function POST() {
  return clearCustomerSession(NextResponse.json({ success: true }));
}
