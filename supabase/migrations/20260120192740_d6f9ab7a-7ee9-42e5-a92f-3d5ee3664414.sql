-- Drop and recreate the validate_coupon function with qualified column names
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_code TEXT,
  p_plan_price INTEGER,
  p_user_id UUID,
  p_workspace_id UUID
)
RETURNS TABLE(
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
  WHERE UPPER(coupons.code) = UPPER(p_code)
    AND coupons.deleted_at IS NULL
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
  
  -- Check per-user limit (use table alias to avoid ambiguity)
  SELECT COUNT(*) INTO v_user_usage_count
  FROM public.coupon_usages cu
  WHERE cu.coupon_id = v_coupon.id AND cu.user_id = p_user_id;
  
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
  
  -- Ensure final amount is at least 1 (Razorpay minimum)
  IF v_final_amount < 100 THEN
    v_final_amount := 100; -- Minimum ₹1 (100 paise)
  END IF;
  
  -- Return valid coupon with the coupon's ID
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