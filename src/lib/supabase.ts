import { createClient } from '@supabase/supabase-js';

// NOTE: This module is only imported from API routes (server side).
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
// Strip trailing /rest/v1 or slashes if present from the dashboard URL
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
export const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
export const supabaseServiceKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  ''
).trim();

const hasUrl = Boolean(supabaseUrl && !supabaseUrl.includes('your-project-ref'));

/** True when a Supabase project URL plus at least one key is set. */
export const isSupabaseConfigured = Boolean(hasUrl && (supabaseAnonKey || supabaseServiceKey));

/**
 * Public (anon) client. With the locked-down RLS policies in supabase/schema.sql
 * it can only READ products and categories. Use it for public catalogue reads.
 */
export const supabase =
  hasUrl && (supabaseAnonKey || supabaseServiceKey)
    ? createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey, {
        auth: { persistSession: false },
      })
    : null;

/**
 * Server-only admin client (service role key, bypasses RLS).
 * Required for users, orders, order items, inquiries and product writes.
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser (no NEXT_PUBLIC_ prefix).
 */
export const supabaseAdmin =
  hasUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
    : null;

/**
 * When Supabase is not configured at all we run on in-memory data (local demo mode).
 * When Supabase IS configured but the service key is missing, private data can't be
 * accessed safely, so routes should fail loudly instead of silently using memory.
 */
export const useMemoryFallback = !isSupabaseConfigured;

export const MISSING_SERVICE_KEY_ERROR =
  'Server misconfigured: SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your environment variables.';

export default supabase;
