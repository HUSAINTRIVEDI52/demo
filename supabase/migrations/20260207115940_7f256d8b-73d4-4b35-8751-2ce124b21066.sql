-- Add explicit RLS policies to otp_codes table
-- This table should only be accessible via edge functions using service role
-- No public access should be allowed

-- Policy: No public SELECT access to OTP codes
CREATE POLICY "No public access to otp_codes"
ON public.otp_codes
FOR ALL
USING (false)
WITH CHECK (false);

-- Add explicit RLS policies to otp_rate_limits table  
-- This table should only be accessible via edge functions using service role
-- No public access should be allowed

-- Policy: No public access to rate limits
CREATE POLICY "No public access to otp_rate_limits"
ON public.otp_rate_limits
FOR ALL
USING (false)
WITH CHECK (false);