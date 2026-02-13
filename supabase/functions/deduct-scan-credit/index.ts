import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Scan credits per tier (-1 = unlimited)
const SCAN_CREDITS: Record<string, number> = {
  free: 1,
  standard: -1, // unlimited
  premium: -1,  // unlimited
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DEDUCT-SCAN-CREDIT] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get current profile with subscription and scan credits
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('subscription_tier, scan_credits_used')
      .eq('user_id', user.id)
      .single();

    if (profileError) throw new Error(`Failed to fetch profile: ${profileError.message}`);

    const tier = profile.subscription_tier || 'free';
    const creditsUsed = profile.scan_credits_used || 0;
    const totalCredits = SCAN_CREDITS[tier] || 1;
    
    // Check for unlimited (standard or premium)
    if (totalCredits === -1) {
      logStep("Unlimited scan credits", { tier });
      return new Response(JSON.stringify({
        success: true,
        credits_used: creditsUsed,
        credits_remaining: -1,
        credits_total: -1,
        has_unlimited: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const creditsRemaining = totalCredits - creditsUsed;

    logStep("Current scan credits", { tier, creditsUsed, totalCredits, creditsRemaining });

    if (creditsRemaining <= 0) {
      logStep("No scan credits remaining");
      return new Response(JSON.stringify({
        success: false,
        message: "No scan credits remaining. Please upgrade your plan for unlimited scanning.",
        credits_remaining: 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Deduct one credit
    const newCreditsUsed = creditsUsed + 1;
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ scan_credits_used: newCreditsUsed })
      .eq('user_id', user.id);

    if (updateError) throw new Error(`Failed to update scan credits: ${updateError.message}`);

    logStep("Scan credit deducted successfully", { newCreditsUsed, newRemaining: totalCredits - newCreditsUsed });

    return new Response(JSON.stringify({
      success: true,
      credits_used: newCreditsUsed,
      credits_remaining: totalCredits - newCreditsUsed,
      credits_total: totalCredits,
      has_unlimited: false,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
