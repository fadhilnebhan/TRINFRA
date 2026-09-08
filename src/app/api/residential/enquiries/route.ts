import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { listingId, name, email, phone, message } = body;

    if (!listingId) {
      return NextResponse.json({ success: false, error: 'Listing ID is required' }, { status: 400 });
    }
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Valid full name is required' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email address is required' }, { status: 400 });
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
      return NextResponse.json({ success: false, error: 'Valid phone number is required' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json({ success: false, error: 'Enquiry message must be at least 5 characters' }, { status: 400 });
    }

    // Verify listing exists
    const listing = await prisma.residentialListing.findUnique({
      where: { id: listingId },
      include: {
        seller: {
          select: { id: true, email: true, fullName: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ success: false, error: 'Residential property not found' }, { status: 404 });
    }

    // Check optional authenticated buyer
    const authUser = await getAuthenticatedUser();
    const buyerId = authUser?.userId || null;

    // Create enquiry in PostgreSQL
    const enquiry = await prisma.residentialEnquiry.create({
      data: {
        listingId,
        buyerId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        message: message.trim(),
        status: 'NEW',
      },
    });

    // Create In-App Notification for seller
    try {
      await prisma.notification.create({
        data: {
          type: 'enquiry_received',
          title: `New Enquiry on ${listing.title}`,
          message: `${name.trim()} (${phone.trim()}) sent an enquiry: "${message.trim().substring(0, 80)}..."`,
          recipientId: listing.sellerId,
          reference: enquiry.id,
        },
      });
    } catch (notifErr) {
      console.warn('Failed to insert in-app notification:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Enquiry submitted successfully. The property owner will contact you shortly.',
      enquiryId: enquiry.id,
    });
  } catch (error) {
    console.error('Error in POST /api/residential/enquiries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit enquiry' },
      { status: 500 }
    );
  }
}
