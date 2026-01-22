-- Add company logo URL to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company_logo_url text;

-- Drop and recreate the profiles_public view to include logo
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  is_premium,
  created_at,
  updated_at,
  premium_updated_at,
  offers_created_this_month,
  offers_month,
  company_logo_url
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO authenticated;
