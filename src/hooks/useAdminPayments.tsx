import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface PaymentRecord {
  id: string;
  user_id: string;
  workspace_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_email: string | null;
  coupon_code: string | null;
  coupon_discount: number | null;
}

export interface RevenueStats {
  totalRevenue: number;
  monthRevenue: number;
  todayRevenue: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
}

interface UseAdminPaymentsParams {
  page: number;
  pageSize: number;
  statusFilter: 'all' | 'success' | 'failed' | 'pending';
  searchQuery: string;
  dateFrom: string | null;
  dateTo: string | null;
}

export function useAdminPayments({
  page,
  pageSize,
  statusFilter,
  searchQuery,
  dateFrom,
  dateTo,
}: UseAdminPaymentsParams) {
  const fetchPayments = useCallback(async () => {
    let query = supabase
      .from('payments')
      .select(`
        id,
        user_id,
        workspace_id,
        razorpay_order_id,
        razorpay_payment_id,
        amount,
        currency,
        status,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      // Add one day to include the entire end date
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString().split('T')[0]);
    }

    const { data: payments, error } = await query;

    if (error) throw error;

    // Fetch user emails for each payment
    const userIds = [...new Set(payments?.map(p => p.user_id) || [])];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds);

    const emailMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

    // Fetch coupon usages for these payments
    const paymentIds = payments?.map(p => p.id) || [];
    const { data: couponUsages } = await supabase
      .from('coupon_usages')
      .select(`
        payment_id,
        discount_applied,
        coupon_id,
        coupons:coupon_id (code)
      `)
      .in('payment_id', paymentIds);

    const couponMap = new Map(
      couponUsages?.map(cu => [
        cu.payment_id,
        { code: (cu.coupons as { code: string } | null)?.code || null, discount: cu.discount_applied }
      ]) || []
    );

    const enrichedPayments: PaymentRecord[] = (payments || []).map(p => ({
      ...p,
      user_email: emailMap.get(p.user_id) || null,
      coupon_code: couponMap.get(p.id)?.code || null,
      coupon_discount: couponMap.get(p.id)?.discount || null,
    }));

    // Apply search filter client-side (for email and payment ID)
    let filtered = enrichedPayments;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = enrichedPayments.filter(
        p =>
          p.user_email?.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.razorpay_order_id.toLowerCase().includes(q) ||
          p.razorpay_payment_id?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [page, pageSize, statusFilter, searchQuery, dateFrom, dateTo]);

  return useQuery({
    queryKey: ['admin-payments', page, pageSize, statusFilter, searchQuery, dateFrom, dateTo],
    queryFn: fetchPayments,
  });
}

export function usePaymentCount(statusFilter: 'all' | 'success' | 'failed' | 'pending', dateFrom: string | null, dateTo: string | null) {
  return useQuery({
    queryKey: ['admin-payments-count', statusFilter, dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from('payments')
        .select('id', { count: 'exact', head: true });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }

      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt('created_at', endDate.toISOString().split('T')[0]);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  });
}

export function useRevenueStats() {
  return useQuery({
    queryKey: ['admin-revenue-stats'],
    queryFn: async (): Promise<RevenueStats> => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Total revenue (all successful payments)
      const { data: allSuccess } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'success');

      // This month's revenue
      const { data: monthSuccess } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'success')
        .gte('created_at', monthStart);

      // Today's revenue
      const { data: todaySuccess } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'success')
        .gte('created_at', todayStart);

      // Counts
      const { count: successCount } = await supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'success');

      const { count: failedCount } = await supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'failed');

      const { count: pendingCount } = await supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      return {
        totalRevenue: allSuccess?.reduce((sum, p) => sum + p.amount, 0) || 0,
        monthRevenue: monthSuccess?.reduce((sum, p) => sum + p.amount, 0) || 0,
        todayRevenue: todaySuccess?.reduce((sum, p) => sum + p.amount, 0) || 0,
        successCount: successCount || 0,
        failedCount: failedCount || 0,
        pendingCount: pendingCount || 0,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}
