/**
 * DashaTransitTimelinePage.tsx
 *
 * Week 08: Dasha + Transit Timeline Page
 *
 * Main page that hosts the DashaTransitTimelineView component
 */

import React from 'react';
import DashaTransitTimelineView from '@/components/DashaTransitTimelineView';
import MainLayout from '@/components/MainLayout';
import { SEO } from '@/components/SEO';

export default function DashaTransitTimelinePage() {
  return (
    <MainLayout>
      <SEO
        title="Dasha + Transit Timeline — Vedic Rajkumar"
        description="View your active Mahadasha and Antardasha alongside major planetary transits and monthly activation levels."
        keywords="dasha timeline, transit timeline, vimshottari dasha, planetary transits, vedic astrology"
        canonical="/dasha-transit-timeline"
      />
      <DashaTransitTimelineView />
    </MainLayout>
  );
}