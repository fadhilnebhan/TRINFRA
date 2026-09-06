'use client';

import { useSearchParams } from 'next/navigation';
import DeveloperEnquiryView from '@/components/opportunities/DeveloperEnquiryView';
import { getOpportunityById } from '@/lib/opportunitiesData';

export default function EnquiryPageClient() {
  const searchParams = useSearchParams();
  const rawOpp = searchParams.get('opportunity') || 'OPP-1';

  // Check if it's a valid ID or slug
  const opp = getOpportunityById(rawOpp);
  const initialOpportunityId = opp ? opp.id : 'OPP-1';

  return <DeveloperEnquiryView initialOpportunityId={initialOpportunityId} />;
}
