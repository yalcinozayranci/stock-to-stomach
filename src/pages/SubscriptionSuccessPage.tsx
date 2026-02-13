import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Sparkles, ArrowRight, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function SubscriptionSuccessPage() {
  const { tier, checkSubscription } = useSubscription();
  const { user } = useAuth();
  const [invoiceSent, setInvoiceSent] = useState(false);
  const invoiceSentRef = useRef(false);

  // Refresh subscription status and send invoice on mount
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Send invoice email after successful payment
  useEffect(() => {
    const sendInvoiceEmail = async () => {
      // Only send once and only if we have user and tier
      if (invoiceSentRef.current || !user?.email || tier === 'free') return;
      
      invoiceSentRef.current = true;
      
      try {
        const amount = tier === 'premium' ? '£12.00' : '£5.00';
        
        const { error } = await supabase.functions.invoke('send-invoice-email', {
          body: {
            email: user.email,
            tier,
            amount,
            displayName: user.user_metadata?.display_name
          }
        });

        if (error) {
          console.error('Failed to send invoice:', error);
        } else {
          setInvoiceSent(true);
          toast.success('Invoice sent to your email!');
        }
      } catch (err) {
        console.error('Error sending invoice:', err);
      }
    };

    // Small delay to ensure subscription status is updated
    const timer = setTimeout(sendInvoiceEmail, 1500);
    return () => clearTimeout(timer);
  }, [user, tier]);

  return (
    <Layout>
      <div className="container py-16 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="text-center">
            <CardHeader className="pb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-green-600" />
              </motion.div>
              <CardTitle className="text-3xl font-display">Welcome to {tier === 'premium' ? 'Premium' : 'Standard'}!</CardTitle>
              <CardDescription className="text-lg">
                Your subscription is now active. Thank you for upgrading!
              </CardDescription>
              {invoiceSent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2"
                >
                  <Mail className="w-4 h-4" />
                  Invoice sent to your email
                </motion.div>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6 text-left">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  What's unlocked for you:
                </h3>
                <ul className="space-y-2 text-sm">
                  {tier === 'premium' ? (
                    <>
                      <li>✓ 20 AI-generated meals per month</li>
                      <li>✓ Advanced cuisine filters</li>
                      <li>✓ Unlimited chef guidance</li>
                      <li>✓ Meal planning features</li>
                      <li>✓ Priority support</li>
                    </>
                  ) : (
                    <>
                      <li>✓ 10 AI-generated meals per week</li>
                      <li>✓ Advanced cuisine filters</li>
                      <li>✓ Unlimited chef guidance</li>
                      <li>✓ Enhanced pantry management</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/pantry">
                  <Button className="bg-gradient-warm gap-2">
                    Generate a Recipe <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/recipes">
                  <Button variant="outline">
                    Browse Recipes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
