import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  used_count: number;
  max_uses: number | null;
}

interface CouponUsage {
  id: string;
  user_id: string;
  workspace_id: string;
  discount_applied: number;
  used_at: string;
  user?: {
    email: string;
    full_name: string | null;
  };
}

interface CouponUsageDialogProps {
  coupon: Coupon | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CouponUsageDialog({ coupon, open, onOpenChange }: CouponUsageDialogProps) {
  const [loading, setLoading] = useState(true);
  const [usages, setUsages] = useState<CouponUsage[]>([]);

  useEffect(() => {
    if (coupon && open) {
      fetchUsages();
    }
  }, [coupon, open]);

  const fetchUsages = async () => {
    if (!coupon) return;
    setLoading(true);

    const { data: usagesData } = await (supabase.from('coupon_usages') as any)
      .select('*')
      .eq('coupon_id', coupon.id)
      .order('used_at', { ascending: false })
      .limit(50);

    if (usagesData && usagesData.length > 0) {
      // Fetch user info
      const userIds = [...new Set(usagesData.map((u: CouponUsage) => u.user_id))] as string[];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      const enrichedUsages = usagesData.map((usage: CouponUsage) => ({
        ...usage,
        user: profiles?.find((p) => p.id === usage.user_id),
      }));

      setUsages(enrichedUsages);
    } else {
      setUsages([]);
    }

    setLoading(false);
  };

  const formatDiscount = (amount: number) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Usage History: <span className="font-mono">{coupon?.code}</span>
          </DialogTitle>
        </DialogHeader>

        {coupon && (
          <div className="flex gap-4 text-sm text-muted-foreground mb-4">
            <span>
              Total uses: <strong>{coupon.used_count}</strong> / {coupon.max_uses || '∞'}
            </span>
            <span>
              Discount:{' '}
              <strong>
                {coupon.discount_type === 'percentage'
                  ? `${coupon.discount_value}%`
                  : `₹${coupon.discount_value / 100}`}
              </strong>
            </span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : usages.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No usage history yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Discount Applied</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usages.map((usage) => (
                <TableRow key={usage.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm">{usage.user?.email || 'Unknown'}</p>
                      {usage.user?.full_name && (
                        <p className="text-xs text-muted-foreground">{usage.user.full_name}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{formatDiscount(usage.discount_applied)}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(usage.used_at), 'MMM d, yyyy HH:mm')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
