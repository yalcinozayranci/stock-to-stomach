-- Create dietary preference enum
CREATE TYPE public.dietary_preference AS ENUM ('vegetarian', 'vegan', 'gluten_free');

-- Create ingredient category enum
CREATE TYPE public.ingredient_category AS ENUM ('produce', 'proteins', 'dairy', 'pantry', 'spices', 'other');

-- Create recipe difficulty enum
CREATE TYPE public.recipe_difficulty AS ENUM ('easy', 'medium', 'hard');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  dietary_preferences dietary_preference[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create pantry_items table for user ingredients
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

-- Enable RLS on pantry_items
ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;

-- Pantry items policies
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

-- Create recipes table
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
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on recipes (public read, authenticated write for AI recipes)
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Anyone can view recipes
CREATE POLICY "Anyone can view recipes"
  ON public.recipes FOR SELECT
  USING (true);

-- Only authenticated users can insert (for AI-generated recipes)
CREATE POLICY "Authenticated users can insert recipes"
  ON public.recipes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create favorite_recipes table
CREATE TABLE public.favorite_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, recipe_id)
);

-- Enable RLS on favorite_recipes
ALTER TABLE public.favorite_recipes ENABLE ROW LEVEL SECURITY;

-- Favorite recipes policies
CREATE POLICY "Users can view their own favorites"
  ON public.favorite_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON public.favorite_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorite_recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Create cooking_history table
CREATE TABLE public.cooking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  cooked_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on cooking_history
ALTER TABLE public.cooking_history ENABLE ROW LEVEL SECURITY;

-- Cooking history policies
CREATE POLICY "Users can view their own cooking history"
  ON public.cooking_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cooking history"
  ON public.cooking_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pantry_items_updated_at
  BEFORE UPDATE ON public.pantry_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for ingredient photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('ingredient-photos', 'ingredient-photos', true);

-- Storage policies for ingredient photos
CREATE POLICY "Authenticated users can upload ingredient photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ingredient-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view ingredient photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ingredient-photos');

CREATE POLICY "Users can delete their own ingredient photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'ingredient-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert some starter recipes
INSERT INTO public.recipes (title, description, image_url, cooking_time_minutes, difficulty, servings, ingredients, instructions, dietary_tags) VALUES
('Vegetable Stir Fry', 'A quick and healthy stir fry packed with colorful vegetables', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800', 20, 'easy', 4, 
  '[{"name": "bell peppers", "amount": "2", "unit": "pieces"}, {"name": "broccoli", "amount": "2", "unit": "cups"}, {"name": "carrots", "amount": "2", "unit": "pieces"}, {"name": "soy sauce", "amount": "3", "unit": "tbsp"}, {"name": "garlic", "amount": "3", "unit": "cloves"}]',
  '["Heat oil in a wok over high heat", "Add garlic and cook for 30 seconds", "Add carrots and cook for 2 minutes", "Add bell peppers and broccoli", "Stir fry for 5 minutes", "Add soy sauce and toss well", "Serve hot over rice"]',
  '{"vegetarian", "vegan"}'),
('Creamy Pasta Carbonara', 'Classic Italian pasta with a rich, creamy sauce', 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800', 25, 'medium', 4,
  '[{"name": "spaghetti", "amount": "400", "unit": "g"}, {"name": "bacon", "amount": "200", "unit": "g"}, {"name": "eggs", "amount": "4", "unit": "pieces"}, {"name": "parmesan", "amount": "100", "unit": "g"}, {"name": "black pepper", "amount": "1", "unit": "tsp"}]',
  '["Cook pasta according to package", "Fry bacon until crispy", "Beat eggs with parmesan", "Drain pasta, reserve some water", "Mix hot pasta with bacon", "Remove from heat, add egg mixture", "Toss quickly, add pasta water if needed", "Season with pepper and serve"]',
  '{}'),
('Garden Fresh Salad', 'A light and refreshing salad with seasonal vegetables', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', 10, 'easy', 2,
  '[{"name": "mixed greens", "amount": "4", "unit": "cups"}, {"name": "cherry tomatoes", "amount": "1", "unit": "cup"}, {"name": "cucumber", "amount": "1", "unit": "piece"}, {"name": "olive oil", "amount": "2", "unit": "tbsp"}, {"name": "lemon", "amount": "1", "unit": "piece"}]',
  '["Wash and dry all vegetables", "Slice cucumber and halve tomatoes", "Combine greens in a large bowl", "Add tomatoes and cucumber", "Drizzle with olive oil", "Squeeze lemon juice over salad", "Toss gently and serve"]',
  '{"vegetarian", "vegan", "gluten_free"}'),
('Grilled Chicken with Herbs', 'Juicy grilled chicken with aromatic herbs', 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800', 35, 'medium', 4,
  '[{"name": "chicken breast", "amount": "4", "unit": "pieces"}, {"name": "rosemary", "amount": "2", "unit": "sprigs"}, {"name": "thyme", "amount": "2", "unit": "sprigs"}, {"name": "garlic", "amount": "4", "unit": "cloves"}, {"name": "olive oil", "amount": "3", "unit": "tbsp"}]',
  '["Pound chicken to even thickness", "Mix herbs, garlic, and oil", "Marinate chicken for 30 minutes", "Preheat grill to medium-high", "Grill chicken 6-7 minutes per side", "Let rest for 5 minutes", "Slice and serve"]',
  '{"gluten_free"}'),
('Mushroom Risotto', 'Creamy Italian risotto with earthy mushrooms', 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800', 45, 'hard', 4,
  '[{"name": "arborio rice", "amount": "300", "unit": "g"}, {"name": "mushrooms", "amount": "300", "unit": "g"}, {"name": "onion", "amount": "1", "unit": "piece"}, {"name": "white wine", "amount": "150", "unit": "ml"}, {"name": "vegetable broth", "amount": "1", "unit": "liter"}, {"name": "parmesan", "amount": "50", "unit": "g"}]',
  '["Keep broth warm on low heat", "Sauté onion until translucent", "Add mushrooms, cook until golden", "Add rice, toast for 2 minutes", "Add wine, stir until absorbed", "Add broth one ladle at a time", "Stir constantly for 18-20 minutes", "Finish with parmesan and butter"]',
  '{"vegetarian", "gluten_free"}');