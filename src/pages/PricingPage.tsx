import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Crown, Zap, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { AuthModal } from '@/components/auth/AuthModal';
import { cn } from '@/lib/utils';

const tiers = [
  {
    id: 'free' as const,
    name: 'Free',
    price: '£0',
    period: 'forever',
    description: 'Try it out with 1 free meal',
    icon: Zap,
    features: [
      '1 AI-generated meal',
      '1 ingredient scan',
      'Basic pantry management',
    ],
    notIncluded: [
      'Chef guidance',
      'Advanced filters',
      'Priority support',
    ],
  },
  {
    id: 'standard' as const,
    name: 'Standard',
    price: '£5',
    period: 'one-time',
    description: '7 meals that never expire',
    icon: Sparkles,
    features: [
      '7 AI-generated meals',
      'Unlimited ingredient scanning',
      'Full pantry management',
      'Chef guidance',
    ],
    notIncluded: [
      'Unlimited meals',
      'Priority support',
    ],
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: '£12',
    period: 'per month',
    description: 'Unlimited meals & features',
    icon: Crown,
    popular: true,
    features: [
      'Unlimited AI-generated meals',
      'Unlimited ingredient scanning',
      'Full pantry management',
      'Chef guidance',
      'Priority support',
    ],
    notIncluded: [],
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const { tier: currentTier, isLoading, openCheckout, openCustomerPortal, isPaid } = useSubscription();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSubscribe = async (tierId: 'standard' | 'premium') => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setLoadingTier(tierId);
    await openCheckout(tierId);
    setLoadingTier(null);
  };

  const handleManageSubscription = async () => {
    setLoadingTier('manage');
    await openCustomerPortal();
    setLoadingTier(null);
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Unlock the full power of AI-generated recipes tailored to your pantry and preferences
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tiers.map((tier) => {
              const isCurrentTier = currentTier === tier.id;
              const Icon = tier.icon;

              return (
                <Card
                  key={tier.id}
                  className={cn(
                    "relative transition-all duration-200",
                    tier.popular && "border-primary shadow-lg scale-105",
                    isCurrentTier && "ring-2 ring-primary"
                  )}
                >
                  {tier.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                      Most Popular
                    </Badge>
                  )}
                  {isCurrentTier && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-3 right-4"
                    >
                      Current Plan
                    </Badge>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center",
                      tier.id === 'free' && "bg-muted",
                      tier.id === 'standard' && "bg-gradient-to-r from-purple-500 to-pink-500",
                      tier.id === 'premium' && "bg-gradient-warm"
                    )}>
                      <Icon className={cn(
                        "w-6 h-6",
                        tier.id === 'free' ? "text-muted-foreground" : "text-white"
                      )} />
                    </div>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground ml-1">
                        {tier.period === 'one-time' ? ' one-time' : `/${tier.period}`}
                      </span>
                    </div>

                    <ul className="space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                      {tier.notIncluded.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 opacity-50">
                          <span className="w-5 h-5 shrink-0 mt-0.5 text-center">—</span>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {tier.id === 'free' ? (
                      isCurrentTier ? (
                        <Button variant="outline" className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full" disabled>
                          Free Forever
                        </Button>
                      )
                    ) : isCurrentTier ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleManageSubscription}
                        disabled={loadingTier === 'manage'}
                      >
                        {loadingTier === 'manage' ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Manage Subscription
                      </Button>
                    ) : (
                      <Button
                        className={cn(
                          "w-full",
                          tier.id === 'standard' && "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
                          tier.id === 'premium' && "bg-gradient-warm"
                        )}
                        onClick={() => handleSubscribe(tier.id)}
                        disabled={loadingTier === tier.id}
                      >
                        {loadingTier === tier.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        {tier.id === 'standard' ? 'Buy Now' : (isPaid ? 'Switch Plan' : 'Subscribe')}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {isPaid && currentTier === 'premium' && (
          <div className="text-center mt-8">
            <Button 
              variant="ghost" 
              onClick={handleManageSubscription}
              disabled={loadingTier === 'manage'}
            >
              {loadingTier === 'manage' ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Manage Billing & Subscription
            </Button>
          </div>
        )}
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </Layout>
  );
}
