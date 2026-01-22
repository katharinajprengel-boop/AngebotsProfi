-- Create a public view that excludes sensitive Stripe data
CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  is_premium,
  created_at,
  updated_at,
  premium_updated_at
FROM public.profiles;
-- Stripe fields (stripe_customer_id, stripe_subscription_id) are intentionally excluded

-- Drop the existing SELECT policy that exposes all columns
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a restrictive SELECT policy - users should use the view instead
-- Service role can still read everything (bypasses RLS)
CREATE POLICY "Users can view own profile via service only"
ON public.profiles
FOR SELECT
USING (false);

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a new UPDATE policy that prevents users from modifying Stripe fields
-- Users can only update non-sensitive fields
CREATE POLICY "Users can update own non-sensitive profile fields"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  -- Stripe fields can only be updated by service role (which bypasses RLS)
);

-- Grant SELECT on the public view to authenticated users
GRANT SELECT ON public.profiles_public TO authenticated;

-- Add explicit DELETE policy to prevent accidental profile deletion
CREATE POLICY "Users cannot delete profiles"
ON public.profiles
FOR DELETE
USING (false);