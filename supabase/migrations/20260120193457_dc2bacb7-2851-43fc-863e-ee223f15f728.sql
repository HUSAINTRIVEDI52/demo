-- Add RLS policy for super admins to view all payments
CREATE POLICY "Super admins can view all payments"
ON public.payments
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Create index for faster payment queries
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);