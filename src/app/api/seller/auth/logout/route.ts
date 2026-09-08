import { NextResponse } from 'next/server';
import { clearUserSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  await clearUserSessionCookie();
  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });
}
