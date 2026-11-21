import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const KEY_LEN = 64;
const PREFIX = 'scrypt';

/** Hash a password as `scrypt$<saltHex>$<hashHex>`. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEY_LEN);
  return `${PREFIX}$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function isHashed(stored: string | null | undefined): boolean {
  return typeof stored === 'string' && stored.startsWith(`${PREFIX}$`);
}

/**
 * Verify a password. Also accepts legacy plain-text values (from before hashing
 * was added) so existing accounts keep working; callers should re-hash those
 * (see `needsRehash`).
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored) return false;
  if (isHashed(stored)) {
    const [, saltHex, hashHex] = stored.split('$');
    if (!saltHex || !hashHex) return false;
    const expected = Buffer.from(hashHex, 'hex');
    const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }
  // Legacy plain-text comparison (constant time)
  const a = Buffer.from(password);
  const b = Buffer.from(stored);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function needsRehash(stored: string): boolean {
  return !isHashed(stored);
}
