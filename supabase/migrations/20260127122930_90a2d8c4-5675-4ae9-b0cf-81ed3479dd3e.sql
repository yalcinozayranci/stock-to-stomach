-- Add created_by column to track recipe ownership
ALTER TABLE public.recipes ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Existing seed recipes will have NULL created_by (community recipes)
-- New user-created recipes will have created_by set

-- Drop and recreate INSERT policy to enforce ownership
DROP POLICY IF EXISTS "Authenticated users can insert recipes" ON public.recipes;
CREATE POLICY "Authenticated users can insert their own recipes"
  ON public.recipes FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid() OR created_by IS NULL
  );

-- Add UPDATE policy for recipe owners
CREATE POLICY "Users can update their own recipes"
  ON public.recipes FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Add DELETE policy for recipe owners  
CREATE POLICY "Users can delete their own recipes"
  ON public.recipes FOR DELETE TO authenticated
  USING (created_by = auth.uid());