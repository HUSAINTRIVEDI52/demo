import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import type { PaymentRecord } from '@/hooks/useAdminPayments';
import { IndianRupee, Calendar, CreditCard, Tag, Building2, User } from 'lucide-react';

interface PaymentDetailDialogProps {
  payment: PaymentRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDetailDialog({ payment, open, onOpenChange }: PaymentDetailDialogProps) {
  if (!payment) return null;

  const formatAmount = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;

  const statusColors: Record<string, string> = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge className={statusColors[payment.status] || ''}>
              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
            </Badge>
          </div>

          <Separator />

          {/* Amount Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <IndianRupee className="h-3.5 w-3.5" />
                Amount Charged
              </span>
              <span className="font-semibold text-lg">{formatAmount(payment.amount)}</span>
            </div>
            {payment.coupon_discount && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Coupon Discount
                </span>
                <span className="text-green-600">-{formatAmount(payment.coupon_discount)}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* User & Workspace */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                User Email
              </span>
              <span className="font-mono text-xs">{payment.user_email || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Workspace ID
              </span>
              <span className="font-mono text-xs truncate max-w-[180px]">{payment.workspace_id}</span>
            </div>
          </div>

          <Separator />

          {/* Razorpay IDs */}
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground block mb-1">Razorpay Order ID</span>
              <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                {payment.razorpay_order_id}
              </code>
            </div>
            {payment.razorpay_payment_id && (
              <div className="text-sm">
                <span className="text-muted-foreground block mb-1">Razorpay Payment ID</span>
                <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                  {payment.razorpay_payment_id}
                </code>
              </div>
            )}
          </div>

          {/* Coupon Details */}
          {payment.coupon_code && (
            <>
              <Separator />
              <div className="text-sm">
                <span className="text-muted-foreground block mb-1 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Coupon Applied
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono">
                    {payment.coupon_code}
                  </Badge>
                  {payment.coupon_discount && (
                    <span className="text-green-600 text-sm">
                      -{formatAmount(payment.coupon_discount)} off
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Timestamps */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Created
              </span>
              <span>{format(new Date(payment.created_at), 'PPpp')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Updated</span>
              <span>{format(new Date(payment.updated_at), 'PPpp')}</span>
            </div>
          </div>

          {/* Payment ID */}
          <div className="pt-2 border-t">
            <span className="text-xs text-muted-foreground">Payment ID: {payment.id}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
