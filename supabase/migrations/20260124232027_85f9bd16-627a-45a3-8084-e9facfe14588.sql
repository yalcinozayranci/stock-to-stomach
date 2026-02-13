-- Create meal_type enum
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'dessert', 'snack');

-- Add meal_type column to recipes
ALTER TABLE recipes ADD COLUMN meal_type meal_type DEFAULT 'dinner';

-- Add 'british' to cuisine_type enum
ALTER TYPE cuisine_type ADD VALUE 'british';