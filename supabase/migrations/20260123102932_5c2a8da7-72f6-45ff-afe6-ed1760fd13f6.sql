-- Create cuisine type enum
CREATE TYPE public.cuisine_type AS ENUM (
  'asian', 'mediterranean', 'european', 
  'latin_american', 'american', 'african', 
  'middle_eastern', 'indian', 'other'
);

-- Create food allergy enum
CREATE TYPE public.food_allergy AS ENUM (
  'peanuts', 'tree_nuts', 'milk', 'eggs', 
  'wheat', 'soy', 'fish', 'shellfish', 
  'sesame', 'mustard', 'celery', 'sulfites'
);

-- Add cuisine column to recipes table
ALTER TABLE public.recipes 
ADD COLUMN cuisine public.cuisine_type DEFAULT 'other';

-- Add allergies column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN allergies public.food_allergy[] DEFAULT '{}'::food_allergy[];

-- Add favorite cuisines to profiles
ALTER TABLE public.profiles 
ADD COLUMN favorite_cuisines public.cuisine_type[] DEFAULT '{}'::cuisine_type[];

-- Add has_completed_onboarding to track if user finished setup
ALTER TABLE public.profiles 
ADD COLUMN has_completed_onboarding boolean DEFAULT false;