-- Add offer tracking columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS offers_created_this_month integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS offers_month text;

-- Drop and recreate the profiles_public view to include new columns
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public AS
SELECT 
  id,
  user_id,
  is_premium,
  created_at,
  updated_at,
  premium_updated_at,
  offers_created_this_month,
  offers_month
FROM public.profiles;

-- Update RLS policy to allow updating the offer count fields
DROP POLICY IF EXISTS "Users can update own non-sensitive profile fields" ON public.profiles;

CREATE POLICY "Users can update own non-sensitive profile fields" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);