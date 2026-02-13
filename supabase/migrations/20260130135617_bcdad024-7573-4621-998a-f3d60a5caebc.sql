-- 1. Add is_public column to recipes
ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

-- 2. Drop old permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view recipes" ON public.recipes;

-- 3. Create new restrictive SELECT policy
CREATE POLICY "Users can view public recipes or their own" ON public.recipes
FOR SELECT USING (
  is_public = true OR created_by = auth.uid()
);

-- 4. Add DELETE policy to profiles
CREATE POLICY "Users can delete their own profile" ON public.profiles
FOR DELETE USING (auth.uid() = user_id);

-- 5. Add UPDATE policy to favorite_recipes
CREATE POLICY "Users can update their own favorites" ON public.favorite_recipes
FOR UPDATE USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);