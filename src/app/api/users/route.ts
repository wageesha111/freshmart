import { NextResponse } from 'next/server';
import { supabaseAdmin, useMemoryFallback, MISSING_SERVICE_KEY_ERROR } from '@/lib/supabase';
import { inMemoryUsers } from '@/lib/auth-store';
import { forbiddenAdmin, isAdmin } from '@/lib/session';

export const dynamic = 'force-dynamic';

// GET /api/users -> registered customers (admin only). Never returns passwords.
export async function GET(request: Request) {
  if (!isAdmin(request)) return forbiddenAdmin();

  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, name, email, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ success: true, count: data.length, data });
    }

    if (!useMemoryFallback) {
      return NextResponse.json({ success: false, error: MISSING_SERVICE_KEY_ERROR }, { status: 500 });
    }

    const list = Array.from(inMemoryUsers.values()).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      created_at: new Date().toISOString(),
    }));
    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    console.error('Error fetching users:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}
