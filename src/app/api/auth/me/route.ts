import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';

export async function GET() {
  const session = await getAuthenticatedAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      email: session.email,
      fullName: session.fullName,
      role: session.role,
    },
  });
}
