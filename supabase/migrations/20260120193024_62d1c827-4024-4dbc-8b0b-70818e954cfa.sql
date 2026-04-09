-- Fix coupon validation RPC ambiguity by ensuring only ONE validate_coupon overload exists

-- Drop both existing overloads (they differ only by argument order)
DROP FUNCTION IF EXISTS public.validate_coupon(text, uuid, uuid, integer);
DROP FUNCTION IF EXISTS public.validate_coupon(text, integer, uuid, uuid);

-- Recreate a single canonical function signature
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_code text,
  p_user_id uuid,
  p_workspace_id uuid,
  p_plan_price integer
)
RETURNS TABLE (
  coupon_id uuid,
  discount_amount integer,
  discount_type public.coupon_discount_type,
  discount_value integer,
  error_message text,
  final_amount integer,
  valid boolean
)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_coupon record;
  v_user_usage_count integer := 0;
  v_discount_amount integer := 0;
  v_final_amount integer := p_plan_price;
BEGIN
  -- Normalize
  p_code := upper(trim(p_code));

  -- Lookup coupon (ignore soft-deleted)
  SELECT c.*
    INTO v_coupon
  FROM public.coupons c
  WHERE c.code = p_code
    AND c.deleted_at IS NULL
  LIMIT 1;

  IF v_coupon.id IS NULL THEN
    RETURN QUERY SELECT NULL::uuid, 0, NULL::public.coupon_discount_type, NULL::integer, 'Invalid coupon code', p_plan_price, false;
    RETURN;
  END IF;

  -- Status checks
  IF v_coupon.status <> 'active' THEN
    RETURN QUERY SELECT v_coupon.id, 0, v_coupon.discount_type, v_coupon.discount_value, 'Coupon is not active', p_plan_price, false;
    RETURN;
  END IF;

  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at <= now() THEN
    RETURN QUERY SELECT v_coupon.id, 0, v_coupon.discount_type, v_coupon.discount_value, 'Coupon has expired', p_plan_price, false;
    RETURN;
  END IF;

  IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
    RETURN QUERY SELECT v_coupon.id, 0, v_coupon.discount_type, v_coupon.discount_value, 'Coupon usage limit reached', p_plan_price, false;
    RETURN;
  END IF;

  -- Per-user limit (scoped to this workspace)
  SELECT count(*)
    INTO v_user_usage_count
  FROM public.coupon_usages cu
  WHERE cu.coupon_id = v_coupon.id
    AND cu.user_id = p_user_id
    AND cu.workspace_id = p_workspace_id;

  IF v_user_usage_count >= v_coupon.per_user_limit THEN
    RETURN QUERY SELECT v_coupon.id, 0, v_coupon.discount_type, v_coupon.discount_value, 'You have already used this coupon', p_plan_price, false;
    RETURN;
  END IF;

  -- Compute discount
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount_amount := floor((p_plan_price * v_coupon.discount_value) / 100.0);
  ELSE
    v_discount_amount := least(v_coupon.discount_value, p_plan_price);
  END IF;

  v_final_amount := greatest(p_plan_price - v_discount_amount, 100); -- keep >= ₹1 (100 paise)

  RETURN QUERY
  SELECT v_coupon.id,
         v_discount_amount,
         v_coupon.discount_type,
         v_coupon.discount_value,
         NULL::text,
         v_final_amount,
         true;
END;
$$;