import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

const UPLOAD_DIR = process.env.VERCEL
  ? path.join('/tmp', 'storage', 'documents')
  : path.join(process.cwd(), 'storage', 'documents');

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const landownerId = searchParams.get('landownerId');
    const status = searchParams.get('status');

    const whereClause: {
      landownerId?: string;
      verificationStatus?: string;
    } = {};

    if (landownerId) whereClause.landownerId = landownerId;
    if (status && status !== 'ALL') whereClause.verificationStatus = status;

    const documents = await prisma.document.findMany({
      where: whereClause,
      orderBy: { uploadedAt: 'desc' },
      include: {
        landowner: {
          select: {
            id: true,
            referenceNumber: true,
            fullName: true,
            phone: true,
            district: true,
          },
        },
      },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('List documents error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const landownerId = formData.get('landownerId') as string | null;
    const documentType = (formData.get('documentType') as string) || 'OWNERSHIP';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Verify landowner if provided
    let landownerRef = '';
    let landownerName = '';
    if (landownerId) {
      const lo = await prisma.landowner.findFirst({
        where: {
          OR: [{ id: landownerId }, { referenceNumber: landownerId }],
        },
      });
      if (lo) {
        landownerRef = lo.referenceNumber;
        landownerName = lo.fullName;
      }
    }

    // Ensure local private storage directory exists
    try {
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }
    } catch (e) {
      console.warn('Storage directory creation warning:', e);
    }

    const originalName = file.name || 'document.pdf';
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storedFileName = `${timestamp}_${sanitizedName}`;
    const filePath = path.join(UPLOAD_DIR, storedFileName);

    // Write file to local disk (ephemeral storage on serverless)
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
    } catch (writeErr) {
      console.warn('Document write warning (serverless filesystem):', writeErr);
    }

    // Save metadata to database
    const document = await prisma.document.create({
      data: {
        landownerId: landownerId || null,
        documentType: documentType.toUpperCase(),
        fileName: originalName,
        filePath: filePath,
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size,
        verificationStatus: 'PENDING_REVIEW',
      },
      include: {
        landowner: {
          select: {
            id: true,
            referenceNumber: true,
            fullName: true,
          },
        },
      },
    });

    // Create Admin Notification for document upload
    await prisma.notification.create({
      data: {
        type: 'document_uploaded',
        title: 'New Document Uploaded',
        message: landownerName
          ? `Document "${originalName}" uploaded for ${landownerName} (${landownerRef}).`
          : `Document "${originalName}" uploaded for verification review.`,
        reference: landownerRef || document.id,
        read: false,
      },
    });

    return NextResponse.json({ success: true, document }, { status: 201 });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process document upload' },
      { status: 500 }
    );
  }
}
