import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, pantryItems, dietaryPreferences, allergies, activeCooking } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const pantryContext = pantryItems?.length > 0
      ? `The user currently has these ingredients in their pantry: ${pantryItems.join(", ")}.`
      : "The user hasn't added any ingredients to their pantry yet.";

    const dietaryContext = dietaryPreferences?.length > 0
      ? `The user follows these dietary preferences: ${dietaryPreferences.join(", ")}.`
      : "";

    const allergyContext = allergies?.length > 0
      ? `IMPORTANT: The user has these food allergies and you must NEVER suggest recipes with these ingredients: ${allergies.join(", ")}.`
      : "";

    // Active cooking context when user is in cooking mode
    const cookingContext = activeCooking
      ? `
ACTIVE COOKING MODE: The user is currently cooking "${activeCooking.recipeName}" and is on step ${activeCooking.currentStep + 1} of ${activeCooking.totalSteps}.
Current instruction: "${activeCooking.currentInstruction}"

When helping:
- Focus on the current step they're working on
- Give practical, immediate advice
- If they're stuck, break down the step into simpler sub-steps
- Suggest fixes for common mistakes
- Be encouraging and reassuring
- Keep responses concise since they're actively cooking`
      : "";

    const systemPrompt = `You are the Cook From Here Assistant, a friendly and enthusiastic AI chef who loves helping people discover delicious recipes. Your personality is warm, encouraging, and knowledgeable about cooking.

${pantryContext}
${dietaryContext}
${allergyContext}
${cookingContext}

Guidelines:
- Be conversational and friendly, using a warm tone
- When suggesting recipes, consider the user's pantry items, dietary preferences, and allergies
- Give practical cooking tips and substitution ideas
- If asked for a recipe, provide clear step-by-step instructions
- Keep responses concise but helpful (aim for 2-4 paragraphs max)
- Use emojis sparingly to add personality (1-2 per response)
- If you don't know something, be honest about it
- Always prioritize food safety, especially regarding allergies

SPECIAL CAPABILITY - Recipe Parsing:
When the user asks you to help them cook a specific recipe or wants to start cooking mode, respond with a special JSON format wrapped in <recipe-steps> tags:
<recipe-steps>
{
  "recipeName": "Recipe Name Here",
  "steps": [
    {"instruction": "Step 1 description", "duration": 300, "tip": "Optional helpful tip"},
    {"instruction": "Step 2 description"},
    {"instruction": "Step 3 description", "duration": 600}
  ]
}
</recipe-steps>

Only use this format when the user explicitly asks to cook something or wants step-by-step cooking guidance. Duration is in seconds (optional). Regular conversations don't need this format.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to get response from AI");
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again.";

    // Check if the response contains recipe steps for cooking mode
    const recipeStepsMatch = message.match(/<recipe-steps>([\s\S]*?)<\/recipe-steps>/);
    let recipeData = null;
    let cleanMessage = message;

    if (recipeStepsMatch) {
      try {
        recipeData = JSON.parse(recipeStepsMatch[1].trim());
        // Remove the recipe-steps tags from the displayed message
        cleanMessage = message.replace(/<recipe-steps>[\s\S]*?<\/recipe-steps>/, '').trim();
        if (!cleanMessage) {
          cleanMessage = `Great! Let's cook ${recipeData.recipeName} together! I've set up the cooking mode for you. 🍳`;
        }
      } catch (e) {
        console.error("Failed to parse recipe steps:", e);
      }
    }

    return new Response(
      JSON.stringify({ message: cleanMessage, recipeData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Chat assistant error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
