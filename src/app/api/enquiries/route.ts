import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function generateEnquiryRef(): Promise<string> {
  const count = await prisma.developerEnquiry.count();
  const nextNum = (count + 1).toString().padStart(5, '0');
  const year = new Date().getFullYear();
  return `TRI-ENQ-${year}-${nextNum}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      fullName,
      company,
      phone,
      email,
      role = 'developer',
      interest,
      interestType,
      opportunityId,
      projectId,
      investmentRange,
      preferredContactMethod = 'Phone',
      preferredLocation,
      message,
    } = body;

    const contactName = (fullName || name || '').trim();
    if (!contactName) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }
    if (!phone?.trim()) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const refNumber = await generateEnquiryRef();

    const enquiry = await prisma.$transaction(async (tx) => {
      const rec = await tx.developerEnquiry.create({
        data: {
          referenceNumber: refNumber,
          fullName: contactName,
          company: (company || 'Independent Investor/Developer').trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          preferredContactMethod: preferredContactMethod || 'Phone',
          role: role || 'developer',
          interestType: interestType || interest || 'request_info',
          investmentRange: investmentRange || 'Flexible',
          preferredLocation: preferredLocation || null,
          message: message || 'Interested in exploring land-pooling partnership.',
          opportunityId: opportunityId || null,
          projectId: projectId || null,
          status: 'NEW',
          priority: 'NORMAL',
        },
      });

      // Create Admin Notification
      await tx.notification.create({
        data: {
          type: 'enquiry_received',
          title: 'New Developer/Investor Enquiry',
          message: `${rec.fullName} (${rec.company}) submitted an expression of interest.`,
          reference: refNumber,
          read: false,
        },
      });

      return rec;
    });

    return NextResponse.json({
      success: true,
      referenceNumber: enquiry.referenceNumber,
      id: enquiry.id,
    });
  } catch (error) {
    console.error('Enquiry API error:', error);
    return NextResponse.json(
      { error: 'Failed to record developer enquiry in database' },
      { status: 500 }
    );
  }
}
