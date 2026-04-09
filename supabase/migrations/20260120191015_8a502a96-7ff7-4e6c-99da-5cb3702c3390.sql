-- Create coupon status enum
CREATE TYPE public.coupon_status AS ENUM ('active', 'disabled', 'expired');

-- Create coupon discount type enum
CREATE TYPE public.coupon_discount_type AS ENUM ('percentage', 'flat');

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type coupon_discount_type NOT NULL DEFAULT 'percentage',
  discount_value INTEGER NOT NULL,
  max_uses INTEGER DEFAULT NULL,
  per_user_limit INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  status coupon_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  CONSTRAINT discount_value_positive CHECK (discount_value > 0),
  CONSTRAINT percentage_max_100 CHECK (discount_type != 'percentage' OR discount_value <= 100),
  CONSTRAINT max_uses_positive CHECK (max_uses IS NULL OR max_uses > 0),
  CONSTRAINT per_user_limit_positive CHECK (per_user_limit > 0)
);

-- Create coupon usages table
CREATE TABLE public.coupon_usages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  discount_applied INTEGER NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

-- Coupons policies (super admin only for management)
CREATE POLICY "Super admins can manage coupons"
ON public.coupons
FOR ALL
USING (is_super_admin(auth.uid()));

-- Coupon usages policies
CREATE POLICY "Super admins can view all usages"
ON public.coupon_usages
FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users can view their own usages"
ON public.coupon_usages
FOR SELECT
USING (auth.uid() = user_id);

-- Create indexes for efficient querying
CREATE INDEX idx_coupons_code ON public.coupons(code) WHERE deleted_at IS NULL;
CREATE INDEX idx_coupons_status ON public.coupons(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_coupon_usages_coupon ON public.coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usages_user ON public.coupon_usages(user_id);
CREATE INDEX idx_coupon_usages_workspace ON public.coupon_usages(workspace_id);

-- Auto-update updated_at trigger
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_portfolio_timestamp();

-- Function to validate coupon (used by edge function)
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_code TEXT,
  p_user_id UUID,
  p_workspace_id UUID,
  p_plan_price INTEGER
)
RETURNS TABLE (
  valid BOOLEAN,
  coupon_id UUID,
  discount_type coupon_discount_type,
  discount_value INTEGER,
  discount_amount INTEGER,
  final_amount INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon RECORD;
  v_user_usage_count INTEGER;
  v_discount_amount INTEGER;
  v_final_amount INTEGER;
BEGIN
  -- Find the coupon
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE UPPER(code) = UPPER(p_code)
    AND deleted_at IS NULL
  FOR UPDATE; -- Lock row to prevent race conditions
  
  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::coupon_discount_type, NULL::INTEGER, NULL::INTEGER, NULL::INTEGER, 'Invalid coupon code'::TEXT;
    RETURN;
  END IF;
  
  -- Check if coupon is active
  IF v_coupon.status != 'active' THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::coupon_discount_type, NULL::INTEGER, NULL::INTEGER, NULL::INTEGER, 'This coupon is no longer active'::TEXT;
    RETURN;
  END IF;
  
  -- Check expiration
  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::coupon_discount_type, NULL::INTEGER, NULL::INTEGER, NULL::INTEGER, 'This coupon has expired'::TEXT;
    RETURN;
  END IF;
  
  -- Check global usage limit
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::coupon_discount_type, NULL::INTEGER, NULL::INTEGER, NULL::INTEGER, 'This coupon has reached its usage limit'::TEXT;
    RETURN;
  END IF;
  
  -- Check per-user limit
  SELECT COUNT(*) INTO v_user_usage_count
  FROM public.coupon_usages
  WHERE coupon_id = v_coupon.id AND user_id = p_user_id;
  
  IF v_user_usage_count >= v_coupon.per_user_limit THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::coupon_discount_type, NULL::INTEGER, NULL::INTEGER, NULL::INTEGER, 'You have already used this coupon'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate discount
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount_amount := (p_plan_price * v_coupon.discount_value) / 100;
  ELSE
    v_discount_amount := v_coupon.discount_value;
  END IF;
  
  -- Ensure discount doesn't exceed plan price
  IF v_discount_amount > p_plan_price THEN
    v_discount_amount := p_plan_price;
  END IF;
  
  v_final_amount := p_plan_price - v_discount_amount;
  
  -- Ensure final amount is not negative
  IF v_final_amount < 0 THEN
    v_final_amount := 0;
  END IF;
  
  RETURN QUERY SELECT 
    true, 
    v_coupon.id, 
    v_coupon.discount_type, 
    v_coupon.discount_value, 
    v_discount_amount, 
    v_final_amount, 
    NULL::TEXT;
END;
$$;

-- Function to record coupon usage atomically
CREATE OR REPLACE FUNCTION public.use_coupon(
  p_coupon_id UUID,
  p_user_id UUID,
  p_workspace_id UUID,
  p_payment_id UUID,
  p_discount_applied INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increment used_count atomically
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE id = p_coupon_id;
  
  -- Record usage
  INSERT INTO public.coupon_usages (coupon_id, user_id, workspace_id, payment_id, discount_applied)
  VALUES (p_coupon_id, p_user_id, p_workspace_id, p_payment_id, p_discount_applied);
  
  RETURN true;
END;
$$;