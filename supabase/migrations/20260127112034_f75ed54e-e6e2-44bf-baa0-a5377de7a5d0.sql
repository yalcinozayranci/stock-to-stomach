-- Add UPDATE policy for cooking_history table
CREATE POLICY "Users can update their own cooking history"
  ON public.cooking_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add DELETE policy for cooking_history table
CREATE POLICY "Users can delete their own cooking history"
  ON public.cooking_history FOR DELETE
  USING (auth.uid() = user_id);