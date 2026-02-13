-- Add new enum values for ingredient categories
ALTER TYPE public.ingredient_category ADD VALUE IF NOT EXISTS 'meat_protein';
ALTER TYPE public.ingredient_category ADD VALUE IF NOT EXISTS 'vegetables';
ALTER TYPE public.ingredient_category ADD VALUE IF NOT EXISTS 'fruits';
ALTER TYPE public.ingredient_category ADD VALUE IF NOT EXISTS 'grains_bakery';
ALTER TYPE public.ingredient_category ADD VALUE IF NOT EXISTS 'nuts_seeds_pantry';
ALTER TYPE public.ingredient_category ADD VALUE IF NOT EXISTS 'herbs_spices';