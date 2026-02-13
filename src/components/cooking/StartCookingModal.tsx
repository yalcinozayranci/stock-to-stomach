import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Loader2, Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';

interface StartCookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function StartCookingModal({ open, onOpenChange, onConfirm, isLoading }: StartCookingModalProps) {
  const { creditsRemaining, creditsTotal, tier, canCook } = useSubscription();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            Ready to Cook?
          </DialogTitle>
          <DialogDescription>
            This will use 1 meal credit from your quota.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Your meal credits</p>
              <p className="text-2xl font-bold">
                {creditsRemaining} <span className="text-lg text-muted-foreground">/ {creditsTotal}</span>
              </p>
            </div>
            <Badge variant={tier === 'free' ? 'secondary' : 'default'} className="capitalize">
              {tier}
            </Badge>
          </div>

          {!canCook && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">No credits remaining!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upgrade your plan to get more meal credits.
              </p>
              <Link to="/pricing">
                <Button size="sm" className="mt-3 bg-gradient-to-r from-purple-500 to-pink-500">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </Link>
            </div>
          )}

          {canCook && creditsRemaining <= 1 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                ⚠️ This is your last credit! Consider upgrading for more meals.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!canCook || isLoading}
            className="bg-gradient-warm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>Yes, Start Cooking!</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
