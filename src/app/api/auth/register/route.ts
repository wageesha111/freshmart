import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseAdmin, useMemoryFallback, MISSING_SERVICE_KEY_ERROR } from '@/lib/supabase';
import { inMemoryUsers } from '@/lib/auth-store';
import { hashPassword } from '@/lib/password';
import { setCustomerSession } from '@/lib/session';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, and password are required' },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address' }, { status: 400 });
    }
    if (password.length < 8 || password.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    if (name.length > 100) {
      return NextResponse.json({ success: false, error: 'Name is too long' }, { status: 400 });
    }

    const exists = NextResponse.json(
      {
        success: false,
        code: 'USER_EXISTS',
        error: 'An account with this email already exists. Please sign in instead.',
      },
      { status: 409 }
    );

    const newUser = { id: `u-${randomUUID()}`, name, email };
    const passwordHash = await hashPassword(password);

    if (supabaseAdmin) {
      const { data: existing, error: lookupError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (lookupError) throw lookupError;
      if (existing) return exists;

      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert([{ ...newUser, password: passwordHash }]);

      if (insertError) {
        // 23505 = unique violation (race with another sign-up)
        if ((insertError as any).code === '23505') return exists;
        throw insertError;
      }
    } else if (useMemoryFallback) {
      if (inMemoryUsers.has(email)) return exists;
      inMemoryUsers.set(email, { ...newUser, passwordHash });
    } else {
      return NextResponse.json({ success: false, error: MISSING_SERVICE_KEY_ERROR }, { status: 500 });
    }

    return setCustomerSession(
      NextResponse.json(
        { success: true, data: { name, email }, message: 'Account created successfully!' },
        { status: 201 }
      ),
      newUser
    );
  } catch (error: any) {
    console.error('API /api/auth/register error:', error);
    return NextResponse.json({ success: false, error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
