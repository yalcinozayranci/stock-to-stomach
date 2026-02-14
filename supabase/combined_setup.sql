-- ============================================
-- COOKFROMHERE - Complete Database Setup
-- Run this in Supabase SQL Editor (new project)
-- ============================================

-- ===================
-- 1. ENUMS
-- ===================
CREATE TYPE public.dietary_preference AS ENUM ('vegetarian', 'vegan', 'gluten_free');

CREATE TYPE public.ingredient_category AS ENUM (
  'produce', 'proteins', 'dairy', 'pantry', 'spices', 'other',
  'meat_protein', 'vegetables', 'fruits', 'grains_bakery', 'nuts_seeds_pantry', 'herbs_spices'
);

CREATE TYPE public.recipe_difficulty AS ENUM ('easy', 'medium', 'hard');

CREATE TYPE public.cuisine_type AS ENUM (
  'asian', 'mediterranean', 'european',
  'latin_american', 'american', 'african',
  'middle_eastern', 'indian', 'other', 'british'
);

CREATE TYPE public.food_allergy AS ENUM (
  'peanuts', 'tree_nuts', 'milk', 'eggs',
  'wheat', 'soy', 'fish', 'shellfish',
  'sesame', 'mustard', 'celery', 'sulfites'
);

CREATE TYPE public.meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'dessert', 'snack');

-- ===================
-- 2. TABLES
-- ===================

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  dietary_preferences dietary_preference[] DEFAULT '{}',
  allergies food_allergy[] DEFAULT '{}'::food_allergy[],
  favorite_cuisines cuisine_type[] DEFAULT '{}'::cuisine_type[],
  has_completed_onboarding boolean DEFAULT false,
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'standard', 'premium')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  subscription_expires_at timestamp with time zone,
  meal_credits_used integer NOT NULL DEFAULT 0,
  meal_credits_reset_at timestamp with time zone DEFAULT now(),
  scan_credits_used integer NOT NULL DEFAULT 0,
  scan_credits_reset_at timestamp with time zone DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Pantry items table
CREATE TABLE public.pantry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category ingredient_category DEFAULT 'other',
  quantity TEXT,
  unit TEXT,
  expires_at DATE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pantry items"
  ON public.pantry_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pantry items"
  ON public.pantry_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pantry items"
  ON public.pantry_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pantry items"
  ON public.pantry_items FOR DELETE
  USING (auth.uid() = user_id);

-- Recipes table
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cooking_time_minutes INTEGER,
  difficulty recipe_difficulty DEFAULT 'medium',
  servings INTEGER DEFAULT 4,
  ingredients JSONB NOT NULL DEFAULT '[]',
  instructions JSONB NOT NULL DEFAULT '[]',
  dietary_tags dietary_preference[] DEFAULT '{}',
  cuisine cuisine_type DEFAULT 'other',
  meal_type meal_type DEFAULT 'dinner',
  is_ai_generated BOOLEAN DEFAULT false,
  is_public boolean NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public recipes or their own"
  ON public.recipes FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Authenticated users can insert their own recipes"
  ON public.recipes FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

CREATE POLICY "Users can update their own recipes"
  ON public.recipes FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own recipes"
  ON public.recipes FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- Favorite recipes table
CREATE TABLE public.favorite_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, recipe_id)
);

ALTER TABLE public.favorite_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON public.favorite_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON public.favorite_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites"
  ON public.favorite_recipes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorite_recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Cooking history table
CREATE TABLE public.cooking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  photo_url text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  notes text,
  feedback text,
  cooked_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.cooking_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cooking history"
  ON public.cooking_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cooking history"
  ON public.cooking_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cooking history"
  ON public.cooking_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cooking history"
  ON public.cooking_history FOR DELETE
  USING (auth.uid() = user_id);

-- Shopping list items table
CREATE TABLE public.shopping_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  quantity TEXT,
  unit TEXT,
  is_purchased BOOLEAN NOT NULL DEFAULT false,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shopping items"
  ON public.shopping_list_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shopping items"
  ON public.shopping_list_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping items"
  ON public.shopping_list_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping items"
  ON public.shopping_list_items FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_shopping_list_user_id ON public.shopping_list_items(user_id);
CREATE INDEX idx_shopping_list_is_purchased ON public.shopping_list_items(is_purchased);

-- Stripe customers table (sensitive data)
CREATE TABLE public.stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stripe customer"
  ON public.stripe_customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stripe customer"
  ON public.stripe_customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stripe customer"
  ON public.stripe_customers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stripe customer"
  ON public.stripe_customers FOR DELETE
  USING (auth.uid() = user_id);

-- ===================
-- 3. FUNCTIONS & TRIGGERS
-- ===================

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pantry_items_updated_at
  BEFORE UPDATE ON public.pantry_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stripe_customers_updated_at
  BEFORE UPDATE ON public.stripe_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Reset meal credits on subscription renewal
CREATE OR REPLACE FUNCTION public.reset_meal_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.subscription_expires_at IS DISTINCT FROM NEW.subscription_expires_at THEN
    NEW.meal_credits_used := 0;
    NEW.meal_credits_reset_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER reset_meal_credits_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.reset_meal_credits();

-- ===================
-- 4. STORAGE BUCKETS
-- ===================

INSERT INTO storage.buckets (id, name, public)
VALUES ('ingredient-photos', 'ingredient-photos', true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Ingredient photos policies
CREATE POLICY "Authenticated users can upload ingredient photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ingredient-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view ingredient photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ingredient-photos');

CREATE POLICY "Users can delete their own ingredient photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'ingredient-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Avatar policies
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- ===================
-- 5. SEED DATA (Starter Recipes)
-- ===================

INSERT INTO public.recipes (title, description, image_url, cooking_time_minutes, difficulty, servings, ingredients, instructions, dietary_tags, cuisine, meal_type) VALUES
('Vegetable Stir Fry', 'A quick and healthy stir fry packed with colorful vegetables', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800', 20, 'easy', 4,
  '[{"name": "bell peppers", "amount": "2", "unit": "pieces"}, {"name": "broccoli", "amount": "2", "unit": "cups"}, {"name": "carrots", "amount": "2", "unit": "pieces"}, {"name": "soy sauce", "amount": "3", "unit": "tbsp"}, {"name": "garlic", "amount": "3", "unit": "cloves"}]',
  '["Heat oil in a wok over high heat", "Add garlic and cook for 30 seconds", "Add carrots and cook for 2 minutes", "Add bell peppers and broccoli", "Stir fry for 5 minutes", "Add soy sauce and toss well", "Serve hot over rice"]',
  '{"vegetarian", "vegan"}', 'asian', 'dinner'),
('Creamy Pasta Carbonara', 'Classic Italian pasta with a rich, creamy sauce', 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800', 25, 'medium', 4,
  '[{"name": "spaghetti", "amount": "400", "unit": "g"}, {"name": "bacon", "amount": "200", "unit": "g"}, {"name": "eggs", "amount": "4", "unit": "pieces"}, {"name": "parmesan", "amount": "100", "unit": "g"}, {"name": "black pepper", "amount": "1", "unit": "tsp"}]',
  '["Cook pasta according to package", "Fry bacon until crispy", "Beat eggs with parmesan", "Drain pasta, reserve some water", "Mix hot pasta with bacon", "Remove from heat, add egg mixture", "Toss quickly, add pasta water if needed", "Season with pepper and serve"]',
  '{}', 'european', 'dinner'),
('Garden Fresh Salad', 'A light and refreshing salad with seasonal vegetables', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', 10, 'easy', 2,
  '[{"name": "mixed greens", "amount": "4", "unit": "cups"}, {"name": "cherry tomatoes", "amount": "1", "unit": "cup"}, {"name": "cucumber", "amount": "1", "unit": "piece"}, {"name": "olive oil", "amount": "2", "unit": "tbsp"}, {"name": "lemon", "amount": "1", "unit": "piece"}]',
  '["Wash and dry all vegetables", "Slice cucumber and halve tomatoes", "Combine greens in a large bowl", "Add tomatoes and cucumber", "Drizzle with olive oil", "Squeeze lemon juice over salad", "Toss gently and serve"]',
  '{"vegetarian", "vegan", "gluten_free"}', 'mediterranean', 'lunch'),
('Grilled Chicken with Herbs', 'Juicy grilled chicken with aromatic herbs', 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800', 35, 'medium', 4,
  '[{"name": "chicken breast", "amount": "4", "unit": "pieces"}, {"name": "rosemary", "amount": "2", "unit": "sprigs"}, {"name": "thyme", "amount": "2", "unit": "sprigs"}, {"name": "garlic", "amount": "4", "unit": "cloves"}, {"name": "olive oil", "amount": "3", "unit": "tbsp"}]',
  '["Pound chicken to even thickness", "Mix herbs, garlic, and oil", "Marinate chicken for 30 minutes", "Preheat grill to medium-high", "Grill chicken 6-7 minutes per side", "Let rest for 5 minutes", "Slice and serve"]',
  '{"gluten_free"}', 'american', 'dinner'),
('Mushroom Risotto', 'Creamy Italian risotto with earthy mushrooms', 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800', 45, 'hard', 4,
  '[{"name": "arborio rice", "amount": "300", "unit": "g"}, {"name": "mushrooms", "amount": "300", "unit": "g"}, {"name": "onion", "amount": "1", "unit": "piece"}, {"name": "white wine", "amount": "150", "unit": "ml"}, {"name": "vegetable broth", "amount": "1", "unit": "liter"}, {"name": "parmesan", "amount": "50", "unit": "g"}]',
  '["Keep broth warm on low heat", "Sauté onion until translucent", "Add mushrooms, cook until golden", "Add rice, toast for 2 minutes", "Add wine, stir until absorbed", "Add broth one ladle at a time", "Stir constantly for 18-20 minutes", "Finish with parmesan and butter"]',
  '{"vegetarian", "gluten_free"}', 'european', 'dinner');
