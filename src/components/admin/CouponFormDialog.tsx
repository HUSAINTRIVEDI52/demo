import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminActions } from '@/hooks/useAdminActions';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  max_uses: number | null;
  per_user_limit: number;
  expires_at: string | null;
  status: 'active' | 'disabled' | 'expired';
}

interface CouponFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Coupon | null;
  onSuccess: () => void;
}

export function CouponFormDialog({ open, onOpenChange, coupon, onSuccess }: CouponFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [perUserLimit, setPerUserLimit] = useState('1');
  const [expiresAt, setExpiresAt] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { logAction } = useAdminActions();
  const isEditing = !!coupon;

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code);
      setDiscountType(coupon.discount_type);
      setDiscountValue(
        coupon.discount_type === 'flat'
          ? (coupon.discount_value / 100).toString()
          : coupon.discount_value.toString()
      );
      setMaxUses(coupon.max_uses?.toString() || '');
      setPerUserLimit(coupon.per_user_limit.toString());
      setExpiresAt(coupon.expires_at ? coupon.expires_at.split('T')[0] : '');
    } else {
      resetForm();
    }
  }, [coupon, open]);

  const resetForm = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMaxUses('');
    setPerUserLimit('1');
    setExpiresAt('');
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!code.trim()) {
      newErrors.code = 'Code is required';
    } else if (!/^[A-Z0-9_-]+$/i.test(code)) {
      newErrors.code = 'Code can only contain letters, numbers, hyphens, and underscores';
    }

    const numValue = parseFloat(discountValue);
    if (!discountValue || isNaN(numValue) || numValue <= 0) {
      newErrors.discountValue = 'Valid discount value is required';
    } else if (discountType === 'percentage' && numValue > 100) {
      newErrors.discountValue = 'Percentage cannot exceed 100%';
    }

    if (maxUses && (isNaN(parseInt(maxUses)) || parseInt(maxUses) <= 0)) {
      newErrors.maxUses = 'Must be a positive number';
    }

    if (!perUserLimit || isNaN(parseInt(perUserLimit)) || parseInt(perUserLimit) <= 0) {
      newErrors.perUserLimit = 'Must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    const discountValueCents = discountType === 'flat'
      ? Math.round(parseFloat(discountValue) * 100)
      : parseInt(discountValue);

    const couponData = {
      code: code.toUpperCase(),
      discount_type: discountType,
      discount_value: discountValueCents,
      max_uses: maxUses ? parseInt(maxUses) : null,
      per_user_limit: parseInt(perUserLimit),
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    };

    if (isEditing && coupon) {
      const { error } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', coupon.id);

      if (error) {
        if (error.code === '23505') {
          setErrors({ code: 'This coupon code already exists' });
        } else {
          toast.error('Failed to update coupon');
        }
        setLoading(false);
        return;
      }

      await logAction({
        actionType: 'coupon_updated',
        targetType: 'workspace',
        targetId: coupon.id,
        details: { code: couponData.code },
      });

      toast.success('Coupon updated');
    } else {
      const { data, error } = await supabase
        .from('coupons')
        .insert(couponData)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          setErrors({ code: 'This coupon code already exists' });
        } else {
          toast.error('Failed to create coupon');
        }
        setLoading(false);
        return;
      }

      if (data) {
        await logAction({
          actionType: 'coupon_created',
          targetType: 'workspace',
          targetId: data.id,
          details: { code: couponData.code },
        });
      }

      toast.success('Coupon created');
    }

    setLoading(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Coupon Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SUMMER2024"
              disabled={loading}
              className={errors.code ? 'border-destructive' : ''}
            />
            {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'percentage' | 'flat')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountValue">
                {discountType === 'percentage' ? 'Percentage' : 'Amount (₹)'}
              </Label>
              <Input
                id="discountValue"
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percentage' ? '20' : '100'}
                disabled={loading}
                className={errors.discountValue ? 'border-destructive' : ''}
              />
              {errors.discountValue && <p className="text-sm text-destructive">{errors.discountValue}</p>}
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxUses">Max Uses (Total)</Label>
              <Input
                id="maxUses"
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
                disabled={loading}
                className={errors.maxUses ? 'border-destructive' : ''}
              />
              {errors.maxUses && <p className="text-sm text-destructive">{errors.maxUses}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="perUserLimit">Per User Limit</Label>
              <Input
                id="perUserLimit"
                type="number"
                value={perUserLimit}
                onChange={(e) => setPerUserLimit(e.target.value)}
                disabled={loading}
                className={errors.perUserLimit ? 'border-destructive' : ''}
              />
              {errors.perUserLimit && <p className="text-sm text-destructive">{errors.perUserLimit}</p>}
            </div>
          </div>

          {/* Expiry */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
            <Input
              id="expiresAt"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={loading}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Update Coupon' : 'Create Coupon'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
