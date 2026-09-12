import React from 'react';
import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';
import { ProblemSection } from './ProblemSection';
import { HowItWorksSection } from './HowItWorksSection';
import { AllocationHeroSection } from './AllocationHeroSection';
import { ProductPlanningSection } from './ProductPlanningSection';
import { GoalsSectionPreview } from './GoalsSectionPreview';
import { MobileShowcaseSection } from './MobileShowcaseSection';
import { HistorySection } from './HistorySection';
import { PrivacySection } from './PrivacySection';
import { FaqSection } from './FaqSection';
import { FinalCtaSection } from './FinalCtaSection';
import { LandingFooter } from './LandingFooter';

interface LandingPageProps {
  onOpenApp: () => void;
}

export function LandingPage({ onOpenApp }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      {/* Top Fixed Navigation */}
      <LandingNav onOpenApp={onOpenApp} />

      {/* Main Content Sections */}
      <main className="flex-1">
        <HeroSection onOpenApp={onOpenApp} />
        <ProblemSection />
        <HowItWorksSection />
        <AllocationHeroSection />
        <ProductPlanningSection />
        <GoalsSectionPreview />
        <MobileShowcaseSection />
        <HistorySection />
        <PrivacySection />
        <FaqSection />
        <FinalCtaSection onOpenApp={onOpenApp} />
      </main>

      {/* Footer */}
      <LandingFooter onOpenApp={onOpenApp} />
    </div>
  );
}
