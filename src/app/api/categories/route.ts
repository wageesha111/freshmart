import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { CATEGORIES } from '@/data/products';

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) {
        console.error('Supabase categories fetch error:', error);
        throw error;
      }
      return NextResponse.json({ success: true, count: data?.length || 0, data: data || [] });
    }

    // Local fallback
    return NextResponse.json({ success: true, count: CATEGORIES.length, data: CATEGORIES });
  } catch (error: any) {
    console.error('API /api/categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
