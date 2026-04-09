import { useState, useEffect, useCallback, useRef } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useResumeExport } from '@/hooks/useResumeExport';
import { ResumeTemplateDialog } from '@/components/resume/ResumeTemplateDialog';
import { useAnalyticsInsights } from '@/hooks/useAnalyticsInsights';
import { useOffline } from '@/contexts/OfflineContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardSkeleton, PremiumSkeleton } from '@/components/ui/premium-skeleton';
import { StatCard } from '@/components/ui/stat-card';
import { Link } from 'react-router-dom';
import { Loader2, Eye, EyeOff, ExternalLink, FolderKanban, Briefcase, Award, Zap, Calendar, BarChart3, Mail, FileDown, TrendingUp, Clock, Target, Star, Share2, Copy, Check } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { PlanBadge } from '@/components/plan/PlanBadge';
import { UsageCounter } from '@/components/plan/UsageCounter';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface DashboardStats {
  projectCount: number;
  experienceCount: number;
  skillCount: number;
  certificationCount: number;
  viewCount: number;
  messageCount: number;
}

interface OnboardingStatus {
  heroComplete: boolean;
  aboutComplete: boolean;
  skillComplete: boolean;
  projectComplete: boolean;
  publishComplete: boolean;
}

export default function Dashboard() {
  const { portfolio, workspace, loading, completeOnboarding } = useWorkspace();
  const { plan, getProjectUsage, getSkillUsage, getExperienceUsage, loading: planLoading } = usePlanLimits();
  const { exportResume, exporting, templateDialogOpen, setTemplateDialogOpen, openTemplateSelector } = useResumeExport();
  const { insights, loading: insightsLoading, fetchInsights } = useAnalyticsInsights();
  const { isOffline } = useOffline();
  const [stats, setStats] = useState<DashboardStats>({
    projectCount: 0,
    experienceCount: 0,
    skillCount: 0,
    certificationCount: 0,
    viewCount: 0,
    messageCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);
  const loadingStartTimeRef = useRef<number>(Date.now());
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>({
    heroComplete: false,
    aboutComplete: false,
    skillComplete: false,
    projectComplete: false,
    publishComplete: false,
  });
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const shareLinks = [
    { source: 'linkedin', label: 'LinkedIn' },
    { source: 'twitter', label: 'Twitter' },
    { source: 'whatsapp', label: 'WhatsApp' },
    { source: 'email', label: 'Email' },
  ];

  const getShareUrl = (source: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/${portfolio?.slug}?src=${source}`;
  };

  const copyLink = async (source: string) => {
    await navigator.clipboard.writeText(getShareUrl(source));
    setCopiedLink(source);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Fetch additional stats not covered by usePlanLimits (certifications, views, messages)
  useEffect(() => {
    if (portfolio?.id && workspace?.id) {
      loadingStartTimeRef.current = Date.now();
      fetchAdditionalStats();
      fetchInsights();
    }
  }, [portfolio?.id, workspace?.id, fetchInsights]);

  // Update stats and onboarding from usePlanLimits data when it loads
  useEffect(() => {
    if (!planLoading && portfolio) {
      const projectCount = getProjectUsage().current;
      const skillCount = getSkillUsage().current;
      const experienceCount = getExperienceUsage().current;

      setStats(prev => ({
        ...prev,
        projectCount,
        experienceCount,
        skillCount,
      }));

      // Compute onboarding status
      setOnboardingStatus({
        heroComplete: !!(portfolio.title && portfolio.title !== 'My Portfolio'),
        aboutComplete: !!(portfolio.bio && portfolio.bio.trim().length > 0),
        skillComplete: skillCount >= 1,
        projectComplete: projectCount >= 1,
        publishComplete: portfolio.published === true,
      });
    }
  }, [planLoading, portfolio, getProjectUsage, getSkillUsage, getExperienceUsage]);

  // Fetch only the data not available in usePlanLimits
  const fetchAdditionalStats = useCallback(async () => {
    if (!portfolio?.id || !workspace?.id) return;
    
    // Don't fetch if offline
    if (isOffline) {
      setStatsLoading(false);
      return;
    }

    setStatsError(false);
    
    try {
      const [certifications, views, messages] = await Promise.all([
        supabase.from('certifications').select('id', { count: 'exact', head: true }).eq('portfolio_id', portfolio.id),
        // Count portfolio views from events table
        supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .eq('event_type', 'portfolio_view'),
        // Count unread contact messages
        supabase
          .from('contact_messages')
          .select('id', { count: 'exact', head: true })
          .eq('portfolio_id', portfolio.id)
          .eq('read', false),
      ]);

      setStats(prev => ({
        ...prev,
        certificationCount: certifications.count || 0,
        viewCount: views.count || 0,
        messageCount: messages.count || 0,
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStatsError(true);
    } finally {
      setStatsLoading(false);
    }
  }, [portfolio?.id, workspace?.id, isOffline]);

  const handleCompleteOnboarding = async () => {
    const { error } = await completeOnboarding();
    if (!error) {
      toast.success('Onboarding completed! Welcome aboard.');
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const showOnboarding = workspace && !workspace.onboarding_completed;

  const checklistItems = [
    {
      id: 'hero',
      label: 'Complete your Hero section',
      completed: onboardingStatus.heroComplete,
      link: '/app/portfolio',
      linkLabel: 'Edit Hero',
    },
    {
      id: 'about',
      label: 'Add About information',
      completed: onboardingStatus.aboutComplete,
      link: '/app/portfolio',
      linkLabel: 'Add Bio',
    },
    {
      id: 'skill',
      label: 'Add at least one Skill',
      completed: onboardingStatus.skillComplete,
      link: '/app/skills',
      linkLabel: 'Add Skill',
    },
    {
      id: 'project',
      label: 'Add at least one Project',
      completed: onboardingStatus.projectComplete,
      link: '/app/projects',
      linkLabel: 'Add Project',
    },
    {
      id: 'publish',
      label: 'Publish your portfolio',
      completed: onboardingStatus.publishComplete,
      link: '/app/settings',
      linkLabel: 'Publish',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your portfolio and track your progress.</p>
        </div>
        <PlanBadge plan={plan} />
      </div>

      {/* Plan Usage Summary */}
      {planLoading ? (
        <Card>
          <CardHeader className="pb-3">
            <PremiumSkeleton variant="title" className="w-28 h-5" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <PremiumSkeleton variant="text" className="w-16 h-3" />
                  <PremiumSkeleton variant="text" className="w-12 h-3" />
                </div>
                <PremiumSkeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Plan Usage</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <UsageCounter {...getProjectUsage()} label="Projects" showProgress />
            <UsageCounter {...getSkillUsage()} label="Skills" showProgress />
            <UsageCounter {...getExperienceUsage()} label="Experiences" showProgress />
          </CardContent>
        </Card>
      )}

      {/* Onboarding Checklist */}
      {showOnboarding && !statsLoading && (
        <OnboardingChecklist
          items={checklistItems}
          onComplete={handleCompleteOnboarding}
        />
      )}

      {/* Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            Portfolio Status
            {portfolio?.published ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                <Eye className="h-4 w-4" /> Published
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <EyeOff className="h-4 w-4" /> Draft
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <Link to="/app/portfolio">Edit Portfolio</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/app/preview" target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Preview Portfolio
              </Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={openTemplateSelector}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 h-4 w-4" />
              )}
              Export Resume (PDF)
            </Button>
            {portfolio?.published && (
              <Button variant="ghost" asChild>
                <a href={`/${portfolio.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Live
                </a>
              </Button>
            )}
          </div>
          
          {portfolio?.updated_at && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Last updated: {format(new Date(portfolio.updated_at), 'MMM d, yyyy \'at\' h:mm a')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Insights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analytics Insights
          </CardTitle>
          <CardDescription>Actionable insights about your portfolio performance</CardDescription>
        </CardHeader>
        <CardContent>
          {insightsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/30 space-y-2 animate-pulse">
                  <div className="flex items-center gap-2">
                    <PremiumSkeleton className="h-4 w-4 rounded" />
                    <PremiumSkeleton variant="text" className="w-20 h-3" />
                  </div>
                  <PremiumSkeleton variant="title" className="w-12 h-7" />
                  <PremiumSkeleton variant="text" className="w-24 h-2" />
                </div>
              ))}
            </div>
          ) : insights.totalViews === 0 && !portfolio?.published ? (
            // Empty state for unpublished portfolio
            <div className="py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="font-medium mb-1">No analytics yet</h4>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
                Publish your portfolio to start tracking views and engagement.
              </p>
              <Button asChild size="sm">
                <Link to="/app/settings">Publish Portfolio</Link>
              </Button>
            </div>
          ) : insights.totalViews === 0 ? (
            // Empty state for published portfolio with no views
            <div className="py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="font-medium mb-1">No views yet</h4>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Share your portfolio link to start getting visitors. Analytics will appear here once you have traffic.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Views Last 7 Days */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">Last 7 Days</span>
                  </div>
                  <p className="text-2xl font-bold">{insights.viewsLast7Days}</p>
                  <p className="text-xs text-muted-foreground">portfolio views</p>
                </div>

                {/* Views Last 30 Days */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">Last 30 Days</span>
                  </div>
                  <p className="text-2xl font-bold">{insights.viewsLast30Days}</p>
                  <p className="text-xs text-muted-foreground">portfolio views</p>
                </div>

                {/* Contact Conversion */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">Conversion Rate</span>
                  </div>
                  <p className="text-2xl font-bold">{insights.conversionRate}%</p>
                  <p className="text-xs text-muted-foreground">
                    {insights.totalMessages} messages / {insights.totalViews} views
                  </p>
                </div>

                {/* Most Viewed Project */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">Top Project</span>
                  </div>
                  {insights.mostViewedProject ? (
                    <>
                      <p className="text-sm font-bold truncate" title={insights.mostViewedProject.title}>
                        {insights.mostViewedProject.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {insights.mostViewedProject.viewCount} views
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">No data yet</p>
                      <p className="text-xs text-muted-foreground">Views will appear here</p>
                    </>
                  )}
                </div>
              </div>

              {/* Views by Source */}
              {insights.viewsBySource.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-3">Views by Source</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {insights.viewsBySource.map(({ source, count }) => (
                      <div key={source} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                        <span className="text-sm capitalize">{source}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Engagement Signals */}
              <div className="mt-4 pt-4 border-t border-border grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Portfolio View</p>
                    <p className="text-xs text-muted-foreground">
                      {insights.lastViewAt 
                        ? formatDistanceToNow(new Date(insights.lastViewAt), { addSuffix: true })
                        : 'No views yet'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Contact Message</p>
                    <p className="text-xs text-muted-foreground">
                      {insights.lastMessageAt 
                        ? formatDistanceToNow(new Date(insights.lastMessageAt), { addSuffix: true })
                        : 'No messages yet'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Share Links */}
      {portfolio?.published && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Your Portfolio
            </CardTitle>
            <CardDescription>Copy trackable links to share on different platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {shareLinks.map(({ source, label }) => (
                <div key={source} className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 rounded-md bg-muted text-sm truncate">
                    /{portfolio.slug}?src={source}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyLink(source)}
                    className="shrink-0"
                  >
                    {copiedLink === source ? (
                      <Check className="h-4 w-4 text-accent" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={BarChart3}
          label="Total Views"
          value={stats.viewCount}
          isLoading={statsLoading}
          loadingStartTime={loadingStartTimeRef.current}
          error={statsError}
        />
        <StatCard
          icon={Mail}
          label="Unread Messages"
          value={stats.messageCount}
          isLoading={statsLoading}
          loadingStartTime={loadingStartTimeRef.current}
          error={statsError}
        />
        <StatCard
          icon={FolderKanban}
          label="Projects"
          value={stats.projectCount}
          isLoading={statsLoading || planLoading}
          loadingStartTime={loadingStartTimeRef.current}
          error={statsError}
        />
        <StatCard
          icon={Briefcase}
          label="Experiences"
          value={stats.experienceCount}
          isLoading={statsLoading || planLoading}
          loadingStartTime={loadingStartTimeRef.current}
          error={statsError}
        />
        <StatCard
          icon={Zap}
          label="Skills"
          value={stats.skillCount}
          isLoading={statsLoading || planLoading}
          loadingStartTime={loadingStartTimeRef.current}
          error={statsError}
        />
        <StatCard
          icon={Award}
          label="Certifications"
          value={stats.certificationCount}
          isLoading={statsLoading}
          loadingStartTime={loadingStartTimeRef.current}
          error={statsError}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <FolderKanban className="h-8 w-8 text-accent mb-2" />
            <CardTitle className="text-lg">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Showcase your best work</p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/projects">Manage</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <Briefcase className="h-8 w-8 text-accent mb-2" />
            <CardTitle className="text-lg">Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Your career timeline</p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/experience">Manage</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <Award className="h-8 w-8 text-accent mb-2" />
            <CardTitle className="text-lg">Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Your achievements</p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/certifications">Manage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <ResumeTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        onExport={exportResume}
        exporting={exporting}
      />
    </div>
  );
}
