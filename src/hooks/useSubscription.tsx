import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type SubscriptionTier = 'free' | 'standard' | 'premium';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

interface SubscriptionState {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  expiresAt: Date | null;
  isLoading: boolean;
  creditsUsed: number;
  creditsTotal: number;
  creditsRemaining: number;
  scanCreditsUsed: number;
  scanCreditsTotal: number;
  scanCreditsRemaining: number;
  hasUnlimitedMeals: boolean;
  hasUnlimitedScans: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionState>({
    tier: 'free',
    status: 'active',
    expiresAt: null,
    isLoading: true,
    creditsUsed: 0,
    creditsTotal: 1,
    creditsRemaining: 1,
    scanCreditsUsed: 0,
    scanCreditsTotal: 1,
    scanCreditsRemaining: 1,
    hasUnlimitedMeals: false,
    hasUnlimitedScans: false,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setSubscription({
        tier: 'free',
        status: 'active',
        expiresAt: null,
        isLoading: false,
        creditsUsed: 0,
        creditsTotal: 1,
        creditsRemaining: 1,
        scanCreditsUsed: 0,
        scanCreditsTotal: 1,
        scanCreditsRemaining: 1,
        hasUnlimitedMeals: false,
        hasUnlimitedScans: false,
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session');
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      const hasUnlimitedMeals = data.has_unlimited_meals || data.credits_total === -1;
      const hasUnlimitedScans = data.has_unlimited_scans || data.scan_credits_total === -1;

      setSubscription({
        tier: (data.tier || 'free') as SubscriptionTier,
        status: (data.status || 'active') as SubscriptionStatus,
        expiresAt: data.expires_at ? new Date(data.expires_at) : null,
        isLoading: false,
        creditsUsed: data.credits_used || 0,
        creditsTotal: hasUnlimitedMeals ? -1 : (data.credits_total || 1),
        creditsRemaining: hasUnlimitedMeals ? -1 : (data.credits_remaining ?? 1),
        scanCreditsUsed: data.scan_credits_used || 0,
        scanCreditsTotal: hasUnlimitedScans ? -1 : (data.scan_credits_total || 1),
        scanCreditsRemaining: hasUnlimitedScans ? -1 : (data.scan_credits_remaining ?? 1),
        hasUnlimitedMeals,
        hasUnlimitedScans,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  const openCheckout = async (tier: 'standard' | 'premium') => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session');
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to start checkout');
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session');
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open subscription management');
    }
  };

  // Check subscription on mount and when user changes
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const deductCredit = async (): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in first');
      return false;
    }

    // Premium users have unlimited meals
    if (subscription.hasUnlimitedMeals) {
      return true;
    }

    if (subscription.creditsRemaining <= 0) {
      toast.error('No meal credits remaining');
      return false;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session');
      }

      const { data, error } = await supabase.functions.invoke('deduct-meal-credit', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.success) {
        // Update local state immediately
        if (!data.has_unlimited) {
          setSubscription(prev => ({
            ...prev,
            creditsUsed: prev.creditsUsed + 1,
            creditsRemaining: prev.creditsRemaining - 1,
          }));
        }
        return true;
      } else {
        toast.error(data.message || 'Failed to deduct credit');
        return false;
      }
    } catch (error) {
      console.error('Error deducting credit:', error);
      toast.error('Failed to start cooking');
      return false;
    }
  };

  const deductScanCredit = async (): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in first');
      return false;
    }

    // Standard and Premium users have unlimited scans
    if (subscription.hasUnlimitedScans) {
      return true;
    }

    if (subscription.scanCreditsRemaining <= 0) {
      toast.error('No scan credits remaining');
      return false;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No session');
      }

      const { data, error } = await supabase.functions.invoke('deduct-scan-credit', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.success) {
        // Update local state immediately
        if (!data.has_unlimited) {
          setSubscription(prev => ({
            ...prev,
            scanCreditsUsed: prev.scanCreditsUsed + 1,
            scanCreditsRemaining: prev.scanCreditsRemaining - 1,
          }));
        }
        return true;
      } else {
        toast.error(data.message || 'Failed to deduct scan credit');
        return false;
      }
    } catch (error) {
      console.error('Error deducting scan credit:', error);
      toast.error('Failed to start scan');
      return false;
    }
  };

  return {
    ...subscription,
    checkSubscription,
    openCheckout,
    openCustomerPortal,
    deductCredit,
    deductScanCredit,
    isPremium: subscription.tier === 'premium',
    isStandard: subscription.tier === 'standard',
    isPaid: subscription.tier !== 'free',
    canCook: subscription.hasUnlimitedMeals || subscription.creditsRemaining > 0,
    canScan: subscription.hasUnlimitedScans || subscription.scanCreditsRemaining > 0,
  };
}
