import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { Lock, Sparkles, Crown, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'meal' | 'scan';
}

export function UpgradeModal({ open, onOpenChange, type }: UpgradeModalProps) {
  const { openCheckout, tier } = useSubscription();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleUpgrade = async (selectedTier: 'standard' | 'premium') => {
    setLoadingTier(selectedTier);
    await openCheckout(selectedTier);
    setLoadingTier(null);
    onOpenChange(false);
  };

  const title = type === 'meal' 
    ? "You've Reached Your Meal Limit" 
    : "You've Reached Your Scan Limit";

  const description = type === 'meal'
    ? "Upgrade to continue cooking with AI-powered recipes!"
    : "Upgrade to continue scanning ingredients!";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          {/* Only show Standard option for meal limits if user is on free tier */}
          {type === 'meal' && tier === 'free' && (
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex items-start gap-4"
              onClick={() => handleUpgrade('standard')}
              disabled={loadingTier === 'standard'}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Standard Plan</div>
                <div className="text-sm text-muted-foreground">
                  7 meals + unlimited scans • £5 one-time
                </div>
              </div>
              {loadingTier === 'standard' && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
            </Button>
          )}

          {/* For scan limits, only show Standard if user is on free tier */}
          {type === 'scan' && tier === 'free' && (
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex items-start gap-4"
              onClick={() => handleUpgrade('standard')}
              disabled={loadingTier === 'standard'}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Standard Plan</div>
                <div className="text-sm text-muted-foreground">
                  Unlimited scans + 7 meals • £5 one-time
                </div>
              </div>
              {loadingTier === 'standard' && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
            </Button>
          )}

          <Button
            className="w-full h-auto py-4 flex items-start gap-4 bg-gradient-warm"
            onClick={() => handleUpgrade('premium')}
            disabled={loadingTier === 'premium'}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold">Premium Plan</div>
              <div className="text-sm text-white/80">
                Unlimited everything • £12/month
              </div>
            </div>
            {loadingTier === 'premium' && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
