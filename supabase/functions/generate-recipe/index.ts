import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Curated high-quality Unsplash images by cuisine type
const cuisineImageFallbacks: Record<string, string[]> = {
  asian: [
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800',
    'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800',
    'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800',
  ],
  mediterranean: [
    'https://images.unsplash.com/photo-1544025162-d76978fc7e1b?w=800',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
  ],
  european: [
    'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
  ],
  latin_american: [
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
  ],
  american: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800',
  ],
  african: [
    'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  ],
  middle_eastern: [
    'https://images.unsplash.com/photo-1547424850-e0a3a9fd6b66?w=800',
    'https://images.unsplash.com/photo-1573225342350-16731dd9bf3d?w=800',
  ],
  indian: [
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
    'https://images.unsplash.com/photo-1596797038530-2c107aa36df3?w=800',
  ],
  british: [
    'https://images.unsplash.com/photo-1579208030886-b1f5b7b9d0b9?w=800',
    'https://images.unsplash.com/photo-1577906096429-f73b2c38e106?w=800',
  ],
  other: [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  ],
};

function getCuisineFallbackImage(cuisine: string): string {
  const images = cuisineImageFallbacks[cuisine] || cuisineImageFallbacks.other;
  return images[Math.floor(Math.random() * images.length)];
}

async function generateRecipeImage(recipeTitle: string, cuisine: string, apiKey: string): Promise<string | null> {
  try {
    // Improved prompt with explicit instructions to avoid frames/borders
    const prompt = `Direct overhead food photography of ${recipeTitle}, ${cuisine} cuisine. The image shows ONLY the food on a plate or bowl filling the entire frame. NO borders, NO frames, NO edges, NO white space around the image. Clean professional restaurant presentation with bright natural lighting and shallow depth of field. The entire image is the dish itself with no photo-within-photo effects. Ultra high resolution.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      console.error("Image generation failed:", response.status);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    return imageUrl || null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}

async function uploadImageToStorage(
  base64Image: string,
  recipeId: string,
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<string | null> {
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Extract base64 data (remove data:image/png;base64, prefix)
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const fileName = `recipe-${recipeId}.png`;

    const { error: uploadError } = await supabase.storage
      .from("ingredient-photos")
      .upload(`recipes/${fileName}`, imageBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("ingredient-photos")
      .getPublicUrl(`recipes/${fileName}`);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

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

    const { ingredients, dietaryPreferences, allergies, cuisine, mealType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const dietaryText = dietaryPreferences?.length > 0 
      ? `The recipe should be suitable for: ${dietaryPreferences.join(", ")}.`
      : "";

    const allergyText = allergies?.length > 0
      ? `IMPORTANT: The user has the following allergies, so you MUST avoid these ingredients completely: ${allergies.join(", ")}. Do not include any ingredients that contain or may contain these allergens.`
      : "";

    const cuisineText = cuisine && cuisine !== 'other'
      ? `The recipe should be ${cuisine.replace('_', ' ')} cuisine style.`
      : "";

    const mealTypeText = mealType
      ? `This should be a ${mealType} recipe. ${
          mealType === 'breakfast' ? 'Create a morning meal that is energizing and satisfying.' :
          mealType === 'lunch' ? 'Create a midday meal that is balanced and filling.' :
          mealType === 'dinner' ? 'Create an evening main course that is hearty and delicious.' :
          mealType === 'dessert' ? 'Create a sweet dessert that is indulgent and satisfying.' :
          mealType === 'snack' ? 'Create a light snack that is quick and tasty.' : ''
        }`
      : "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a creative chef who creates delicious recipes. Given a list of available ingredients, create a recipe that uses as many of them as possible. ${dietaryText} ${allergyText} ${cuisineText} ${mealTypeText}

Return ONLY a valid JSON object with this structure:
{
  "title": "Recipe Name",
  "description": "A brief, appetizing description",
  "cooking_time_minutes": 30,
  "difficulty": "easy" | "medium" | "hard",
  "servings": 4,
  "cuisine": "asian" | "mediterranean" | "european" | "latin_american" | "american" | "african" | "middle_eastern" | "indian" | "british" | "other",
  "meal_type": "breakfast" | "lunch" | "dinner" | "dessert" | "snack",
  "ingredients": [{"name": "ingredient", "amount": "2", "unit": "cups"}],
  "instructions": ["Step 1...", "Step 2..."],
  "dietary_tags": ["vegetarian", "vegan", "gluten_free"]
}`
          },
          {
            role: "user",
            content: `Create a recipe using these ingredients: ${ingredients.join(", ")}. Only return the JSON object, no other text.`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to generate recipe" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    // Extract JSON from response
    let recipe = null;
    const validDietaryTags = ['vegetarian', 'vegan', 'gluten_free'];
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recipe = JSON.parse(jsonMatch[0]);
        // Filter dietary_tags to only include valid enum values
        recipe.dietary_tags = (recipe.dietary_tags || []).filter(
          (tag: string) => validDietaryTags.includes(tag)
        );
        recipe.is_ai_generated = true;

        // Try AI image generation
        if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
          const recipeId = crypto.randomUUID();
          const base64Image = await generateRecipeImage(
            recipe.title,
            recipe.cuisine || 'international',
            LOVABLE_API_KEY
          );

          if (base64Image) {
            const imageUrl = await uploadImageToStorage(
              base64Image,
              recipeId,
              SUPABASE_URL,
              SUPABASE_SERVICE_ROLE_KEY
            );

            if (imageUrl) {
              recipe.image_url = imageUrl;
            } else {
              // Use curated fallback image
              recipe.image_url = getCuisineFallbackImage(recipe.cuisine || 'other');
            }
          } else {
            // Use curated fallback image
            recipe.image_url = getCuisineFallbackImage(recipe.cuisine || 'other');
          }
        } else {
          // Use curated fallback image
          recipe.image_url = getCuisineFallbackImage(recipe.cuisine || 'other');
        }
      }
    } catch (parseError) {
      console.error("Failed to parse recipe:", parseError);
      return new Response(JSON.stringify({ error: "Failed to parse recipe" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ recipe }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error generating recipe:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
