import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface InvoiceRequest {
  email: string;
  tier: string;
  amount: string;
  displayName?: string;
}

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-INVOICE-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

    const { email, tier, amount, displayName }: InvoiceRequest = await req.json();

    if (!email || !tier || !amount) {
      throw new Error("Missing required fields: email, tier, amount");
    }

    logStep("Sending invoice email", { email, tier, amount });

    const tierName = tier === 'premium' ? 'Premium (Monthly)' : 'Standard (Weekly)';
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

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
        subject: "Your Cook From Here Purchase Receipt",
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
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Payment Confirmation</p>
              </div>
              
              <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin: 0 0 20px 0;">Thank you${displayName ? `, ${displayName}` : ''}!</h2>
                
                <p style="color: #666; line-height: 1.6;">Your payment has been successfully processed. Here are your purchase details:</p>
                
                <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; margin: 24px 0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #666;">Plan</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #333;">${tierName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666;">Amount</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #333;">${amount}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666;">Date</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #333;">${currentDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666;">Status</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #22c55e;">✓ Paid</td>
                    </tr>
                  </table>
                </div>
                
                <h3 style="color: #333; margin: 24px 0 12px 0;">What's included:</h3>
                <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
                  ${tier === 'premium' ? `
                    <li>Unlimited AI-generated meals</li>
                    <li>Unlimited ingredient scanning</li>
                    <li>Advanced cuisine filters</li>
                    <li>Chef guidance</li>
                    <li>Priority support</li>
                  ` : `
                    <li>7 AI-generated meals (non-expiring)</li>
                    <li>Unlimited ingredient scanning</li>
                    <li>Advanced cuisine filters</li>
                    <li>Chef guidance</li>
                  `}
                </ul>
                
                <div style="text-align: center; margin-top: 32px;">
                  <a href="https://stock-to-stomach.lovable.app/pantry" style="display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #F7C59F 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Start Cooking</a>
                </div>
                
                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px; border-top: 1px solid #eee; padding-top: 24px;">
                  If you have any questions, reply to this email and we'll be happy to help.
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

    logStep("Invoice email sent successfully", emailData);

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
