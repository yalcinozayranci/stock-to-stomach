import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ConfirmationRequest {
  email: string;
  displayName?: string;
}

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-CONFIRMATION-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const { email, displayName }: ConfirmationRequest = await req.json();

    if (!email) {
      throw new Error("Missing required field: email");
    }

    logStep("Generating confirmation link", { email });

    // Generate the magic link for email confirmation
    const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: 'https://stock-to-stomach.lovable.app/',
      }
    });

    if (linkError) {
      throw new Error(`Failed to generate confirmation link: ${linkError.message}`);
    }

    const confirmationUrl = data.properties.action_link;
    logStep("Confirmation link generated", { email });

    // Use Resend API directly via fetch
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Cook From Here <onboarding@resend.dev>",
        to: [email],
        subject: "Confirm your Cook From Here account",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: linear-gradient(135deg, #FF6B35 0%, #F7C59F 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🍳 Cook From Here</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Welcome aboard!</p>
              </div>
              
              <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin: 0 0 20px 0;">Confirm your email${displayName ? `, ${displayName}` : ''}</h2>
                
                <p style="color: #666; line-height: 1.6;">Thanks for signing up for Cook From Here! Please confirm your email address by clicking the button below:</p>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #F7C59F 100%); color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Confirm Email</a>
                </div>
                
                <p style="color: #666; line-height: 1.6;">Once confirmed, you'll be able to:</p>
                
                <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
                  <li>Scan ingredients with your camera</li>
                  <li>Get AI-generated recipes based on what you have</li>
                  <li>Save your favorite recipes</li>
                  <li>Track your cooking history</li>
                </ul>
                
                <p style="color: #999; font-size: 13px; margin-top: 24px;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="color: #666; font-size: 12px; word-break: break-all; background: #f5f5f5; padding: 12px; border-radius: 6px;">${confirmationUrl}</p>
                
                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px; border-top: 1px solid #eee; padding-top: 24px;">
                  This link will expire in 24 hours. If you didn't sign up for Cook From Here, you can safely ignore this email.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailData = await response.json();

    if (!response.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(emailData)}`);
    }

    logStep("Confirmation email sent successfully", emailData);

    return new Response(JSON.stringify({ success: true, id: emailData.id }), {
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
