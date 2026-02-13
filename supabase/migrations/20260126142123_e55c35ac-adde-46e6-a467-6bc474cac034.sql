-- Migrate existing data to new categories
UPDATE public.pantry_items SET category = 'meat_protein' WHERE category = 'proteins';
UPDATE public.pantry_items SET category = 'vegetables' WHERE category = 'produce';
UPDATE public.pantry_items SET category = 'nuts_seeds_pantry' WHERE category = 'pantry';
UPDATE public.pantry_items SET category = 'herbs_spices' WHERE category = 'spices';