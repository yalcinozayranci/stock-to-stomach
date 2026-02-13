-- Create shopping_list_items table
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

-- Enable RLS
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for shopping_list_items
CREATE POLICY "Users can view their own shopping items" 
ON public.shopping_list_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shopping items" 
ON public.shopping_list_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping items" 
ON public.shopping_list_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping items" 
ON public.shopping_list_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_shopping_list_user_id ON public.shopping_list_items(user_id);
CREATE INDEX idx_shopping_list_is_purchased ON public.shopping_list_items(is_purchased);