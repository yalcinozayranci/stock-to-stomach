-- Add subscription fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
ADD COLUMN subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
ADD COLUMN stripe_customer_id text UNIQUE,
ADD COLUMN subscription_expires_at timestamp with time zone;