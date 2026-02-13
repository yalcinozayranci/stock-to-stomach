export type DietaryPreference = 'vegetarian' | 'vegan' | 'gluten_free';
export type IngredientCategory = 'meat_protein' | 'vegetables' | 'fruits' | 'dairy' | 'grains_bakery' | 'nuts_seeds_pantry' | 'herbs_spices' | 'other';
export type RecipeDifficulty = 'easy' | 'medium' | 'hard';
export type CuisineType = 'asian' | 'mediterranean' | 'european' | 'latin_american' | 'american' | 'african' | 'middle_eastern' | 'indian' | 'british' | 'other';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack';
export type CookingTimeRange = 'all' | 'quick' | '15-30' | '30-45' | '45-60' | '60+';
export type FoodAllergy = 'peanuts' | 'tree_nuts' | 'milk' | 'eggs' | 'wheat' | 'soy' | 'fish' | 'shellfish' | 'sesame' | 'mustard' | 'celery' | 'sulfites';
export type SubscriptionTier = 'free' | 'standard' | 'premium';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  dietary_preferences: DietaryPreference[];
  allergies: FoodAllergy[];
  favorite_cuisines: CuisineType[];
  has_completed_onboarding: boolean;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  subscription_expires_at: string | null;
  meal_credits_used: number;
  meal_credits_reset_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PantryItem {
  id: string;
  user_id: string;
  name: string;
  category: IngredientCategory;
  quantity: string | null;
  unit: string | null;
  expires_at: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cooking_time_minutes: number | null;
  difficulty: RecipeDifficulty;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  dietary_tags: DietaryPreference[];
  cuisine: CuisineType;
  meal_type: MealType;
  is_ai_generated: boolean;
  is_public: boolean;
  created_at: string;
}

// AI-generated recipe (from Gemini)
export interface AIRecipe {
  id?: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cooking_time_minutes: number;
  difficulty: RecipeDifficulty;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  dietary_tags: DietaryPreference[];
  cuisine: CuisineType;
  meal_type: MealType;
  is_ai_generated: true;
  matchedIngredients?: string[];
}

// Legacy type alias for backwards compatibility
export type MealDBRecipe = AIRecipe;

export interface FavoriteRecipe {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
}

export interface CookingHistory {
  id: string;
  user_id: string;
  recipe_id: string;
  cooked_at: string;
}

export interface ShoppingListItem {
  id: string;
  user_id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  is_purchased: boolean;
  recipe_id: string | null;
  created_at: string;
}

export interface AnalyzedIngredient {
  name: string;
  category: IngredientCategory;
  confidence: number;
}

// Display labels
export const cuisineLabels: Record<CuisineType, string> = {
  asian: '🍜 Asian',
  mediterranean: '🫒 Mediterranean',
  european: '🥐 European',
  latin_american: '🌮 Latin American',
  american: '🍔 American',
  african: '🍲 African',
  middle_eastern: '🧆 Middle Eastern',
  indian: '🍛 Indian',
  british: '🇬🇧 British',
  other: '🍽️ Other',
};

export const mealTypeLabels: Record<MealType, { label: string; icon: string }> = {
  breakfast: { label: 'Breakfast', icon: '🌅' },
  lunch: { label: 'Lunch', icon: '☀️' },
  dinner: { label: 'Dinner', icon: '🌙' },
  dessert: { label: 'Dessert', icon: '🍰' },
  snack: { label: 'Snack', icon: '🍿' },
};

export const cookingTimeLabels: Record<CookingTimeRange, string> = {
  all: '⏱️ All Times',
  quick: '⚡ Quick (<15 min)',
  '15-30': '🕐 15-30 min',
  '30-45': '🕑 30-45 min',
  '45-60': '🕒 45-60 min',
  '60+': '🕓 1+ hour',
};

export const allergyLabels: Record<FoodAllergy, { label: string; icon: string }> = {
  peanuts: { label: 'Peanuts', icon: '🥜' },
  tree_nuts: { label: 'Tree Nuts', icon: '🌰' },
  milk: { label: 'Dairy', icon: '🥛' },
  eggs: { label: 'Eggs', icon: '🥚' },
  wheat: { label: 'Wheat/Gluten', icon: '🌾' },
  soy: { label: 'Soy', icon: '🫘' },
  fish: { label: 'Fish', icon: '🐟' },
  shellfish: { label: 'Shellfish', icon: '🦐' },
  sesame: { label: 'Sesame', icon: '🫛' },
  mustard: { label: 'Mustard', icon: '🟡' },
  celery: { label: 'Celery', icon: '🥬' },
  sulfites: { label: 'Sulfites', icon: '🍷' },
};

export const dietaryLabels: Record<DietaryPreference, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  gluten_free: 'Gluten Free',
};

export const subscriptionTierLabels: Record<SubscriptionTier, string> = {
  free: 'Free',
  standard: 'Standard',
  premium: 'Premium',
};
