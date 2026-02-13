import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { OnboardingWizard } from '@/components/profile/OnboardingWizard';
import { HomeHeader } from '@/components/home/HomeHeader';
import { MasterChefCard } from '@/components/home/MasterChefCard';
import { AIPantryScanCard } from '@/components/home/AIPantryScanCard';
import { SafestEatsSection } from '@/components/home/SafestEatsSection';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturesShowcase } from '@/components/landing/FeaturesShowcase';
import { VisualJourneySection } from '@/components/landing/VisualJourneySection';
import { ValuePropsSection } from '@/components/landing/ValuePropsSection';
import { PreferencesSection } from '@/components/landing/PreferencesSection';
import { EmailConfirmationPage } from '@/components/auth/EmailConfirmationPage';

const Index = () => {
  const { user, isEmailConfirmed } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show email confirmation page for logged-in users who haven't confirmed their email
  if (user && !isEmailConfirmed) {
    return <EmailConfirmationPage />;
  }

  // Show onboarding for new users who haven't completed it
  const shouldShowOnboarding = user && profile && !profile.has_completed_onboarding && !profileLoading;
  if (shouldShowOnboarding || showOnboarding) {
    return (
      <Layout hideNavigation>
        <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
      </Layout>
    );
  }

  // Personalized dashboard for logged-in users
  if (user && profile) {
    return (
      <Layout showBottomNav>
        <div className="container max-w-md mx-auto px-4 py-6 pb-28">
          <HomeHeader />

          {/* Master Chef Suggestion Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <MasterChefCard />
          </motion.div>

          {/* AI Pantry Scan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <AIPantryScanCard />
          </motion.div>

          {/* Your Safest Eats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SafestEatsSection />
          </motion.div>
        </div>
      </Layout>
    );
  }

  // Landing page for non-logged-in users
  return (
    <Layout>
      <HeroSection
        onGetStarted={() => setAuthModalOpen(true)}
        onSignIn={() => setAuthModalOpen(true)}
      />
      <FeaturesShowcase />
      <VisualJourneySection />
      <HowItWorksSection />
      <ValuePropsSection />
      <PreferencesSection onGetStarted={() => setAuthModalOpen(true)} />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </Layout>
  );
};

export default Index;
