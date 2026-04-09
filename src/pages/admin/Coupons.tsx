import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Plus, Edit, Ban, CheckCircle, Trash2, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionLoader } from '@/components/brand/LogoSpinner';
import { format } from 'date-fns';
import { CouponFormDialog } from '@/components/admin/CouponFormDialog';
import { CouponUsageDialog } from '@/components/admin/CouponUsageDialog';
import { ConfirmActionDialog } from '@/components/admin/ConfirmActionDialog';
import { useAdminActions } from '@/hooks/useAdminActions';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  max_uses: number | null;
  per_user_limit: number;
  used_count: number;
  expires_at: string | null;
  status: 'active' | 'disabled' | 'expired';
  created_at: string;
  deleted_at: string | null;
}

const PAGE_SIZE = 20;

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [usageDialogCoupon, setUsageDialogCoupon] = useState<Coupon | null>(null);
  const [actionCoupon, setActionCoupon] = useState<Coupon | null>(null);
  const [actionType, setActionType] = useState<'disable' | 'enable' | 'delete' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { logAction } = useAdminActions();

  useEffect(() => {
    fetchCoupons();
  }, [page, searchQuery]);

  const fetchCoupons = async () => {
    setLoading(true);

    let countQuery = supabase
      .from('coupons')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    const { count } = await countQuery;
    setTotalCount(count || 0);

    let query = supabase
      .from('coupons')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (searchQuery.trim()) {
      query = query.ilike('code', `%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (!error) {
      setCoupons((data as Coupon[]) || []);
    }
    setLoading(false);
  };

  const handleAction = (coupon: Coupon, action: 'disable' | 'enable' | 'delete') => {
    setActionCoupon(coupon);
    setActionType(action);
  };

  const confirmAction = async () => {
    if (!actionCoupon || !actionType) return;
    setActionLoading(true);

    let success = false;

    if (actionType === 'disable') {
      const { error } = await supabase
        .from('coupons')
        .update({ status: 'disabled' })
        .eq('id', actionCoupon.id);

      if (!error) {
        await logAction({
          actionType: 'coupon_disabled',
          targetType: 'workspace',
          targetId: actionCoupon.id,
          details: { code: actionCoupon.code },
        });
        success = true;
        toast.success('Coupon disabled');
      }
    } else if (actionType === 'enable') {
      const { error } = await supabase
        .from('coupons')
        .update({ status: 'active' })
        .eq('id', actionCoupon.id);

      if (!error) {
        await logAction({
          actionType: 'coupon_enabled',
          targetType: 'workspace',
          targetId: actionCoupon.id,
          details: { code: actionCoupon.code },
        });
        success = true;
        toast.success('Coupon enabled');
      }
    } else if (actionType === 'delete') {
      const { error } = await supabase
        .from('coupons')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', actionCoupon.id);

      if (!error) {
        await logAction({
          actionType: 'coupon_deleted',
          targetType: 'workspace',
          targetId: actionCoupon.id,
          details: { code: actionCoupon.code },
        });
        success = true;
        toast.success('Coupon deleted');
      }
    }

    if (success) {
      fetchCoupons();
    }

    setActionLoading(false);
    setActionCoupon(null);
    setActionType(null);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditCoupon(coupon);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditCoupon(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchCoupons();
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const getStatusBadge = (coupon: Coupon) => {
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return <Badge variant="secondary">Expired</Badge>;
    }
    if (coupon.status === 'active') {
      return <Badge variant="default">Active</Badge>;
    }
    return <Badge variant="destructive">Disabled</Badge>;
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`;
    }
    return `₹${coupon.discount_value / 100}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Coupons</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by coupon code..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0);
          }}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <SectionLoader />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Per User</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No coupons found
                    </TableCell>
                  </TableRow>
                ) : (
                  coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                      <TableCell>{formatDiscount(coupon)}</TableCell>
                      <TableCell>
                        {coupon.used_count} / {coupon.max_uses || '∞'}
                      </TableCell>
                      <TableCell>{coupon.per_user_limit}</TableCell>
                      <TableCell>
                        {coupon.expires_at
                          ? format(new Date(coupon.expires_at), 'MMM d, yyyy')
                          : 'Never'}
                      </TableCell>
                      <TableCell>{getStatusBadge(coupon)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(coupon)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setUsageDialogCoupon(coupon)}>
                              <History className="mr-2 h-4 w-4" />
                              View Usage
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {coupon.status === 'active' ? (
                              <DropdownMenuItem onClick={() => handleAction(coupon, 'disable')}>
                                <Ban className="mr-2 h-4 w-4" />
                                Disable
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleAction(coupon, 'enable')}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Enable
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleAction(coupon, 'delete')}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Coupon Form Dialog */}
      <CouponFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        coupon={editCoupon}
        onSuccess={handleFormSuccess}
      />

      {/* Coupon Usage Dialog */}
      <CouponUsageDialog
        coupon={usageDialogCoupon}
        open={!!usageDialogCoupon}
        onOpenChange={(open) => !open && setUsageDialogCoupon(null)}
      />

      {/* Confirm Action Dialog */}
      <ConfirmActionDialog
        open={!!actionType}
        onOpenChange={(open) => !open && setActionType(null)}
        title={
          actionType === 'disable' ? 'Disable Coupon' :
          actionType === 'enable' ? 'Enable Coupon' :
          'Delete Coupon'
        }
        description={
          actionType === 'disable'
            ? `Are you sure you want to disable coupon "${actionCoupon?.code}"? Users won't be able to use it.`
            : actionType === 'enable'
            ? `Are you sure you want to enable coupon "${actionCoupon?.code}"?`
            : `Are you sure you want to delete coupon "${actionCoupon?.code}"? This action is soft-delete and can be reversed in the database.`
        }
        actionLabel={actionType === 'delete' ? 'Delete' : actionType === 'disable' ? 'Disable' : 'Enable'}
        variant={actionType === 'delete' || actionType === 'disable' ? 'destructive' : 'default'}
        loading={actionLoading}
        onConfirm={confirmAction}
      />
    </div>
  );
}
