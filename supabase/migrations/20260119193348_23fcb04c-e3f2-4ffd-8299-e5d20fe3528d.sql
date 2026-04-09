-- Fix function search path for update_portfolio_timestamp
CREATE OR REPLACE FUNCTION public.update_portfolio_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add RLS policy for user_roles table
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_super_admin(auth.uid()));