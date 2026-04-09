import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Workspace {
  id: string;
  name: string;
  plan: 'free' | 'starter' | 'pro';
  owner_id: string;
  created_at: string;
  onboarding_completed: boolean;
}

export type BackgroundStyle = 'animated' | 'static' | 'none';

interface Portfolio {
  id: string;
  workspace_id: string;
  slug: string;
  title: string;
  tagline: string | null;
  bio: string | null;
  avatar_url: string | null;
  theme: string;
  background_style: BackgroundStyle;
  published: boolean;
  hero_image_url: string | null;
  location: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  dribbble_url: string | null;
  behance_url: string | null;
  medium_url: string | null;
  custom_social_label: string | null;
  custom_social_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_image: string | null;
  created_at: string;
  updated_at: string;
}

interface PortfolioSections {
  id: string;
  portfolio_id: string;
  show_skills: boolean;
  show_projects: boolean;
  show_experience: boolean;
  show_certifications: boolean;
  show_contact: boolean;
}

type WorkspaceBundle = {
  workspace: Workspace | null;
  portfolio: Portfolio | null;
  sections: PortfolioSections | null;
};

export function useWorkspace() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => ['workspace_bundle', user?.id] as const, [user?.id]);

  const {
    data,
    isLoading,
    error,
    refetch: queryRefetch,
  } = useQuery<WorkspaceBundle>(
    {
      queryKey,
      enabled: !!user,
      // This bundle powers almost every dashboard page; keep it hot + stable.
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnMount: false,
      refetchOnReconnect: false,
      // If the user is missing a workspace_members row, don't hammer the network.
      retry: 0,
      queryFn: async () => {
        if (!user) return { workspace: null, portfolio: null, sections: null };

        // Get workspace membership first (required for subsequent queries)
        const { data: membership, error: membershipError } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (membershipError) throw membershipError;
        // No membership: return empty bundle (avoid repeated retries + lag)
        if (!membership?.workspace_id) {
          return { workspace: null, portfolio: null, sections: null };
        }

        // Fetch workspace + portfolio in parallel
        const [workspaceRes, portfolioRes] = await Promise.all([
          supabase
            .from('workspaces')
            .select('*')
            .eq('id', membership.workspace_id)
            .single(),
          supabase
            .from('portfolios')
            .select('*')
            .eq('workspace_id', membership.workspace_id)
            .limit(1)
            .maybeSingle(),
        ]);

        if (workspaceRes.error) throw workspaceRes.error;
        if (portfolioRes.error) throw portfolioRes.error;

        const workspace = workspaceRes.data as Workspace;
        const portfolio = (portfolioRes.data as Portfolio | null) ?? null;

        let sections: PortfolioSections | null = null;

        if (portfolio) {
          const { data: sectionsData, error: sectionsError } = await supabase
            .from('portfolio_sections')
            .select('*')
            .eq('portfolio_id', portfolio.id)
            .maybeSingle();

          if (sectionsError && sectionsError.code !== 'PGRST116') throw sectionsError;

          if (sectionsData) {
            sections = sectionsData as PortfolioSections;
          } else {
            // Create default sections if they don't exist
            const { data: newSections, error: createError } = await supabase
              .from('portfolio_sections')
              .insert({
                portfolio_id: portfolio.id,
                show_skills: true,
                show_projects: true,
                show_experience: true,
                show_certifications: true,
                show_contact: true,
              })
              .select()
              .single();

            if (createError) throw createError;
            sections = newSections as PortfolioSections;
          }
        }

        return { workspace, portfolio, sections };
      },
    }
  );

  const updatePortfolio = async (updates: Partial<Portfolio>): Promise<{ data?: Portfolio | null; error?: string | null }> => {
    const current = queryClient.getQueryData<WorkspaceBundle>(queryKey);
    const currentPortfolio = current?.portfolio;
    const currentWorkspace = current?.workspace;

    if (!currentPortfolio || !currentWorkspace) {
      console.error('[useWorkspace] updatePortfolio: No portfolio or workspace found');
      return { error: 'No portfolio found. Please refresh the page.' };
    }

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .update(updates)
        .eq('id', currentPortfolio.id)
        .eq('workspace_id', currentWorkspace.id) // Ensure workspace ownership
        .select()
        .single();

      if (error) {
        console.error('[useWorkspace] updatePortfolio error:', error);
        return { data: null, error: error.message || 'Failed to update portfolio' };
      }

      if (data) {
        queryClient.setQueryData<WorkspaceBundle>(queryKey, (prev) => ({
          workspace: prev?.workspace ?? currentWorkspace,
          sections: prev?.sections ?? current?.sections ?? null,
          portfolio: data as Portfolio,
        }));
      }

      return { data: data as Portfolio, error: null };
    } catch (err: unknown) {
      console.error('[useWorkspace] updatePortfolio unexpected error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unexpected error during update';
      return { data: null, error: errorMessage };
    }
  };

  const updateSections = async (updates: Partial<Omit<PortfolioSections, 'id' | 'portfolio_id'>>): Promise<{ data?: PortfolioSections | null; error?: string | null }> => {
    const current = queryClient.getQueryData<WorkspaceBundle>(queryKey);
    const currentSections = current?.sections;
    const currentPortfolio = current?.portfolio;

    if (!currentSections || !currentPortfolio) {
      console.error('[useWorkspace] updateSections: No sections or portfolio found');
      return { error: 'No sections found. Please refresh the page.' };
    }

    try {
      const { data, error } = await supabase
        .from('portfolio_sections')
        .update(updates)
        .eq('id', currentSections.id)
        .eq('portfolio_id', currentPortfolio.id) // Ensure portfolio ownership
        .select()
        .single();

      if (error) {
        console.error('[useWorkspace] updateSections error:', error);
        return { data: null, error: error.message || 'Failed to update sections' };
      }

      if (data) {
        queryClient.setQueryData<WorkspaceBundle>(queryKey, (prev) => ({
          workspace: prev?.workspace ?? current?.workspace ?? null,
          portfolio: prev?.portfolio ?? currentPortfolio,
          sections: data as PortfolioSections,
        }));
      }

      return { data: data as PortfolioSections, error: null };
    } catch (err: unknown) {
      console.error('[useWorkspace] updateSections unexpected error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unexpected error during update';
      return { data: null, error: errorMessage };
    }
  };

  const refetch = () => {
    void queryRefetch();
  };

  const completeOnboarding = async () => {
    const current = queryClient.getQueryData<WorkspaceBundle>(queryKey);
    const currentWorkspace = current?.workspace;
    if (!currentWorkspace) return { error: 'No workspace found' };

    const { data, error } = await supabase
      .from('workspaces')
      .update({ onboarding_completed: true })
      .eq('id', currentWorkspace.id)
      .select()
      .single();

    if (!error && data) {
      queryClient.setQueryData<WorkspaceBundle>(queryKey, (prev) => ({
        workspace: data as Workspace,
        portfolio: prev?.portfolio ?? current?.portfolio ?? null,
        sections: prev?.sections ?? current?.sections ?? null,
      }));
    }

    return { data, error };
  };

  return {
    workspace: data?.workspace ?? null,
    portfolio: data?.portfolio ?? null,
    sections: data?.sections ?? null,
    loading: !!user ? isLoading : false,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    updatePortfolio,
    updateSections,
    completeOnboarding,
    refetch,
  };
}
