import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, signSession, setUserSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const passwordMatch = verifyPassword(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Role check: Seller or Admin can login to seller portal
    if (user.role !== 'SELLER' && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, error: 'Access restricted to sellers and administrators' },
        { status: 403 }
      );
    }

    const token = signSession({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
    await setUserSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        companyName: user.companyName,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/seller/auth/login:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sign in' },
      { status: 500 }
    );
  }
}
