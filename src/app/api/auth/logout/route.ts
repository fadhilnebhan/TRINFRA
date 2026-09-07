import { NextResponse } from 'next/server';
import { clearAdminSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
  await clearAdminSessionCookie();
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}
