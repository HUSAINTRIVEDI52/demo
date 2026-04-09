import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { z } from 'zod';
import { toast } from 'sonner';
import { OTPInput } from '@/components/auth/OTPInput';
import { useOTPAuth } from '@/hooks/useOTPAuth';
import { useResendCooldown } from '@/hooks/useResendCooldown';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

type Step = 'email' | 'otp' | 'password' | 'success';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { sendOTP, verifyOTP, resetPassword, isLoading } = useOTPAuth();
  const { cooldown, isOnCooldown, startCooldown } = useResendCooldown();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setFieldErrors({ email: result.error.errors[0].message });
      return;
    }

    const { success, error: otpError } = await sendOTP(email, 'password_reset');

    if (!success) {
      setError(otpError || 'Failed to send OTP');
      return;
    }

    toast.success('OTP sent to your email');
    setStep('otp');
    startCooldown();
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    const { valid, error: verifyError } = await verifyOTP(email, otp, 'password_reset');

    if (!valid) {
      setError(verifyError || 'Invalid OTP');
      return;
    }

    setStep('password');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const passResult = passwordSchema.safeParse(password);
    if (!passResult.success) {
      setFieldErrors({ password: passResult.error.errors[0].message });
      return;
    }

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords don't match" });
      return;
    }

    // Pass the verified OTP code along with email and new password
    const { success, error: resetError } = await resetPassword(email, otp, password);

    if (!success) {
      setError(resetError || 'Failed to reset password');
      return;
    }

    setStep('success');
    toast.success('Password reset successfully!');
  };

  const handleResendOTP = async () => {
    if (isOnCooldown) return;
    
    setError(null);
    const { success, error: otpError } = await sendOTP(email, 'password_reset');

    if (!success) {
      setError(otpError || 'Failed to resend OTP');
      return;
    }

    toast.success('OTP resent to your email');
    setOtp('');
    startCooldown();
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center mb-6">
            <Logo size="lg" />
          </Link>
          <h1 className="text-2xl font-display font-bold mb-2">
            {step === 'email' && 'Reset Password'}
            {step === 'otp' && 'Enter OTP'}
            {step === 'password' && 'New Password'}
            {step === 'success' && 'Password Reset!'}
          </h1>
          <p className="text-muted-foreground">
            {step === 'email' && "Enter your email to receive a verification code"}
            {step === 'otp' && `We sent a code to ${email}`}
            {step === 'password' && 'Create a new secure password'}
            {step === 'success' && 'You can now sign in with your new password'}
          </p>
        </div>

        <div className="glass-card p-6 md:p-8 rounded-xl">
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className={fieldErrors.email ? 'border-destructive' : ''}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <OTPInput value={otp} onChange={setOtp} disabled={isLoading} />

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading || isOnCooldown}
                  className={`text-sm ${isOnCooldown ? 'text-muted-foreground cursor-not-allowed' : 'text-accent hover:underline'}`}
                >
                  {isOnCooldown 
                    ? `Resend code in ${cooldown}s` 
                    : "Didn't receive code? Resend"}
                </button>
              </div>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className={fieldErrors.password ? 'border-destructive' : ''}
                />
                {fieldErrors.password && (
                  <p className="text-sm text-destructive">{fieldErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className={fieldErrors.confirmPassword ? 'border-destructive' : ''}
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-accent" />
                </div>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Go to Login
              </Button>
            </div>
          )}

          {step !== 'success' && (
            <div className="mt-6 text-center text-sm">
              <Link to="/login" className="text-accent hover:underline font-medium inline-flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
