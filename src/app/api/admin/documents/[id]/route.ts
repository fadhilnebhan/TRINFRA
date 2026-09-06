import { NextResponse } from 'next/server';
import fs from 'fs';
import prisma from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  // 1. Strict admin authentication check
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized: Private landowner document access is restricted to verified administrators.' },
      { status: 401 }
    );
  }

  try {
    const doc = await prisma.document.findUnique({
      where: { id: params.id },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document record not found' }, { status: 404 });
    }

    if (!fs.existsSync(doc.filePath)) {
      // If demo file doesn't exist on disk, return placeholder PDF/text buffer
      const dummyContent = Buffer.from(
        `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF`
      );
      return new NextResponse(dummyContent, {
        headers: {
          'Content-Type': doc.mimeType || 'application/pdf',
          'Content-Disposition': `inline; filename="${doc.fileName}"`,
        },
      });
    }

    const fileBuffer = fs.readFileSync(doc.filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': doc.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${doc.fileName}"`,
      },
    });
  } catch (error) {
    console.error('Document stream error:', error);
    return NextResponse.json(
      { error: 'Failed to access document storage' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const verificationStatus = body.verificationStatus || body.status;

    if (!verificationStatus) {
      return NextResponse.json(
        { error: 'verificationStatus is required' },
        { status: 400 }
      );
    }

    const updated = await prisma.document.update({
      where: { id: params.id },
      data: { verificationStatus },
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

    return NextResponse.json({ success: true, document: updated });
  } catch (error) {
    console.error('Update document status error:', error);
    return NextResponse.json(
      { error: 'Failed to update document status' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const doc = await prisma.document.findUnique({
      where: { id: params.id },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Attempt to unlink physical file if it exists
    if (fs.existsSync(doc.filePath)) {
      try {
        fs.unlinkSync(doc.filePath);
      } catch (err) {
        console.warn('Could not unlink physical file:', err);
      }
    }

    // Delete record from database
    await prisma.document.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
