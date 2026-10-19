import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { inMemoryUsers } from '@/lib/auth-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = supabaseAdmin || supabase;

    if (isSupabaseConfigured && client) {
      const { data, error } = await client
        .from('users')
        .select('id, name, email, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return NextResponse.json({
          success: true,
          count: data.length,
          data,
        });
      }

      if (error) {
        console.warn('Supabase users query warning:', error);
      }
    }

    // Fallback to in-memory store
    const fallbackList = Array.from(inMemoryUsers.values()).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      created_at: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      count: fallbackList.length,
      data: fallbackList,
    });
  } catch (err: any) {
    console.error('Error fetching users:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
