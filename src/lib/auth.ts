import crypto from 'crypto';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const SESSION_COOKIE_NAME = 'trinfra_admin_session';
const USER_SESSION_COOKIE_NAME = 'trinfra_user_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'trinfra_demo_secret_session_2026_fallback';

export interface AdminSession {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  exp: number;
}

export interface UserSession {
  userId: string;
  email: string;
  fullName: string;
  role: string; // 'ADMIN' | 'SELLER' | 'BUYER'
  exp: number;
}

/**
 * Sign payload using HMAC-SHA256
 */
export function signSession(payload: Omit<UserSession, 'exp'>, expiresInHours = 24): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const data: UserSession = { ...payload, exp };
  const json = JSON.stringify(data);
  const base64Data = Buffer.from(json).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(base64Data)
    .digest('base64url');
  return `${base64Data}.${signature}`;
}

/**
 * Verify and decode session token
 */
export function verifySession(token: string): UserSession | null {
  try {
    const [base64Data, signature] = token.split('.');
    if (!base64Data || !signature) return null;

    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(base64Data)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const json = Buffer.from(base64Data, 'base64url').toString('utf8');
    const session: UserSession = JSON.parse(json);

    // Check expiration
    if (session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Get currently authenticated admin from Next.js server context
 */
export async function getAuthenticatedAdmin(): Promise<AdminSession | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) return null;
  const session = verifySession(sessionCookie.value);
  if (!session) return null;
  if (session.role === 'ADMIN' || session.role === 'SUPERADMIN') {
    return session;
  }
  return null;
}

/**
 * Get currently authenticated user (Admin, Seller, or Buyer)
 */
export async function getAuthenticatedUser(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const userCookie = cookieStore.get(USER_SESSION_COOKIE_NAME);
  if (userCookie?.value) {
    const session = verifySession(userCookie.value);
    if (session) return session;
  }

  // Also allow admin session as fallback
  const adminCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (adminCookie?.value) {
    const session = verifySession(adminCookie.value);
    if (session) return session;
  }

  return null;
}

/**
 * Get authenticated seller or admin
 */
export async function getAuthenticatedSeller(): Promise<UserSession | null> {
  const user = await getAuthenticatedUser();
  if (!user) return null;
  if (user.role === 'SELLER' || user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
    return user;
  }
  return null;
}

/**
 * Set admin session cookie in Next.js server context
 */
export async function setAdminSessionCookie(sessionToken: string) {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 3600, // 24 hours
  });
}

/**
 * Clear admin session cookie (logout)
 */
export async function clearAdminSessionCookie() {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Set user/seller session cookie
 */
export async function setUserSessionCookie(sessionToken: string) {
  const cookieStore = cookies();
  cookieStore.set(USER_SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 3600, // 7 days
  });
}

/**
 * Clear user/seller session cookie
 */
export async function clearUserSessionCookie() {
  const cookieStore = cookies();
  cookieStore.set(USER_SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Verify plaintext password against bcrypt hash
 */
export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

/**
 * Hash password with bcrypt
 */
export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

