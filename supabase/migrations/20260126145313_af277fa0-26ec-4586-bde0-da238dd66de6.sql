-- Create a separate table for sensitive Stripe payment data
-- This table has NO RLS policies, making it admin/service-role only
CREATE TABLE public.stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS but add NO policies - only service role can access
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

-- Add trigger for updated_at
CREATE TRIGGER update_stripe_customers_updated_at
  BEFORE UPDATE ON public.stripe_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing stripe_customer_id data from profiles
INSERT INTO public.stripe_customers (user_id, stripe_customer_id)
SELECT user_id, stripe_customer_id 
FROM public.profiles 
WHERE stripe_customer_id IS NOT NULL;

-- Remove the sensitive stripe_customer_id column from profiles
-- Keep subscription_tier, subscription_status, subscription_expires_at as they're safe for client
ALTER TABLE public.profiles DROP COLUMN stripe_customer_id;