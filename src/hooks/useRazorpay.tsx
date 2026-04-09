import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PLAN_DEFINITIONS, PlanType } from '@/hooks/usePlanLimits';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount?: number;
  currency?: string;
  name: string;
  description: string;
  order_id?: string;
  subscription_id?: string;
  prefill: {
    name?: string;
    email?: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  recurring?: boolean;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
}

interface CouponInfo {
  coupon_code: string;
  coupon_id: string;
  discount_amount: number;
}

interface PaymentOptions {
  targetPlan: 'starter' | 'pro';
  couponInfo?: CouponInfo;
}

interface UseRazorpayResult {
  initiatePayment: (options: PaymentOptions) => Promise<void>;
  loadScript: () => Promise<boolean>;
  isLoading: boolean;
  isScriptLoaded: boolean;
}

// Lazy load Razorpay script only when needed
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    
    if (existingScript) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      toast.error('Failed to load payment gateway');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export function useRazorpay(): UseRazorpayResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(
    typeof window !== 'undefined' && !!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
  );
  const loadingRef = useRef(false);
  const { workspace, refetch } = useWorkspace();
  const { user } = useAuth();

  // Manually trigger script loading (called when upgrade modal opens)
  const loadScript = useCallback(async () => {
    if (isScriptLoaded || loadingRef.current) return isScriptLoaded;
    
    loadingRef.current = true;
    const loaded = await loadRazorpayScript();
    setIsScriptLoaded(loaded);
    loadingRef.current = false;
    return loaded;
  }, [isScriptLoaded]);

  const initiatePayment = useCallback(async ({ targetPlan, couponInfo }: PaymentOptions) => {
    if (!workspace?.id) {
      toast.error('Workspace not found');
      return;
    }

    if (!user) {
      toast.error('Please log in to continue');
      return;
    }

    setIsLoading(true);

    try {
      // Load script if not already loaded
      if (!isScriptLoaded) {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          toast.error('Payment gateway failed to load');
          setIsLoading(false);
          return;
        }
        setIsScriptLoaded(true);
      }

      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        toast.error('Session expired. Please log in again.');
        return;
      }

      // Try subscription endpoint first, fall back to order-based
      const { data, error } = await supabase.functions.invoke('create-razorpay-subscription', {
        body: { 
          workspace_id: workspace.id,
          coupon_code: couponInfo?.coupon_code || null,
          target_plan: targetPlan,
        },
      });

      if (error) {
        console.error('Subscription creation network error:', error);
        toast.error(error.message || 'Failed to connect to payment server');
        return;
      }

      if (!data) {
        toast.error('Empty response from payment server');
        return;
      }

      // The edge function always returns 200 with success flag
      if (data.success === false) {
        console.error('Edge function error:', data.error, 'at step:', data.step);
        toast.error(data.error || 'Payment initialization failed');
        return;
      }

      const planDisplayName = PLAN_DEFINITIONS[targetPlan as PlanType]?.displayName || targetPlan;
      const themeColor = targetPlan === 'starter' ? '#3b82f6' : '#f59e0b';
      const trialDays = data.trial_days || 7;

      // Determine if this is a subscription or order-based flow
      const isSubscription = data.type === 'subscription';

      const options: RazorpayOptions = {
        key: data.key_id,
        name: 'MakePortfolios',
        description: `${planDisplayName} Plan - 7 Day Free Trial, then ₹${data.amount / 100}/year`,
        prefill: {
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
        },
        theme: {
          color: themeColor,
        },
        handler: async (response: RazorpayResponse) => {
          try {
            // For subscription flow, the webhook handles everything
            if (isSubscription) {
              toast.success(`🎉 Your ${trialDays}-day free trial has started! Your ${planDisplayName} plan will activate automatically.`);
              await refetch();
              return;
            }

            // For order-based flow, verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              'verify-razorpay-payment',
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  workspace_id: workspace.id,
                  coupon_id: data.coupon_id || null,
                  discount_amount: data.discount_amount || 0,
                  target_plan: targetPlan,
                  is_subscription: true,
                  trial_days: trialDays,
                },
              }
            );

            if (verifyError) {
              console.error('Verification error:', verifyError);
              toast.error('Payment verification failed. Please contact support.');
              return;
            }

            if (verifyData?.success) {
              toast.success(`🎉 Your ${trialDays}-day free trial has started! Welcome to ${planDisplayName}!`);
              await refetch();
            } else {
              toast.error(verifyData?.error || 'Payment verification failed');
            }
          } catch (err) {
            console.error('Verification exception:', err);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled');
          },
        },
      };

      // Add subscription or order specific options
      if (isSubscription && data.subscription_id) {
        options.subscription_id = data.subscription_id;
        options.recurring = true;
      } else if (data.order_id) {
        options.order_id = data.order_id;
        options.amount = data.amount;
        options.currency = data.currency;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Payment initiation error:', err);
      toast.error('Failed to initiate payment');
    } finally {
      setIsLoading(false);
    }
  }, [workspace?.id, user, isScriptLoaded, refetch]);

  return {
    initiatePayment,
    loadScript,
    isLoading,
    isScriptLoaded,
  };
}
