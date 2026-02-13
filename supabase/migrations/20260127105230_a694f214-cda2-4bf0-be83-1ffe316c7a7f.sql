-- Enable RLS on stripe_customers table
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

-- Users can only view their own Stripe customer records
CREATE POLICY "Users can view their own stripe customer"
  ON public.stripe_customers FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own Stripe customer record
CREATE POLICY "Users can insert their own stripe customer"
  ON public.stripe_customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own Stripe customer record
CREATE POLICY "Users can update their own stripe customer"
  ON public.stripe_customers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own Stripe customer record
CREATE POLICY "Users can delete their own stripe customer"
  ON public.stripe_customers FOR DELETE
  USING (auth.uid() = user_id);