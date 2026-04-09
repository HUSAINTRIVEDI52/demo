-- Fix #1: Remove the overly permissive OTP codes policy
-- Service role bypasses RLS anyway, so this policy only creates a vulnerability
DROP POLICY IF EXISTS "Service role can manage OTP codes" ON public.otp_codes;

-- Fix #2: Remove the misleading payments policy that allows users to modify their own payments
-- Service role bypasses RLS, so edge functions will still work
-- Keep only the SELECT policies for viewing payments
DROP POLICY IF EXISTS "Service role can manage payments" ON public.payments;

-- Create a table to track OTP rate limiting (for issue #2 - rate limiting)
CREATE TABLE IF NOT EXISTS public.otp_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on rate limits table (no public access needed - service role only)
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_otp_rate_limits_email_window 
ON public.otp_rate_limits (email, window_start);

-- Cleanup function for old rate limit records
CREATE OR REPLACE FUNCTION public.cleanup_otp_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.otp_rate_limits 
  WHERE window_start < now() - interval '1 hour';
END;
$$;