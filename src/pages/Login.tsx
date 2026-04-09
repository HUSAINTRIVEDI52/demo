import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle, Mail, KeyRound } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { z } from 'zod';
import { toast } from 'sonner';
import { OTPInput } from '@/components/auth/OTPInput';
import { useOTPAuth } from '@/hooks/useOTPAuth';
import { useResendCooldown } from '@/hooks/useResendCooldown';
import { supabase } from '@/integrations/supabase/client';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { GlassCard } from '@/components/auth/GlassCard';
import { PremiumAuthInput } from '@/components/auth/PremiumAuthInput';
import { motion } from 'framer-motion';
import { BRAND } from '@/config/branding';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, signIn } = useAuth();
  const { sendOTP, verifyOTP, isLoading: otpLoading } = useOTPAuth();
  const { cooldown, isOnCooldown, startCooldown, resetCooldown } = useResendCooldown();
  
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const from = (location.state as any)?.from?.pathname || '/app/dashboard';

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

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const emailResult = emailSchema.safeParse(email);
    const passResult = passwordSchema.safeParse(password);
    
    const errors: Record<string, string> = {};
    if (!emailResult.success) {
      errors.email = emailResult.error.errors[0].message;
    }
    if (!passResult.success) {
      errors.password = passResult.error.errors[0].message;
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      if (signInError.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(signInError.message);
      }
      setLoading(false);
      return;
    }

    navigate(from, { replace: true });
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setFieldErrors({ email: result.error.errors[0].message });
      return;
    }

    const { success, error: otpError } = await sendOTP(email, 'login');

    if (!success) {
      setError(otpError || 'Failed to send OTP');
      return;
    }

    toast.success('OTP sent to your email');
    setOtpSent(true);
    startCooldown();
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    const { valid, error: verifyError, actionUrl, isNewUser } = await verifyOTP(email, otp, 'login');

    if (!valid) {
      setError(verifyError || 'Invalid OTP');
      return;
    }

    if (actionUrl) {
      try {
        const url = new URL(actionUrl);
        const token = url.searchParams.get('token') || url.hash?.split('access_token=')[1]?.split('&')[0];
        
        if (token) {
          const { error: verifyLinkError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'magiclink',
          });
          
          if (verifyLinkError) {
            console.log('Magic link verify error (non-fatal):', verifyLinkError);
          }
        }
        
        toast.success(isNewUser ? 'Account created! Let\'s set up your profile.' : 'Logged in successfully!');
        navigate(isNewUser ? '/app/welcome' : from, { replace: true });
      } catch (err) {
        console.error('Login error:', err);
        toast.success('Logged in successfully!');
        navigate(isNewUser ? '/app/welcome' : from, { replace: true });
      }
    } else {
      toast.success(isNewUser ? 'Account created!' : 'OTP verified! Redirecting...');
      window.location.href = isNewUser ? '/app/welcome' : from;
    }
  };

  const handleResendOTP = async () => {
    if (isOnCooldown) return;
    
    setError(null);
    const { success, error: otpError } = await sendOTP(email, 'login');

    if (!success) {
      setError(otpError || 'Failed to resend OTP');
      return;
    }

    toast.success('OTP resent to your email');
    setOtp('');
    startCooldown();
  };

  const isLoading = loading || otpLoading;

  return (
    <>
      <Helmet>
        <title>Sign In | {BRAND.name}</title>
        <meta name="description" content="Sign in to your Make Portfolio account to manage your professional portfolio, projects, and career content." />
        <link rel="canonical" href="https://makeportfolios.com/login" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta property="og:title" content={`Sign In | ${BRAND.name}`} />
        <meta property="og:description" content="Sign in to manage your professional portfolio." />
        <meta property="og:url" content="https://makeportfolios.com/login" />
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
          <h1 className="text-3xl font-display font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </motion.div>

        <GlassCard>
          <Tabs 
            value={loginMethod} 
            onValueChange={(v) => { 
              setLoginMethod(v as 'password' | 'otp'); 
              setOtpSent(false); 
              setOtp(''); 
              setError(null); 
              resetCooldown(); 
            }}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
              <TabsTrigger value="password" className="flex items-center gap-2 data-[state=active]:bg-background">
                <KeyRound className="h-4 w-4" />
                Password
              </TabsTrigger>
              <TabsTrigger value="otp" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Mail className="h-4 w-4" />
                OTP
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <form onSubmit={handlePasswordLogin} className="space-y-5">
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
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  error={fieldErrors.email}
                  icon={<Mail className="h-4 w-4" />}
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-accent hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <PremiumAuthInput
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    error={fieldErrors.password}
                    icon={<KeyRound className="h-4 w-4" />}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-medium text-base shadow-lg shadow-accent/20" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="otp">
              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-5">
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
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    error={fieldErrors.email}
                    icon={<Mail className="h-4 w-4" />}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-medium text-base shadow-lg shadow-accent/20" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      'Send OTP'
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOTPLogin} className="space-y-6">
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

                  <div className="text-center text-sm text-muted-foreground mb-4">
                    Enter the 6-digit code sent to<br />
                    <span className="font-medium text-foreground">{email}</span>
                  </div>

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
                      'Verify & Sign In'
                    )}
                  </Button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); resetCooldown(); }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Change email
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
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/register" className="text-accent hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
    </>
  );
}
