import { NextResponse } from 'next/server';
import { supabaseAdmin, useMemoryFallback, MISSING_SERVICE_KEY_ERROR } from '@/lib/supabase';
import { inMemoryUsers } from '@/lib/auth-store';
import { hashPassword, needsRehash, verifyPassword } from '@/lib/password';
import { setCustomerSession } from '@/lib/session';

const notFound = (email: string) =>
  NextResponse.json(
    {
      success: false,
      code: 'USER_NOT_FOUND',
      error: `No account found with this email (${email}). Please sign up first!`,
    },
    { status: 404 }
  );

const invalidPassword = () =>
  NextResponse.json(
    {
      success: false,
      code: 'INVALID_PASSWORD',
      error: 'Incorrect password! Please check your password and try again.',
    },
    { status: 401 }
  );

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email.trim() || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter both email and password' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Supabase (server-side, service role key)
    if (supabaseAdmin) {
      const { data: dbUser, error } = await supabaseAdmin
        .from('users')
        .select('id, name, email, password')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (error) {
        console.error('Supabase login lookup error:', error);
        return NextResponse.json({ success: false, error: 'Login failed. Please try again.' }, { status: 500 });
      }

      if (!dbUser) return notFound(cleanEmail);
      if (!(await verifyPassword(password, dbUser.password))) return invalidPassword();

      // Upgrade legacy plain-text passwords to a hash on successful login
      if (needsRehash(dbUser.password)) {
        const { error: rehashError } = await supabaseAdmin
          .from('users')
          .update({ password: await hashPassword(password) })
          .eq('id', dbUser.id);
        if (rehashError) console.warn('Could not upgrade legacy password hash:', rehashError.message);
      }

      const user = { id: dbUser.id, name: dbUser.name, email: dbUser.email };
      return setCustomerSession(
        NextResponse.json({ success: true, data: { name: user.name, email: user.email }, message: `Welcome back, ${user.name}!` }),
        user
      );
    }

    if (!useMemoryFallback) {
      return NextResponse.json({ success: false, error: MISSING_SERVICE_KEY_ERROR }, { status: 500 });
    }

    // 2. Local demo mode (no Supabase configured)
    const localUser = inMemoryUsers.get(cleanEmail);
    if (!localUser) return notFound(cleanEmail);
    if (!(await verifyPassword(password, localUser.passwordHash))) return invalidPassword();

    return setCustomerSession(
      NextResponse.json({
        success: true,
        data: { name: localUser.name, email: localUser.email },
        message: `Welcome back, ${localUser.name}!`,
      }),
      localUser
    );
  } catch (error: any) {
    console.error('API /api/auth/login error:', error);
    return NextResponse.json({ success: false, error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
