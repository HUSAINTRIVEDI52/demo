import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { subDays } from 'date-fns';

export interface SourceViewCount {
  source: string;
  count: number;
}

export interface AnalyticsInsights {
  // Portfolio views
  totalViews: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  lastViewAt: string | null;
  
  // Views by source
  viewsBySource: SourceViewCount[];
  
  // Contact conversion
  totalMessages: number;
  conversionRate: number; // percentage
  lastMessageAt: string | null;
  
  // Most viewed project (if project views are tracked)
  mostViewedProject: {
    id: string;
    title: string;
    viewCount: number;
  } | null;
}

export function useAnalyticsInsights() {
  const { workspace, portfolio } = useWorkspace();
  const [insights, setInsights] = useState<AnalyticsInsights>({
    totalViews: 0,
    viewsLast7Days: 0,
    viewsLast30Days: 0,
    lastViewAt: null,
    viewsBySource: [],
    totalMessages: 0,
    conversionRate: 0,
    lastMessageAt: null,
    mostViewedProject: null,
  });
  const [loading, setLoading] = useState(false);

  const fetchInsights = useCallback(async () => {
    if (!workspace?.id || !portfolio?.id) return;

    setLoading(true);

    try {
      const now = new Date();
      const sevenDaysAgo = subDays(now, 7).toISOString();
      const thirtyDaysAgo = subDays(now, 30).toISOString();

      // Fetch all data in parallel - consolidated to avoid duplicate queries
      const [
        totalViewsRes,
        views7DaysRes,
        views30DaysRes,
        lastViewRes,
        totalMessagesRes,
        lastMessageRes,
        projectViewsAndSourceRes, // Combined: get all portfolio_view events with metadata once
        projectsRes,
      ] = await Promise.all([
        // Total portfolio views
        supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .eq('event_type', 'portfolio_view'),
        
        // Views last 7 days
        supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .eq('event_type', 'portfolio_view')
          .gte('created_at', sevenDaysAgo),
        
        // Views last 30 days
        supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)
          .eq('event_type', 'portfolio_view')
          .gte('created_at', thirtyDaysAgo),
        
        // Last view timestamp
        supabase
          .from('events')
          .select('created_at')
          .eq('workspace_id', workspace.id)
          .eq('event_type', 'portfolio_view')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        
        // Total contact messages
        supabase
          .from('contact_messages')
          .select('id', { count: 'exact', head: true })
          .eq('portfolio_id', portfolio.id),
        
        // Last message timestamp
        supabase
          .from('contact_messages')
          .select('created_at')
          .eq('portfolio_id', portfolio.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        
        // All events with metadata (portfolio_view + project_view) - fetch once for both source and project analysis
        supabase
          .from('events')
          .select('event_type, metadata')
          .eq('workspace_id', workspace.id)
          .in('event_type', ['portfolio_view', 'project_view']),
        
        // Projects list for title lookup
        supabase
          .from('projects')
          .select('id, title')
          .eq('portfolio_id', portfolio.id),
      ]);

      const totalViews = totalViewsRes.count || 0;
      const viewsLast7Days = views7DaysRes.count || 0;
      const viewsLast30Days = views30DaysRes.count || 0;
      const lastViewAt = lastViewRes.data?.created_at || null;
      const totalMessages = totalMessagesRes.count || 0;
      const lastMessageAt = lastMessageRes.data?.created_at || null;

      // Calculate conversion rate
      const conversionRate = totalViews > 0 
        ? Math.round((totalMessages / totalViews) * 100 * 10) / 10 
        : 0;

      // Find most viewed project - extract project_view events from combined response
      let mostViewedProject: AnalyticsInsights['mostViewedProject'] = null;
      const projectViewEvents = projectViewsAndSourceRes.data?.filter(e => e.event_type === 'project_view') || [];
      
      if (projectViewEvents.length > 0 && projectsRes.data) {
        // Count views per project
        const projectViewCounts = new Map<string, number>();
        
        for (const event of projectViewEvents) {
          const projectId = (event.metadata as { project_id?: string })?.project_id;
          if (projectId) {
            projectViewCounts.set(projectId, (projectViewCounts.get(projectId) || 0) + 1);
          }
        }

        // Find project with most views
        let maxViews = 0;
        let maxProjectId: string | null = null;
        
        for (const [projectId, count] of projectViewCounts) {
          if (count > maxViews) {
            maxViews = count;
            maxProjectId = projectId;
          }
        }

        if (maxProjectId) {
          const project = projectsRes.data.find(p => p.id === maxProjectId);
          if (project) {
            mostViewedProject = {
              id: project.id,
              title: project.title,
              viewCount: maxViews,
            };
          }
        }
      }

      // Aggregate views by source - extract portfolio_view events from combined response
      const sourceCounts = new Map<string, number>();
      const portfolioViewEvents = projectViewsAndSourceRes.data?.filter(e => e.event_type === 'portfolio_view') || [];
      
      for (const event of portfolioViewEvents) {
        const source = (event.metadata as { source?: string })?.source || 'direct';
        sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
      }

      // Convert to sorted array (highest first)
      const viewsBySource: SourceViewCount[] = Array.from(sourceCounts.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);

      setInsights({
        totalViews,
        viewsLast7Days,
        viewsLast30Days,
        lastViewAt,
        viewsBySource,
        totalMessages,
        conversionRate,
        lastMessageAt,
        mostViewedProject,
      });
    } catch (error) {
      console.error('Error fetching analytics insights:', error);
    } finally {
      setLoading(false);
    }
  }, [workspace?.id, portfolio?.id]);

  return {
    insights,
    loading,
    fetchInsights,
  };
}
