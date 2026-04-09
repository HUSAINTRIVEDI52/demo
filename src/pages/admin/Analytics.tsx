import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserPlus,
  Activity,
  Building2,
  Crown,
  Eye,
  IndianRupee,
  TrendingUp,
  Percent,
  Palette,
  Globe,
  Tag,
  Calendar,
  Clock,
  FileText,
} from 'lucide-react';
import { SectionLoader } from '@/components/brand/LogoSpinner';
import { format } from 'date-fns';
import { usePlatformAnalytics } from '@/hooks/usePlatformAnalytics';

export default function AdminAnalytics() {
  const { data, isLoading } = usePlatformAnalytics();

  if (isLoading) {
    return <SectionLoader />;
  }

  if (!data) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Failed to load analytics data.
      </div>
    );
  }

  const formatAmount = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;

  const {
    userMetrics,
    workspaceMetrics,
    revenueMetrics,
    themeUsage,
    topPortfolios,
    trafficSources,
    couponUsage,
    eventInsights,
  } = data;

  const maxSignupCount = Math.max(...eventInsights.dailySignups.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-display font-bold">Platform Analytics</h1>

      {/* === USER METRICS === */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Metrics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{userMetrics.totalUsers}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">{userMetrics.newToday}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">{userMetrics.newThisMonth}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active (7 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold">{userMetrics.activeLastWeek}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* === WORKSPACE METRICS === */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Workspace Metrics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Workspaces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{workspaceMetrics.totalWorkspaces}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Free Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{workspaceMetrics.freeWorkspaces}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Paid Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <span className="text-2xl font-bold">{workspaceMetrics.proWorkspaces}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Published Portfolios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">{workspaceMetrics.publishedPortfolios}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* === REVENUE METRICS === */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <IndianRupee className="h-5 w-5" />
          Revenue Metrics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">{formatAmount(revenueMetrics.totalRevenue)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">{formatAmount(revenueMetrics.revenueThisMonth)}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold">{revenueMetrics.conversionRate.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* === EVENT-BASED INSIGHTS === */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Event-Based Insights
        </h2>
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Daily Signups */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Signups (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-24">
                {eventInsights.dailySignups.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium">{day.count}</span>
                    <div
                      className="w-full bg-primary rounded-t transition-all"
                      style={{
                        height: `${Math.max((day.count / maxSignupCount) * 60, 4)}px`,
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(day.date), 'EEE')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Publish Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Publish Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Publish Rate
                  </span>
                  <span className="font-semibold">{eventInsights.publishRate.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(eventInsights.publishRate, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Avg Time to Publish
                </span>
                <span className="font-semibold">
                  {eventInsights.avgTimeToPublish !== null
                    ? `${eventInsights.avgTimeToPublish.toFixed(1)} days`
                    : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* === USAGE INSIGHTS (LISTS) === */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Usage Insights</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Most Used Themes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Most Used Themes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {themeUsage.length === 0 ? (
                <p className="text-sm text-muted-foreground">No themes in use yet.</p>
              ) : (
                themeUsage.slice(0, 5).map((t, i) => (
                  <div key={t.theme} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                      <span className="text-sm font-medium capitalize">{t.theme.replace(/-/g, ' ')}</span>
                    </div>
                    <Badge variant="secondary">{t.count} ({t.percentage}%)</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Most Viewed Portfolios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Most Viewed Portfolios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topPortfolios.length === 0 ? (
                <p className="text-sm text-muted-foreground">No portfolio views yet.</p>
              ) : (
                topPortfolios.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                      <div>
                        <span className="text-sm font-medium">{p.title}</span>
                        <span className="text-xs text-muted-foreground ml-2">/{p.slug}</span>
                      </div>
                    </div>
                    <Badge variant="secondary">{p.views} views</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trafficSources.length === 0 ? (
                <p className="text-sm text-muted-foreground">No traffic data yet.</p>
              ) : (
                trafficSources.slice(0, 5).map((s, i) => (
                  <div key={s.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                      <span className="text-sm font-medium">{s.source}</span>
                    </div>
                    <Badge variant="secondary">{s.count} ({s.percentage}%)</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Coupon Usage Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Coupon Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {couponUsage.length === 0 ? (
                <p className="text-sm text-muted-foreground">No coupons used yet.</p>
              ) : (
                couponUsage.slice(0, 5).map((c, i) => (
                  <div key={c.code} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                      <Badge variant="outline" className="font-mono">{c.code}</Badge>
                    </div>
                    <div className="text-sm text-right">
                      <span className="font-medium">{c.usageCount} uses</span>
                      <span className="text-muted-foreground ml-2">
                        ({formatAmount(c.totalDiscount)} off)
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
