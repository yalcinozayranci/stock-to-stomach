import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Product IDs for tier mapping
const PRODUCT_TIERS: Record<string, string> = {
  "prod_TserSUSSlyw3HH": "standard", // Standard Plan - £5 one-time
  "prod_Tset4D3KZ1stik": "premium",  // Premium Plan - £12/month
};

// Meal credits per tier (-1 = unlimited)
const TIER_CREDITS: Record<string, number> = {
  free: 1,
  standard: 7,
  premium: -1, // unlimited
};

// Scan credits per tier (-1 = unlimited)
const SCAN_CREDITS: Record<string, number> = {
  free: 1,
  standard: -1, // unlimited
  premium: -1,  // unlimited
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    // Get current profile data
    const { data: profileData } = await supabaseClient
      .from('profiles')
      .select('meal_credits_used, meal_credits_reset_at, scan_credits_used, scan_credits_reset_at, subscription_tier')
      .eq('user_id', user.id)
      .single();

    const mealCreditsUsed = profileData?.meal_credits_used || 0;
    const scanCreditsUsed = profileData?.scan_credits_used || 0;

    if (customers.data.length === 0) {
      logStep("No customer found, returning free tier");
      
      // Update profile to free tier
      await supabaseClient
        .from('profiles')
        .update({ 
          subscription_tier: 'free',
          subscription_status: 'active',
          subscription_expires_at: null
        })
        .eq('user_id', user.id);

      // Remove any existing stripe customer record
      await supabaseClient
        .from('stripe_customers')
        .delete()
        .eq('user_id', user.id);

      const totalMealCredits = TIER_CREDITS['free'];
      const totalScanCredits = SCAN_CREDITS['free'];
      const mealCreditsRemaining = Math.max(0, totalMealCredits - mealCreditsUsed);
      const scanCreditsRemaining = Math.max(0, totalScanCredits - scanCreditsUsed);

      logStep("Free tier credits info", { mealCreditsUsed, totalMealCredits, mealCreditsRemaining, scanCreditsUsed, totalScanCredits, scanCreditsRemaining });

      return new Response(JSON.stringify({ 
        subscribed: false,
        tier: 'free',
        status: 'active',
        expires_at: null,
        credits_used: mealCreditsUsed,
        credits_total: totalMealCredits,
        credits_remaining: mealCreditsRemaining,
        scan_credits_used: scanCreditsUsed,
        scan_credits_total: totalScanCredits,
        scan_credits_remaining: scanCreditsRemaining,
        has_unlimited_meals: false,
        has_unlimited_scans: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active subscriptions (Premium)
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    let tier = 'free';
    let status = 'active';
    let expiresAt: string | null = null;

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      const productId = subscription.items.data[0].price.product as string;
      tier = PRODUCT_TIERS[productId] || 'free';
      status = subscription.status;
      expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { tier, status, expiresAt });
    } else {
      // Check for completed one-time payments (Standard)
      const sessions = await stripe.checkout.sessions.list({
        customer: customerId,
        limit: 10,
      });

      for (const session of sessions.data) {
        if (session.payment_status === 'paid' && session.mode === 'payment') {
          // Get the line items to find the product
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
          if (lineItems.data.length > 0) {
            const priceId = lineItems.data[0].price?.id;
            if (priceId) {
              const price = await stripe.prices.retrieve(priceId);
              const productId = price.product as string;
              const mappedTier = PRODUCT_TIERS[productId];
              if (mappedTier === 'standard') {
                tier = 'standard';
                status = 'active';
                expiresAt = null; // Never expires for one-time purchase
                logStep("Standard plan found (one-time purchase)", { tier, productId });
                break;
              }
            }
          }
        }
      }
    }

    // Update profile with subscription info
    await supabaseClient
      .from('profiles')
      .update({ 
        subscription_tier: tier,
        subscription_status: status,
        subscription_expires_at: expiresAt
      })
      .eq('user_id', user.id);

    // Store/update stripe customer ID in separate secure table
    await supabaseClient
      .from('stripe_customers')
      .upsert({ 
        user_id: user.id,
        stripe_customer_id: customerId
      }, { 
        onConflict: 'user_id' 
      });

    const totalMealCredits = TIER_CREDITS[tier] || 1;
    const totalScanCredits = SCAN_CREDITS[tier] || 1;
    const hasUnlimitedMeals = totalMealCredits === -1;
    const hasUnlimitedScans = totalScanCredits === -1;
    const mealCreditsRemaining = hasUnlimitedMeals ? -1 : Math.max(0, totalMealCredits - mealCreditsUsed);
    const scanCreditsRemaining = hasUnlimitedScans ? -1 : Math.max(0, totalScanCredits - scanCreditsUsed);

    logStep("Credits info", { tier, mealCreditsUsed, totalMealCredits, mealCreditsRemaining, scanCreditsUsed, totalScanCredits, scanCreditsRemaining });

    return new Response(JSON.stringify({
      subscribed: tier !== 'free',
      tier,
      status,
      expires_at: expiresAt,
      credits_used: mealCreditsUsed,
      credits_total: hasUnlimitedMeals ? -1 : totalMealCredits,
      credits_remaining: mealCreditsRemaining,
      scan_credits_used: scanCreditsUsed,
      scan_credits_total: hasUnlimitedScans ? -1 : totalScanCredits,
      scan_credits_remaining: scanCreditsRemaining,
      has_unlimited_meals: hasUnlimitedMeals,
      has_unlimited_scans: hasUnlimitedScans,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
