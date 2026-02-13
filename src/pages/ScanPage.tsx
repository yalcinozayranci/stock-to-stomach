import { Layout } from '@/components/layout/Layout';
import { IngredientScanner } from '@/components/scanner/IngredientScanner';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { AuthModal } from '@/components/auth/AuthModal';
import { UpgradeModal } from '@/components/paywall/UpgradeModal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Camera } from 'lucide-react';

export default function ScanPage() {
  const { user } = useAuth();
  const { canScan, scanCreditsRemaining, hasUnlimitedScans, tier, isLoading } = useSubscription();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Scan Ingredients</h1>
          <p className="text-muted-foreground mb-6">Please sign in to scan and save ingredients.</p>
          <Button onClick={() => setAuthModalOpen(true)} className="bg-gradient-warm">Sign In</Button>
          <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        </div>
      </Layout>
    );
  }

  // Show paywall if user has no scan credits
  if (!isLoading && !canScan) {
    return (
      <Layout>
        <div className="container py-8 max-w-2xl">
          <h1 className="font-display text-3xl font-bold mb-2">Scan Ingredients</h1>
          <p className="text-muted-foreground mb-8">Take a photo or upload an image of your ingredients</p>
          
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="font-display text-xl font-semibold mb-2">
                Scan Limit Reached
              </h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                You've used your free scan. Upgrade to Standard or Premium for unlimited ingredient scanning.
              </p>
              <Button 
                className="bg-gradient-warm"
                onClick={() => setUpgradeModalOpen(true)}
              >
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
          
          <UpgradeModal 
            open={upgradeModalOpen} 
            onOpenChange={setUpgradeModalOpen}
            type="scan"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-display text-3xl font-bold">Scan Ingredients</h1>
          {!hasUnlimitedScans && (
            <span className="text-sm text-muted-foreground">
              {scanCreditsRemaining} scan{scanCreditsRemaining !== 1 ? 's' : ''} left
            </span>
          )}
        </div>
        <p className="text-muted-foreground mb-8">Take a photo or upload an image of your ingredients</p>
        <IngredientScanner />
      </div>
    </Layout>
  );
}
