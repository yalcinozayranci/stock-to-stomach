import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    const prompt = `Direct overhead food photography of ${recipeTitle}, ${cuisine} cuisine. The image shows ONLY the food on a plate or bowl filling the entire frame. NO borders, NO frames, NO edges, NO white space around the image. Clean professional restaurant presentation with bright natural lighting and shallow depth of field. The entire image is the dish itself with no photo-within-photo effects. Ultra high resolution.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      console.error("Image generation failed:", response.status);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
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

interface RecipeRequest {
  ingredients: string[];
  dietaryPreferences?: string[];
  allergies?: string[];
  mealType?: string;
  count?: number;
}

interface GeneratedRecipe {
  title: string;
  description: string;
  cooking_time_minutes: number;
  difficulty: "easy" | "medium" | "hard";
  servings: number;
  cuisine: string;
  meal_type: string;
  ingredients: { name: string; amount: string; unit: string }[];
  instructions: string[];
  dietary_tags: string[];
  matchedIngredients: string[];
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

    const { ingredients, dietaryPreferences, allergies, mealType, count = 3 }: RecipeRequest = await req.json();

    if (!ingredients || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ error: "Ingredients are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const allergyText = allergies?.length 
      ? `CRITICAL ALLERGY WARNING: The user has these allergies: ${allergies.join(', ')}. You MUST NOT include ANY of these ingredients or their derivatives. This is a safety requirement.` 
      : '';
    
    const dietaryText = dietaryPreferences?.length 
      ? `Dietary preferences to follow: ${dietaryPreferences.join(', ')}. All recipes should comply with these preferences.` 
      : '';

    const mealTypeText = mealType ? `The user wants ${mealType} recipes specifically.` : '';

    const systemPrompt = `You are an expert chef AI that creates personalized recipes. You MUST generate exactly ${count} unique, delicious recipes.

USER'S AVAILABLE INGREDIENTS: ${ingredients.join(', ')}

${allergyText}
${dietaryText}
${mealTypeText}

INSTRUCTIONS:
1. Create ${count} distinct recipes that primarily use the available ingredients
2. Each recipe should have a different cuisine style and cooking method
3. Include "matchedIngredients" showing which of the user's ingredients each recipe uses
4. Recipes should be practical and achievable for home cooks
5. Estimate realistic cooking times

Return ONLY a valid JSON array with exactly ${count} recipes in this format:
[
  {
    "title": "Creative Recipe Name",
    "description": "Appetizing 1-2 sentence description",
    "cooking_time_minutes": 30,
    "difficulty": "easy",
    "servings": 4,
    "cuisine": "asian",
    "meal_type": "dinner",
    "ingredients": [
      {"name": "ingredient name", "amount": "1", "unit": "cup"}
    ],
    "instructions": ["Step 1 instruction", "Step 2 instruction"],
    "dietary_tags": ["vegetarian"],
    "matchedIngredients": ["chicken", "rice"]
  }
]

VALID VALUES:
- difficulty: "easy", "medium", or "hard"
- cuisine: "asian", "mediterranean", "european", "latin_american", "american", "african", "middle_eastern", "indian", "british", or "other"
- meal_type: "breakfast", "lunch", "dinner", "dessert", or "snack"
- dietary_tags: only include if applicable - "vegetarian", "vegan", "gluten_free"

IMPORTANT: Output ONLY the JSON array, no additional text or markdown.`;

    console.log(`Generating ${count} recipes for ingredients: ${ingredients.join(', ')}`);

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
          { role: "user", content: `Generate ${count} unique recipes I can make with: ${ingredients.join(', ')}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate recipes");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON array from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Failed to parse JSON from response:", content);
      throw new Error("Could not parse recipes from AI response");
    }

    let recipes: GeneratedRecipe[];
    try {
      recipes = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", jsonMatch[0]);
      throw new Error("Invalid JSON in AI response");
    }

    // Validate and sanitize recipes
    const validDietaryTags = ['vegetarian', 'vegan', 'gluten_free'];
    const validCuisines = ['asian', 'mediterranean', 'european', 'latin_american', 'american', 'african', 'middle_eastern', 'indian', 'british', 'other'];
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'];
    const validDifficulties = ['easy', 'medium', 'hard'];

    // Generate images for all recipes in parallel
    console.log(`Generating images for ${recipes.length} recipes...`);
    
    const imagePromises = recipes.map(async (recipe, index) => {
      const recipeId = `ai-${Date.now()}-${index}`;
      
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && LOVABLE_API_KEY) {
        try {
          const base64Image = await generateRecipeImage(
            recipe.title,
            recipe.cuisine || 'other',
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
              console.log(`Generated AI image for recipe ${index + 1}: ${recipe.title}`);
              return { recipeId, imageUrl };
            }
          }
        } catch (error) {
          console.error(`Image generation failed for recipe ${index + 1}:`, error);
        }
      }
      
      // Use fallback image
      const fallbackUrl = getCuisineFallbackImage(recipe.cuisine || 'other');
      console.log(`Using fallback image for recipe ${index + 1}: ${recipe.title}`);
      return { recipeId, imageUrl: fallbackUrl };
    });

    const imageResults = await Promise.all(imagePromises);

    const sanitizedRecipes = recipes.map((recipe: GeneratedRecipe, index: number) => ({
      id: imageResults[index].recipeId,
      title: recipe.title || `Recipe ${index + 1}`,
      description: recipe.description || 'A delicious recipe made with your ingredients.',
      image_url: imageResults[index].imageUrl,
      cooking_time_minutes: Math.max(5, Math.min(180, recipe.cooking_time_minutes || 30)),
      difficulty: validDifficulties.includes(recipe.difficulty) ? recipe.difficulty : 'medium',
      servings: Math.max(1, Math.min(12, recipe.servings || 4)),
      cuisine: validCuisines.includes(recipe.cuisine) ? recipe.cuisine : 'other',
      meal_type: validMealTypes.includes(recipe.meal_type) ? recipe.meal_type : (mealType || 'dinner'),
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
      dietary_tags: (recipe.dietary_tags || []).filter((tag: string) => validDietaryTags.includes(tag)),
      is_ai_generated: true,
      matchedIngredients: Array.isArray(recipe.matchedIngredients) ? recipe.matchedIngredients : [],
    }));

    console.log(`Successfully generated ${sanitizedRecipes.length} recipes with images`);

    return new Response(
      JSON.stringify({ 
        recipes: sanitizedRecipes,
        totalFound: sanitizedRecipes.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating recipes:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
