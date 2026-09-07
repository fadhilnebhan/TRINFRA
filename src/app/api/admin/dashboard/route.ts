import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [
      totalLandowners,
      newRegistrations,
      verificationPending,
      developerEnquiries,
      totalOpportunities,
      totalProjects,
      recentLandowners,
      recentEnquiries,
      recentNotifications,
    ] = await Promise.all([
      prisma.landowner.count(),
      prisma.landowner.count({ where: { verificationStatus: 'NEW' } }),
      prisma.landowner.count({ where: { verificationStatus: 'VERIFICATION_PENDING' } }),
      prisma.developerEnquiry.count(),
      prisma.opportunity.count(),
      prisma.project.count(),
      prisma.landowner.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { parcels: true },
      }),
      prisma.developerEnquiry.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalLandowners,
        totalLandownersDisplay: `${totalLandowners}+`,
        newRegistrations,
        verificationPending,
        developerEnquiries,
        totalOpportunities,
        totalProjects,
      },
      recentRegistrations: recentLandowners,
      recentEnquiries: recentEnquiries,
      activities: recentNotifications,
    });
  } catch (error) {
    console.error('Admin dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics from database' },
      { status: 500 }
    );
  }
}
