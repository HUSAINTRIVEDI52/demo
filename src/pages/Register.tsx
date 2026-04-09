import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle, Mail, KeyRound, User } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { z } from 'zod';
import { toast } from 'sonner';
import { OTPInput } from '@/components/auth/OTPInput';
import { useOTPAuth } from '@/hooks/useOTPAuth';
import { useResendCooldown } from '@/hooks/useResendCooldown';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { GlassCard } from '@/components/auth/GlassCard';
import { PremiumAuthInput } from '@/components/auth/PremiumAuthInput';
import { motion } from 'framer-motion';
import { BRAND } from '@/config/branding';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address').max(255),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type Step = 'register' | 'verify' | 'success';

export default function Register() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signUp } = useAuth();
  const { sendOTP, verifyOTP, isLoading: otpLoading } = useOTPAuth();
  const { cooldown, isOnCooldown, startCooldown } = useResendCooldown();

  const [step, setStep] = useState<Step>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = registerSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    const { error: signUpError } = await signUp(email, password, fullName);

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return;
    }

    const { success, error: otpError } = await sendOTP(email, 'email_verification');

    if (!success) {
      console.error('Failed to send verification OTP:', otpError);
      toast.success('Account created! Please verify your email.');
    } else {
      startCooldown();
    }

    setLoading(false);
    setStep('verify');
    toast.success('Account created! Please verify your email.');
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    const { valid, error: verifyError } = await verifyOTP(email, otp, 'email_verification');

    if (!valid) {
      setError(verifyError || 'Invalid OTP');
      return;
    }

    setStep('success');
    toast.success('Email verified successfully!');
  };

  const handleResendOTP = async () => {
    if (isOnCooldown) return;
    
    setError(null);
    const { success, error: otpError } = await sendOTP(email, 'email_verification');

    if (!success) {
      setError(otpError || 'Failed to resend OTP');
      return;
    }

    toast.success('OTP resent to your email');
    setOtp('');
    startCooldown();
  };

  const isLoading = loading || otpLoading;

  const getStepContent = () => {
    switch (step) {
      case 'register':
        return { title: 'Create your account', subtitle: 'Start building your portfolio today' };
      case 'verify':
        return { title: 'Verify your email', subtitle: `Enter the code sent to ${email}` };
      case 'success':
        return { title: 'Email Verified!', subtitle: 'Your account is ready to use' };
    }
  };

  const { title, subtitle } = getStepContent();

  return (
    <>
      <Helmet>
        <title>Create Account | {BRAND.name}</title>
        <meta name="description" content="Create your free Make Portfolio account. Build a stunning professional portfolio in minutes to showcase your projects, skills, and experience." />
        <link rel="canonical" href="https://makeportfolios.com/register" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta property="og:title" content={`Create Account | ${BRAND.name}`} />
        <meta property="og:description" content="Create your free portfolio account and start building today." />
        <meta property="og:url" content="https://makeportfolios.com/register" />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center py-12 relative">
        <AuthBackground />
      
      <div className="w-full max-w-md mx-auto px-4 relative z-10">
        {/* Logo and Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link to="/" className="inline-flex items-center mb-6">
            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 400 }}>
              <Logo size="lg" />
            </motion.div>
          </Link>
          <motion.h1 
            key={title}
            className="text-3xl font-display font-bold mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {title}
          </motion.h1>
          <motion.p 
            key={subtitle}
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {subtitle}
          </motion.p>
        </motion.div>

        <GlassCard>
          {step === 'register' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div 
                  className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <PremiumAuthInput
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                error={fieldErrors.fullName}
                icon={<User className="h-4 w-4" />}
              />

              <PremiumAuthInput
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                error={fieldErrors.email}
                icon={<Mail className="h-4 w-4" />}
              />

              <PremiumAuthInput
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                error={fieldErrors.password}
                icon={<KeyRound className="h-4 w-4" />}
              />

              <PremiumAuthInput
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                error={fieldErrors.confirmPassword}
                icon={<KeyRound className="h-4 w-4" />}
              />

              <Button
                type="submit"
                className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-medium text-base shadow-lg shadow-accent/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {error && (
                <motion.div 
                  className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <OTPInput value={otp} onChange={setOtp} disabled={isLoading} />

              <Button
                type="submit"
                className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-medium text-base shadow-lg shadow-accent/20"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading || isOnCooldown}
                  className={isOnCooldown ? 'text-muted-foreground cursor-not-allowed' : 'text-accent hover:underline'}
                >
                  {isOnCooldown ? `Resend in ${cooldown}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <motion.div 
              className="text-center space-y-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex justify-center">
                <motion.div 
                  className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                >
                  <CheckCircle className="h-10 w-10 text-accent" />
                </motion.div>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-medium text-base shadow-lg shadow-accent/20"
              >
                Continue to Login
              </Button>
            </motion.div>
          )}

          {step === 'register' && (
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-accent hover:underline font-medium">
                Sign in
              </Link>
            </div>
          )}
        </GlassCard>

        {step === 'register' && (
          <motion.p 
            className="mt-6 text-center text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            By creating an account, you agree to our{' '}
            <a href="#" className="underline hover:text-foreground transition-colors">Terms of Service</a> and{' '}
            <a href="#" className="underline hover:text-foreground transition-colors">Privacy Policy</a>
          </motion.p>
        )}
      </div>
    </div>
    </>
  );
}
