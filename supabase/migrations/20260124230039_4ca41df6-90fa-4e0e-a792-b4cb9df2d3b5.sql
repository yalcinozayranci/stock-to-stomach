-- Add enhanced columns to cooking_history for the cooking journal feature
ALTER TABLE public.cooking_history
ADD COLUMN photo_url text,
ADD COLUMN rating integer CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN notes text,
ADD COLUMN feedback text;