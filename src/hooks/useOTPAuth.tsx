import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type OTPType = 'email_verification' | 'password_reset' | 'login';

interface UseOTPAuthReturn {
  sendOTP: (email: string, type: OTPType) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (email: string, code: string, type: OTPType) => Promise<{ valid: boolean; error?: string; actionUrl?: string; isNewUser?: boolean }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

export function useOTPAuth(): UseOTPAuthReturn {
  const [isLoading, setIsLoading] = useState(false);

  const sendOTP = async (email: string, type: OTPType) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp-email', {
        body: { email, type },
      });

      if (error) {
        console.error('Send OTP error:', error);
        return { success: false, error: error.message || 'Failed to send OTP' };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (err: any) {
      console.error('Send OTP exception:', err);
      return { success: false, error: err.message || 'Failed to send OTP' };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, code: string, type: OTPType) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { email, code, type },
      });

      if (error) {
        console.error('Verify OTP error:', error);
        return { valid: false, error: error.message || 'Failed to verify OTP' };
      }

      if (data?.error) {
        return { valid: false, error: data.error };
      }

      return { 
        valid: data?.valid ?? false, 
        actionUrl: data?.actionUrl,
        isNewUser: data?.isNewUser ?? false,
      };
    } catch (err: any) {
      console.error('Verify OTP exception:', err);
      return { valid: false, error: err.message || 'Failed to verify OTP' };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { email, code, newPassword },
      });

      if (error) {
        console.error('Reset password error:', error);
        return { success: false, error: error.message || 'Failed to reset password' };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (err: any) {
      console.error('Reset password exception:', err);
      return { success: false, error: err.message || 'Failed to reset password' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendOTP,
    verifyOTP,
    resetPassword,
    isLoading,
  };
}
