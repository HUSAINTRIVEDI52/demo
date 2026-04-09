import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

export type AdminActionType = 
  | 'user_suspend'
  | 'user_reactivate'
  | 'workspace_plan_upgrade'
  | 'workspace_plan_downgrade'
  | 'coupon_create'
  | 'coupon_edit'
  | 'coupon_disable'
  | 'manual_pro_assignment'
  | 'theme_enable'
  | 'theme_disable'
  | 'theme_access_change'
  | 'feature_enable'
  | 'feature_disable'
  | 'forced_unpublish'
  | 'payment_override';

export type TargetType = 'user' | 'workspace' | 'coupon' | 'payment' | 'system' | 'theme' | 'feature';

interface LogAdminActionParams {
  actionType: AdminActionType;
  targetType: TargetType;
  targetId: string;
  description: string;
  metadata?: Json;
}

// Get client IP address (best effort - will be captured server-side for accuracy)
async function getClientIpAddress(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json', { 
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    const data = await response.json();
    return data.ip || null;
  } catch {
    return null; // Non-blocking - IP capture is best effort
  }
}

export function useAdminLogger() {
  const { user } = useAuth();

  const logAction = useCallback(async ({
    actionType,
    targetType,
    targetId,
    description,
    metadata = {},
  }: LogAdminActionParams): Promise<void> => {
    if (!user?.id) {
      console.warn('Admin logger: No user ID available');
      return;
    }

    // Non-blocking async logging - fire and forget
    (async () => {
      try {
        const ipAddress = await getClientIpAddress();

        const { error } = await supabase
          .from('admin_action_logs')
          .insert([{
            admin_user_id: user.id,
            action_type: actionType,
            target_type: targetType,
            target_id: targetId,
            description,
            details: metadata,
            ip_address: ipAddress,
          }]);

        if (error) {
          console.error('Failed to log admin action:', error);
          // Failure to log should NOT block the admin action
        }
      } catch (err) {
        console.error('Error in admin logger:', err);
        // Non-blocking - don't throw
      }
    })();
  }, [user?.id]);

  return { logAction };
}

// Action description helpers for consistent log messages
export const actionDescriptions = {
  user_suspend: (email: string) => `Suspended user: ${email}`,
  user_reactivate: (email: string) => `Reactivated user: ${email}`,
  workspace_plan_upgrade: (name: string, plan: string) => `Upgraded workspace "${name}" to ${plan}`,
  workspace_plan_downgrade: (name: string, plan: string) => `Downgraded workspace "${name}" to ${plan}`,
  coupon_create: (code: string) => `Created coupon: ${code}`,
  coupon_edit: (code: string) => `Edited coupon: ${code}`,
  coupon_disable: (code: string) => `Disabled coupon: ${code}`,
  manual_pro_assignment: (email: string) => `Manually assigned Pro plan to: ${email}`,
  theme_enable: (name: string) => `Enabled theme: ${name}`,
  theme_disable: (name: string) => `Disabled theme: ${name}`,
  theme_access_change: (name: string, level: string) => `Changed theme "${name}" access to: ${level}`,
  feature_enable: (name: string) => `Enabled feature: ${name}`,
  feature_disable: (name: string) => `Disabled feature: ${name}`,
  forced_unpublish: (slug: string) => `Force unpublished portfolio: ${slug}`,
  payment_override: (paymentId: string, action: string) => `Payment override (${action}): ${paymentId}`,
};
