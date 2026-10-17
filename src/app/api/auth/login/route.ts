import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { inMemoryUsers } from '@/lib/auth-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter both email and password' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check Supabase users table if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbUser, error } = await supabase
          .from('users')
          .select('id, name, email, password')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (!error && dbUser) {
          if (dbUser.password !== password) {
            return NextResponse.json(
              {
                success: false,
                code: 'INVALID_PASSWORD',
                error: 'Incorrect password! Please check your password and try again.',
              },
              { status: 401 }
            );
          }

          return NextResponse.json({
            success: true,
            data: { id: dbUser.id, name: dbUser.name, email: dbUser.email },
            message: `Welcome back, ${dbUser.name}!`,
          });
        }
      } catch (err) {
        console.warn('Supabase login check warning, proceeding to memory store:', err);
      }
    }

    // 2. Check memory store
    const localUser = inMemoryUsers.get(cleanEmail);
    if (!localUser) {
      return NextResponse.json(
        {
          success: false,
          code: 'USER_NOT_FOUND',
          error: `No account found with this email (${cleanEmail}). Please sign up first!`,
        },
        { status: 404 }
      );
    }

    if (localUser.password !== password) {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_PASSWORD',
          error: 'Incorrect password! Please check your password and try again.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: localUser.id, name: localUser.name, email: localUser.email },
      message: `Welcome back, ${localUser.name}!`,
    });
  } catch (error: any) {
    console.error('API /api/auth/login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
