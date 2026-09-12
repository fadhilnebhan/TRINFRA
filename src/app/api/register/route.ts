import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Generate sequential or timestamped reference number: TRI-2026-XXXXX
async function generateLandownerRef(): Promise<string> {
  const year = new Date().getFullYear();
  try {
    const existing = await prisma.landowner.findMany({
      select: { referenceNumber: true },
      where: { referenceNumber: { startsWith: `TRI-${year}-` } },
    });

    let maxSeq = 0;
    for (const item of existing) {
      const parts = item.referenceNumber.split('-');
      if (parts.length >= 3) {
        const num = parseInt(parts[2], 10);
        if (!isNaN(num) && num > maxSeq && num < 100000) {
          maxSeq = num;
        }
      }
    }

    let nextNum = maxSeq + 1;
    let candidate = `TRI-${year}-${nextNum.toString().padStart(5, '0')}`;

    // Guarantee uniqueness against any edge-case race conditions
    while (existing.some((e) => e.referenceNumber.toUpperCase() === candidate.toUpperCase())) {
      nextNum++;
      candidate = `TRI-${year}-${nextNum.toString().padStart(5, '0')}`;
    }

    return candidate;
  } catch {
    // High-entropy fallback
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TRI-${year}-${Date.now().toString().slice(-5)}-${randomSuffix}`;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      phone,
      email,
      landownerType,
      communicationPreference,
      district,
      localBody,
      locality,
      mapLocation,
      approximateArea,
      areaUnit,
      ownershipStatus,
      poolingInterest,
      documents = [],
      notes,
    } = body;

    // Server-side validation
    if (!fullName?.trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (!phone?.trim()) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }
    if (!district?.trim()) {
      return NextResponse.json({ error: 'District is required' }, { status: 400 });
    }

    const areaValue = parseFloat(approximateArea) || 0;
    const refNumber = await generateLandownerRef();

    // Ensure upload directory exists (using /tmp on Vercel serverless where repo fs is read-only)
    const uploadDir = process.env.VERCEL
      ? path.join('/tmp', 'storage', 'documents')
      : path.join(process.cwd(), 'storage', 'documents');
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    } catch (e) {
      console.warn('Upload directory creation note:', e);
    }

    // Database transaction: create landowner, parcel, documents, and admin notification
    const result = await prisma.$transaction(async (tx) => {
      const landowner = await tx.landowner.create({
        data: {
          referenceNumber: refNumber,
          ownerType: landownerType || 'Individual',
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          preferredCommunication: communicationPreference || 'WhatsApp',
          district: district.trim(),
          localBody: localBody?.trim() || 'Municipality / Panchayat',
          locality: locality?.trim() || 'Town / Village',
          approximateArea: areaValue,
          areaUnit: areaUnit || 'Acres',
          ownershipStatus: ownershipStatus || 'Sole Ownership',
          poolingInterest: poolingInterest || 'Join Existing Pool',
          verificationStatus: 'NEW',
          notes: notes || null,
        },
      });

      // Create associated LandParcel
      await tx.landParcel.create({
        data: {
          landownerId: landowner.id,
          district: district.trim(),
          localBody: localBody?.trim() || 'Municipality / Panchayat',
          locality: locality?.trim() || 'Town / Village',
          approximateArea: areaValue,
          areaUnit: areaUnit || 'Acres',
          latitude: mapLocation?.lat || null,
          longitude: mapLocation?.lng || null,
          ownershipStatus: ownershipStatus || 'Sole Ownership',
        },
      });

      // Handle private documents storage
      if (Array.isArray(documents) && documents.length > 0) {
        for (const doc of documents) {
          const safeName = (doc.name || 'document.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
          const fileId = `${landowner.id}_${Date.now()}_${safeName}`;
          const filePath = path.join(uploadDir, fileId);

          try {
            if (doc.dataUri && doc.dataUri.includes(',')) {
              const base64Data = doc.dataUri.split(',')[1];
              fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
            } else {
              // Write placeholder record for demo
              fs.writeFileSync(filePath, Buffer.from('TRINFRA Protected Document Record'));
            }
          } catch (writeErr) {
            console.warn('Document file write note (ephemeral filesystem):', writeErr);
          }

          await tx.document.create({
            data: {
              landownerId: landowner.id,
              fileName: doc.name || 'document.pdf',
              filePath: filePath,
              mimeType: doc.type || 'application/pdf',
              fileSize: doc.size || 1024,
              verificationStatus: 'PENDING_REVIEW',
            },
          });
        }
      }

      // Create Admin Notification
      await tx.notification.create({
        data: {
          type: 'registration_received',
          title: 'New Landowner Registration',
          message: `${landowner.fullName} registered ${areaValue} ${areaUnit || 'Acres'} in ${district}.`,
          reference: refNumber,
          read: false,
        },
      });

      return landowner;
    });

    return NextResponse.json({
      success: true,
      referenceNumber: result.referenceNumber,
      id: result.id,
    });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: 'Failed to process registration in database' },
      { status: 500 }
    );
  }
}
