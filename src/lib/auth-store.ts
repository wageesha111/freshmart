// In-memory users store, used ONLY when Supabase is not configured (local demo mode).
// Passwords are stored as scrypt hashes (see lib/password.ts), never in plain text.
export interface AuthUserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

export const inMemoryUsers: Map<string, AuthUserRecord> =
  (globalThis as any).__freshmart_users || new Map();
(globalThis as any).__freshmart_users = inMemoryUsers;

/**
 * Demo profiles for the "Quick Demo" buttons on the sign-in page.
 * They log in via /api/auth/demo (no password), which is only enabled outside
 * production or when ENABLE_DEMO_LOGIN=true.
 */
export const DEMO_USERS = [
  { id: 'u-demo-1', name: 'Kasun Perera', email: 'kasun@example.com' },
  { id: 'u-demo-2', name: 'Nimali Fernando', email: 'nimali@example.com' },
] as const;

export function isDemoLoginEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.ENABLE_DEMO_LOGIN === 'true';
}
