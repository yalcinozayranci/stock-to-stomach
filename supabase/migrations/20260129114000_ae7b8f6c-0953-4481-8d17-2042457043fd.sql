-- Add scan tracking columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS scan_credits_used integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS scan_credits_reset_at timestamp with time zone DEFAULT now();