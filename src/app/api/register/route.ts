import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';

// Generate sequential or timestamped reference number: TRI-2026-XXXXX
async function generateLandownerRef(): Promise<string> {
  const count = await prisma.landowner.count();
  const nextNum = (count + 1).toString().padStart(5, '0');
  const year = new Date().getFullYear();
  return `TRI-${year}-${nextNum}`;
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

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'storage', 'documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
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

          if (doc.dataUri && doc.dataUri.includes(',')) {
            const base64Data = doc.dataUri.split(',')[1];
            fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
          } else {
            // Write placeholder record for demo
            fs.writeFileSync(filePath, Buffer.from('TRINFRA Protected Document Record'));
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
