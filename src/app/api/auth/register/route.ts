import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { inMemoryUsers } from '@/lib/auth-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existingUser) {
          return NextResponse.json(
            {
              success: false,
              code: 'USER_EXISTS',
              error: 'An account with this email already exists. Please sign in instead.',
            },
            { status: 409 }
          );
        }

        const newId = `u-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const { data: inserted, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: newId,
              name: name.trim(),
              email: cleanEmail,
              password: password,
            },
          ])
          .select('id, name, email')
          .single();

        if (!insertError && inserted) {
          inMemoryUsers.set(cleanEmail, {
            id: newId,
            name: name.trim(),
            email: cleanEmail,
            password: password,
          });

          return NextResponse.json(
            {
              success: true,
              data: { id: inserted.id, name: inserted.name, email: inserted.email },
              message: 'Account created successfully!',
            },
            { status: 201 }
          );
        }
      } catch (err) {
        console.warn('Supabase users check warning, proceeding with memory store:', err);
      }
    }

    // Memory / Local fallback
    if (inMemoryUsers.has(cleanEmail)) {
      return NextResponse.json(
        {
          success: false,
          code: 'USER_EXISTS',
          error: 'An account with this email already exists. Please sign in instead.',
        },
        { status: 409 }
      );
    }

    const newId = `u-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newUser = {
      id: newId,
      name: name.trim(),
      email: cleanEmail,
      password: password,
    };
    inMemoryUsers.set(cleanEmail, newUser);

    return NextResponse.json(
      {
        success: true,
        data: { id: newUser.id, name: newUser.name, email: newUser.email },
        message: 'Account created successfully!',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API /api/auth/register error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
