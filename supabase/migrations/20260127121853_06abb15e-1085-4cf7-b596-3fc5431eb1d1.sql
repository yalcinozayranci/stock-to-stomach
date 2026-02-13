-- Add meal credits tracking to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS meal_credits_used integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS meal_credits_reset_at timestamp with time zone DEFAULT now();

-- Create a function to reset meal credits on subscription renewal
CREATE OR REPLACE FUNCTION public.reset_meal_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Reset credits when subscription period changes
  IF OLD.subscription_expires_at IS DISTINCT FROM NEW.subscription_expires_at THEN
    NEW.meal_credits_used := 0;
    NEW.meal_credits_reset_at := now();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to reset credits on subscription update
DROP TRIGGER IF EXISTS reset_meal_credits_trigger ON public.profiles;
CREATE TRIGGER reset_meal_credits_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.reset_meal_credits();