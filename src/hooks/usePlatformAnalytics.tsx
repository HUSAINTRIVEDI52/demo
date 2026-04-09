import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, startOfMonth, differenceInDays } from 'date-fns';

export interface UserMetrics {
  totalUsers: number;
  newToday: number;
  newThisMonth: number;
  activeLastWeek: number;
}

export interface WorkspaceMetrics {
  totalWorkspaces: number;
  freeWorkspaces: number;
  proWorkspaces: number;
  publishedPortfolios: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  revenueThisMonth: number;
  conversionRate: number;
}

export interface ThemeUsage {
  theme: string;
  count: number;
  percentage: number;
}

export interface TopPortfolio {
  id: string;
  title: string;
  slug: string;
  views: number;
}

export interface TrafficSource {
  source: string;
  count: number;
  percentage: number;
}

export interface CouponUsageSummary {
  code: string;
  usageCount: number;
  totalDiscount: number;
}

export interface DailySignup {
  date: string;
  count: number;
}

export interface EventInsights {
  dailySignups: DailySignup[];
  publishRate: number;
  avgTimeToPublish: number | null;
}

export interface PlatformAnalytics {
  userMetrics: UserMetrics;
  workspaceMetrics: WorkspaceMetrics;
  revenueMetrics: RevenueMetrics;
  themeUsage: ThemeUsage[];
  topPortfolios: TopPortfolio[];
  trafficSources: TrafficSource[];
  couponUsage: CouponUsageSummary[];
  eventInsights: EventInsights;
}

export function usePlatformAnalytics() {
  return useQuery({
    queryKey: ['platform-analytics'],
    queryFn: async (): Promise<PlatformAnalytics> => {
      const now = new Date();
      const todayStart = startOfDay(now).toISOString();
      const monthStart = startOfMonth(now).toISOString();
      const weekAgo = subDays(now, 7).toISOString();

      // === USER METRICS ===
      const [
        { count: totalUsers },
        { count: newToday },
        { count: newThisMonth },
        { data: activeUsers },
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
        supabase.from('profiles').select('id').gte('last_login_at', weekAgo),
      ]);

      // === WORKSPACE METRICS ===
      const [
        { count: totalWorkspaces },
        { count: freeWorkspaces },
        { count: proWorkspaces },
        { count: publishedPortfolios },
      ] = await Promise.all([
        supabase.from('workspaces').select('id', { count: 'exact', head: true }),
        supabase.from('workspaces').select('id', { count: 'exact', head: true }).eq('plan', 'free'),
        supabase.from('workspaces').select('id', { count: 'exact', head: true }).in('plan', ['starter', 'pro']),
        supabase.from('portfolios').select('id', { count: 'exact', head: true }).eq('published', true),
      ]);

      // === REVENUE METRICS ===
      const [{ data: allPayments }, { data: monthPayments }] = await Promise.all([
        supabase.from('payments').select('amount').eq('status', 'success'),
        supabase.from('payments').select('amount').eq('status', 'success').gte('created_at', monthStart),
      ]);

      const totalRevenue = allPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const revenueThisMonth = monthPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const conversionRate = (totalWorkspaces || 0) > 0 
        ? ((proWorkspaces || 0) / (totalWorkspaces || 1)) * 100 
        : 0;

      // === THEME USAGE ===
      const { data: portfoliosThemes } = await supabase.from('portfolios').select('theme');
      const themeCounts: Record<string, number> = {};
      portfoliosThemes?.forEach((p) => {
        themeCounts[p.theme] = (themeCounts[p.theme] || 0) + 1;
      });
      const totalThemeCount = portfoliosThemes?.length || 1;
      const themeUsage: ThemeUsage[] = Object.entries(themeCounts)
        .map(([theme, count]) => ({
          theme,
          count,
          percentage: Math.round((count / totalThemeCount) * 100),
        }))
        .sort((a, b) => b.count - a.count);

      // === TOP PORTFOLIOS (by views) ===
      const { data: viewEvents } = await supabase
        .from('events')
        .select('workspace_id')
        .eq('event_type', 'portfolio_view');

      const workspaceViewCounts: Record<string, number> = {};
      viewEvents?.forEach((e) => {
        if (e.workspace_id) {
          workspaceViewCounts[e.workspace_id] = (workspaceViewCounts[e.workspace_id] || 0) + 1;
        }
      });

      const topWorkspaceIds = Object.entries(workspaceViewCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      let topPortfolios: TopPortfolio[] = [];
      if (topWorkspaceIds.length > 0) {
        const { data: portfolioData } = await supabase
          .from('portfolios')
          .select('id, title, slug, workspace_id')
          .in('workspace_id', topWorkspaceIds);

        topPortfolios = (portfolioData || [])
          .map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            views: workspaceViewCounts[p.workspace_id] || 0,
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 5);
      }

      // === TRAFFIC SOURCES ===
      const { data: viewEventsWithMeta } = await supabase
        .from('events')
        .select('metadata')
        .eq('event_type', 'portfolio_view');

      const sourceCounts: Record<string, number> = {};
      viewEventsWithMeta?.forEach((e) => {
        const meta = e.metadata as { src?: string } | null;
        const source = meta?.src || 'Direct';
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });

      const totalViews = viewEventsWithMeta?.length || 1;
      const trafficSources: TrafficSource[] = Object.entries(sourceCounts)
        .map(([source, count]) => ({
          source: source.charAt(0).toUpperCase() + source.slice(1),
          count,
          percentage: Math.round((count / totalViews) * 100),
        }))
        .sort((a, b) => b.count - a.count);

      // === COUPON USAGE ===
      const { data: couponUsages } = await supabase
        .from('coupon_usages')
        .select(`
          discount_applied,
          coupons:coupon_id (code)
        `);

      const couponStats: Record<string, { count: number; discount: number }> = {};
      couponUsages?.forEach((cu) => {
        const code = (cu.coupons as { code: string } | null)?.code || 'Unknown';
        if (!couponStats[code]) {
          couponStats[code] = { count: 0, discount: 0 };
        }
        couponStats[code].count++;
        couponStats[code].discount += cu.discount_applied;
      });

      const couponUsage: CouponUsageSummary[] = Object.entries(couponStats)
        .map(([code, stats]) => ({
          code,
          usageCount: stats.count,
          totalDiscount: stats.discount,
        }))
        .sort((a, b) => b.usageCount - a.usageCount);

      // === EVENT-BASED INSIGHTS ===
      // Daily signups (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(now, 6 - i);
        return format(startOfDay(date), 'yyyy-MM-dd');
      });

      const { data: signupEvents } = await supabase
        .from('events')
        .select('created_at')
        .eq('event_type', 'user_signup')
        .gte('created_at', subDays(now, 7).toISOString());

      const signupsByDay: Record<string, number> = {};
      last7Days.forEach((d) => (signupsByDay[d] = 0));
      signupEvents?.forEach((e) => {
        const day = format(new Date(e.created_at), 'yyyy-MM-dd');
        if (signupsByDay[day] !== undefined) {
          signupsByDay[day]++;
        }
      });

      const dailySignups: DailySignup[] = last7Days.map((date) => ({
        date,
        count: signupsByDay[date] || 0,
      }));

      // Publish rate
      const { count: totalPortfoliosCount } = await supabase
        .from('portfolios')
        .select('id', { count: 'exact', head: true });
      const publishRate = (totalPortfoliosCount || 0) > 0
        ? ((publishedPortfolios || 0) / (totalPortfoliosCount || 1)) * 100
        : 0;

      // Average time to first publish
      const { data: publishEvents } = await supabase
        .from('events')
        .select('user_id, created_at')
        .eq('event_type', 'portfolio_publish')
        .order('created_at', { ascending: true });

      const { data: signupData } = await supabase
        .from('events')
        .select('user_id, created_at')
        .eq('event_type', 'user_signup');

      const signupMap = new Map(
        signupData?.map((s) => [s.user_id, new Date(s.created_at)]) || []
      );

      const firstPublishMap = new Map<string, Date>();
      publishEvents?.forEach((p) => {
        if (p.user_id && !firstPublishMap.has(p.user_id)) {
          firstPublishMap.set(p.user_id, new Date(p.created_at));
        }
      });

      const timeToPublishDays: number[] = [];
      firstPublishMap.forEach((publishDate, userId) => {
        const signupDate = signupMap.get(userId);
        if (signupDate) {
          const days = differenceInDays(publishDate, signupDate);
          if (days >= 0) {
            timeToPublishDays.push(days);
          }
        }
      });

      const avgTimeToPublish = timeToPublishDays.length > 0
        ? timeToPublishDays.reduce((sum, d) => sum + d, 0) / timeToPublishDays.length
        : null;

      return {
        userMetrics: {
          totalUsers: totalUsers || 0,
          newToday: newToday || 0,
          newThisMonth: newThisMonth || 0,
          activeLastWeek: activeUsers?.length || 0,
        },
        workspaceMetrics: {
          totalWorkspaces: totalWorkspaces || 0,
          freeWorkspaces: freeWorkspaces || 0,
          proWorkspaces: proWorkspaces || 0,
          publishedPortfolios: publishedPortfolios || 0,
        },
        revenueMetrics: {
          totalRevenue,
          revenueThisMonth,
          conversionRate,
        },
        themeUsage,
        topPortfolios,
        trafficSources,
        couponUsage,
        eventInsights: {
          dailySignups,
          publishRate,
          avgTimeToPublish,
        },
      };
    },
    staleTime: 60 * 1000, // 1 minute
  });
}
