import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { get, put } from '@vercel/blob';
import type { AccountUser } from './account-session';

const options = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const duplicate = 'An account with this email already exists.';

export function normalizeAccountEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(email) ? email : null;
}

export function validAccountPassword(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 10 && Buffer.byteLength(value, 'utf8') <= 256;
}

function accountId(email: string) { return createHash('sha256').update(`email:${email}`).digest('hex'); }
export function emailAccountPath(email: string, environment = process.env.VERCEL_ENV) {
  return `accounts/${environment === 'preview' ? 'preview-v1' : 'v1'}/${accountId(email)}.json`;
}
function pathname(email: string) { return emailAccountPath(email); }

async function passwordDigest(password: string, salt: Buffer): Promise<Buffer> {
  return await new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, 64, options, (error, value) => error ? reject(error) : resolve(value));
  });
}

type EmailRecord = { id: string; provider: 'email'; email: string; name: string; salt: string; passwordHash: string };

async function readRecord(email: string): Promise<EmailRecord | null> {
  const blob = await get(pathname(email), { access: 'private', useCache: false });
  if (!blob) return null;
  if (blob.statusCode !== 200 || !blob.stream || (blob.blob.size || 0) > 4096) throw new Error('Invalid account record');
  const record = await new Response(blob.stream).json() as EmailRecord;
  if (record.provider !== 'email' || record.id !== accountId(email) || record.email !== email ||
      typeof record.name !== 'string' || !record.name.trim() || record.name.length > 50 ||
      /[\p{Cc}\p{Cf}]/u.test(record.name) || !/^[a-f0-9]{32}$/.test(record.salt) ||
      !/^[a-f0-9]{128}$/.test(record.passwordHash)) throw new Error('Invalid account record');
  return record;
}

function publicUser(record: EmailRecord): AccountUser {
  return { id: record.id, provider: 'email', email: record.email, name: record.name };
}

export async function createEmailAccount(email: string, password: string): Promise<AccountUser> {
  if (await readRecord(email)) throw new Error(duplicate);
  const salt = randomBytes(16);
  const record: EmailRecord = {
    id: accountId(email), provider: 'email', email,
    name: email.split('@')[0].slice(0, 50), salt: salt.toString('hex'),
    passwordHash: (await passwordDigest(password, salt)).toString('hex'),
  };
  try {
    await put(pathname(email), JSON.stringify({ ...record, createdAt: new Date().toISOString() }), {
      access: 'private', addRandomSuffix: false, allowOverwrite: false,
      contentType: 'application/json', cacheControlMaxAge: 60,
    });
  } catch (error) {
    if (await readRecord(email)) throw new Error(duplicate);
    throw error;
  }
  return publicUser(record);
}

export async function verifyEmailAccount(email: string, password: string): Promise<AccountUser | null> {
  const record = await readRecord(email);
  const salt = record ? Buffer.from(record.salt, 'hex') : Buffer.alloc(16);
  const computed = await passwordDigest(password, salt);
  const expected = record ? Buffer.from(record.passwordHash, 'hex') : Buffer.alloc(64);
  return timingSafeEqual(computed, expected) && record ? publicUser(record) : null;
}

export async function findEmailAccount(email: string): Promise<AccountUser | null> {
  const record = await readRecord(email);
  return record ? publicUser(record) : null;
}

export async function updateEmailAccountName(email: string, name: string): Promise<AccountUser | null> {
  const record = await readRecord(email);
  if (!record) return null;
  const updated = { ...record, name, updatedAt: new Date().toISOString() };
  await put(pathname(email), JSON.stringify(updated), {
    access: 'private', addRandomSuffix: false, allowOverwrite: true,
    contentType: 'application/json', cacheControlMaxAge: 60,
  });
  return publicUser(updated);
}
