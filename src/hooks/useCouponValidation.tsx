import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CouponValidationResult {
  valid: boolean;
  coupon_id?: string;
  discount_type?: 'percentage' | 'flat';
  discount_value?: number;
  discount_amount?: number;
  final_amount?: number;
  original_amount?: number;
  error_message?: string;
}

export function useCouponValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [couponResult, setCouponResult] = useState<CouponValidationResult | null>(null);

  const validateCoupon = async (code: string, workspaceId: string): Promise<CouponValidationResult> => {
    if (!code.trim()) {
      const result = { valid: false, error_message: 'Please enter a coupon code' };
      setCouponResult(result);
      return result;
    }

    setIsValidating(true);
    setCouponResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('validate-coupon', {
        body: { code: code.trim().toUpperCase(), workspace_id: workspaceId },
      });

      if (error) {
        const result = { valid: false, error_message: 'Failed to validate coupon' };
        setCouponResult(result);
        return result;
      }

      const result = data as CouponValidationResult;
      setCouponResult(result);
      return result;
    } catch (err) {
      const result = { valid: false, error_message: 'Failed to validate coupon' };
      setCouponResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  const clearCoupon = () => {
    setCouponResult(null);
  };

  return {
    validateCoupon,
    clearCoupon,
    isValidating,
    couponResult,
  };
}
