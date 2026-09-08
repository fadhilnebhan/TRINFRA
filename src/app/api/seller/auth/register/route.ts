import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signSession, setUserSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, password, confirmPassword, companyName } = body;

    // Validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Full name is required (min 2 characters)' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email address is required' }, { status: 400 });
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
      return NextResponse.json({ success: false, error: 'Valid phone number is required' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters long' }, { status: 400 });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'Passwords do not match' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate account
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // Create seller
    const passwordHash = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        companyName: companyName?.trim() || null,
        passwordHash,
        role: 'SELLER',
      },
    });

    // Sign session and set cookie
    const token = signSession({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
    await setUserSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Seller account registered successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        companyName: user.companyName,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/seller/auth/register:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register seller account' },
      { status: 500 }
    );
  }
}
