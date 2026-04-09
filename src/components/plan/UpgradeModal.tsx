import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Infinity, Palette, Search, Image, Loader2, Tag, X, CheckCircle, AlertCircle, Rocket, Zap, Gift, Calendar } from 'lucide-react';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useCouponValidation } from '@/hooks/useCouponValidation';
import { useWorkspace } from '@/hooks/useWorkspace';
import { usePlanLimits, PLAN_DEFINITIONS } from '@/hooks/usePlanLimits';
import { ComparisonSlider } from './ComparisonSlider';
import { cn } from '@/lib/utils';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: 'projects' | 'skills' | 'experiences' | 'themes' | 'seo' | 'watermark' | 'general';
  defaultPlan?: 'starter' | 'pro';
}

const triggerMessages: Record<string, { title: string; subtitle: string }> = {
  projects: {
    title: "You've hit your project limit",
    subtitle: "Start your 7-day free trial to unlock more projects."
  },
  skills: {
    title: "You've hit your skill limit",
    subtitle: "Start your 7-day free trial to add more skills."
  },
  experiences: {
    title: "You've hit your experience limit",
    subtitle: "Start your 7-day free trial to add more experiences."
  },
  themes: {
    title: "This theme requires an upgrade",
    subtitle: "Start your 7-day free trial to unlock premium themes."
  },
  seo: {
    title: "Advanced SEO requires an upgrade",
    subtitle: "Start your 7-day free trial for full SEO controls."
  },
  watermark: {
    title: "Remove the watermark",
    subtitle: "Start your 7-day free trial to remove branding."
  },
  general: {
    title: "Start Your 7-Day Free Trial",
    subtitle: "Try all premium features free for 7 days, then auto-renew yearly."
  },
};

const starterFeatures = [
  { icon: Gift, label: '7-day free trial included' },
  { icon: Zap, label: 'Up to 10 projects' },
  { icon: Palette, label: '4 themes available' },
  { icon: Search, label: 'SEO keywords enabled' },
  { icon: Check, label: 'No watermark on portfolio' },
];

const proFeatures = [
  { icon: Gift, label: '7-day free trial included' },
  { icon: Infinity, label: 'Unlimited projects, skills & experiences' },
  { icon: Palette, label: 'All 8 premium themes unlocked' },
  { icon: Search, label: 'Full SEO controls with keywords' },
  { icon: Image, label: 'Custom OG image for social sharing' },
];

export function UpgradeModal({ open, onOpenChange, trigger = 'general', defaultPlan = 'pro' }: UpgradeModalProps) {
  const { initiatePayment, loadScript, isLoading, isScriptLoaded } = useRazorpay();
  const { validateCoupon, clearCoupon, isValidating, couponResult } = useCouponValidation();
  const { workspace } = useWorkspace();
  const { plan: currentPlan } = usePlanLimits();
  const { title, subtitle } = triggerMessages[trigger] || triggerMessages.general;

  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro'>(defaultPlan);
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Lazy load Razorpay script when modal opens
  useEffect(() => {
    if (open && !isScriptLoaded) {
      loadScript();
    }
  }, [open, isScriptLoaded, loadScript]);

  const handleApplyCoupon = async () => {
    if (!workspace?.id) return;
    await validateCoupon(couponCode, workspace.id);
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    clearCoupon();
  };

  const handleUpgrade = async () => {
    // Pass coupon info to payment if a valid coupon is applied
    if (couponResult?.valid && couponResult.coupon_id) {
      await initiatePayment({
        targetPlan: selectedPlan,
        couponInfo: {
          coupon_code: couponCode,
          coupon_id: couponResult.coupon_id,
          discount_amount: couponResult.discount_amount!,
        },
      });
    } else {
      await initiatePayment({ targetPlan: selectedPlan });
    }
    onOpenChange(false);
  };

  const formatPrice = (paise: number) => {
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
  };

  const originalPrice = PLAN_DEFINITIONS[selectedPlan].price;
  const finalAmount = couponResult?.valid ? couponResult.final_amount! : originalPrice;
  const discountAmount = couponResult?.valid ? couponResult.discount_amount! : 0;

  const rawFeatures = selectedPlan === 'starter' ? starterFeatures : proFeatures;
  const features = currentPlan === 'free'
    ? rawFeatures
    : rawFeatures.filter(f => !f.label.includes('free trial'));
  const gradientClass = selectedPlan === 'starter'
    ? 'from-blue-500 to-cyan-500'
    : 'from-amber-500 to-orange-500';

  // Show starter option only if usr is on free plan
  const showStarterOption = currentPlan === 'free';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader className="text-center pb-2">
          <div className={cn(
            "mx-auto mb-4 h-14 w-14 rounded-full bg-gradient-to-br flex items-center justify-center",
            gradientClass
          )}>
            {selectedPlan === 'starter' ? (
              <Rocket className="h-7 w-7 text-white" />
            ) : (
              <Crown className="h-7 w-7 text-white" />
            )}
          </div>
          <DialogTitle className="text-xl font-display">{title}</DialogTitle>
          <DialogDescription className="text-base">
            {subtitle}
          </DialogDescription>
        </DialogHeader>

        {/* Trial Banner */}
        {currentPlan === 'free' && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
            <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Gift className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-sm">7 Days Free Trial</p>
              <p className="text-xs text-muted-foreground">Try all features free, then auto-renew yearly</p>
            </div>
          </div>
        )}

        {/* Comparison Slider - Show for watermark trigger or general */}
        {(trigger === 'watermark' || trigger === 'general') && currentPlan === 'free' && (
          <ComparisonSlider className="pt-2" />
        )}

        {/* Plan Selection Tabs (only show if on free plan) */}
        {showStarterOption && (
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setSelectedPlan('starter')}
              className={cn(
                "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all",
                selectedPlan === 'starter'
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Rocket className="h-4 w-4 inline mr-1.5" />
              Starter ₹49/yr
            </button>
            <button
              onClick={() => setSelectedPlan('pro')}
              className={cn(
                "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all",
                selectedPlan === 'pro'
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Crown className="h-4 w-4 inline mr-1.5" />
              Pro ₹99/yr
            </button>
          </div>
        )}

        <div className="space-y-3 py-4">
          {/* Price Display */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">{PLAN_DEFINITIONS[selectedPlan].displayName} Plan</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Billed yearly after trial</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {discountAmount > 0 && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
              <Badge className={cn("text-white border-0 bg-gradient-to-r", gradientClass)}>
                {formatPrice(finalAmount)}/year
              </Badge>
            </div>
          </div>

          {/* Discount Applied Banner */}
          {couponResult?.valid && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {couponResult.discount_type === 'percentage'
                    ? `${couponResult.discount_value}% off applied`
                    : `${formatPrice(couponResult.discount_value!)} off applied`}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveCoupon}
                className="h-7 px-2 text-green-700 hover:text-green-800 hover:bg-green-100"
                aria-label="Remove coupon"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Features */}
          <div className="space-y-2">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center gap-3 text-sm">
                <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-3.5 w-3.5 text-accent" />
                </div>
                <span>{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Coupon Section */}
          <div className="pt-2">
            {!showCouponInput && !couponResult?.valid ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCouponInput(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Tag className="h-4 w-4 mr-2" />
                Have a coupon code?
              </Button>
            ) : !couponResult?.valid ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="font-mono"
                    disabled={isValidating}
                    aria-label="Coupon code"
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={isValidating || !couponCode.trim()}
                  >
                    {isValidating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>
                {couponResult && !couponResult.valid && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {couponResult.error_message}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Trial Info */}
        <p className="text-xs text-center text-muted-foreground pt-2">
          {currentPlan === 'free' ? (
            <>
              Your card will be charged {formatPrice(finalAmount)} after the 7-day trial.{' '}
              Cancel anytime before trial ends to avoid charges.{' '}
            </>
          ) : (
            <>
              Your card will be charged {formatPrice(finalAmount)} for the yearly subscription.{' '}
            </>
          )}
          <a
            href="/refund-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            View policy
          </a>
        </p>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className={cn("w-full text-white bg-gradient-to-r hover:opacity-90", gradientClass)}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : !isScriptLoaded ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                {currentPlan === 'free' ? (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    Start Free Trial
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Make Payment
                  </>
                )}
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full text-muted-foreground"
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
