import { useWorkspace } from '@/hooks/useWorkspace';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

// Plan types matching database enum
export type PlanType = 'free' | 'starter' | 'pro';

// Centralized plan configuration
export interface PlanLimits {
  maxProjects: number;
  maxSkills: number;
  maxExperiences: number;
  allowedThemes: string[];
  seoKeywordsEnabled: boolean;
  ogImageEnabled: boolean;
  watermarkEnabled: boolean; // Free plan has watermark
}

export interface PlanFeatures {
  name: string;
  displayName: string;
  description: string;
  price: number; // Price in paise (e.g., 4900 = ₹49)
  limits: PlanLimits;
}

// Plan definitions - centralized source of truth
export const PLAN_DEFINITIONS: Record<PlanType, PlanFeatures> = {
  free: {
    name: 'free',
    displayName: 'Free',
    description: 'Get started with your portfolio',
    price: 0,
    limits: {
      maxProjects: 3,
      maxSkills: 10,
      maxExperiences: 3,
      allowedThemes: ['minimal', 'modern'], // Default + 1 extra
      seoKeywordsEnabled: false,
      ogImageEnabled: false,
      watermarkEnabled: true, // Free plan shows watermark
    },
  },
  starter: {
    name: 'starter',
    displayName: 'Starter',
    description: 'Remove watermark and unlock more',
    price: 4900, // ₹49 in paise
    limits: {
      maxProjects: 10,
      maxSkills: 30,
      maxExperiences: 10,
      allowedThemes: ['minimal', 'modern', 'bold', 'corporate'],
      seoKeywordsEnabled: true,
      ogImageEnabled: false,
      watermarkEnabled: false, // No watermark
    },
  },
  pro: {
    name: 'pro',
    displayName: 'Pro',
    description: 'Unlock unlimited features',
    price: 9900, // ₹99 in paise
    limits: {
      maxProjects: 1000, // Effectively unlimited
      maxSkills: 1000,
      maxExperiences: 1000,
      allowedThemes: ['minimal', 'modern', 'bold', 'cyberpunk', 'corporate', 'neon-creative', 'editorial', 'warm-sunset'],
      seoKeywordsEnabled: true,
      ogImageEnabled: true,
      watermarkEnabled: false, // No watermark
    },
  },
};

export interface UsageStats {
  projects: number;
  skills: number;
  experiences: number;
}

export interface PlanLimitsResult {
  plan: PlanType;
  planFeatures: PlanFeatures;
  usage: UsageStats;
  loading: boolean;
  
  // Helper functions
  canAddProject: () => boolean;
  canAddSkill: () => boolean;
  canAddExperience: () => boolean;
  isThemeAllowed: (themeId: string) => boolean;
  canUseSeoKeywords: () => boolean;
  canUseOgImage: () => boolean;
  
  // Usage display helpers
  getProjectUsage: () => { current: number; max: number; isAtLimit: boolean };
  getSkillUsage: () => { current: number; max: number; isAtLimit: boolean };
  getExperienceUsage: () => { current: number; max: number; isAtLimit: boolean };
  
  // Refresh usage data
  refetchUsage: () => void;
}

export function usePlanLimits(): PlanLimitsResult {
  const { workspace, portfolio, loading: workspaceLoading } = useWorkspace();
  
  const plan: PlanType = (workspace?.plan as PlanType) || 'free';
  const planFeatures = PLAN_DEFINITIONS[plan];
  const portfolioId = portfolio?.id;
  
  const { data: usage = { projects: 0, skills: 0, experiences: 0 }, isLoading: usageLoading, refetch } = useQuery({
    queryKey: ['plan-usage', portfolioId],
    enabled: !!portfolioId,
    // Cache for 5 minutes - don't refetch on every page navigation
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<UsageStats> => {
      if (!portfolioId) return { projects: 0, skills: 0, experiences: 0 };
      
      const [projectsRes, skillsRes, experiencesRes] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('portfolio_id', portfolioId),
        supabase.from('skills').select('id', { count: 'exact', head: true }).eq('portfolio_id', portfolioId),
        supabase.from('experiences').select('id', { count: 'exact', head: true }).eq('portfolio_id', portfolioId),
      ]);
      
      return {
        projects: projectsRes.count || 0,
        skills: skillsRes.count || 0,
        experiences: experiencesRes.count || 0,
      };
    },
  });
  
  // Memoize helper functions to prevent unnecessary re-renders
  const helpers = useMemo(() => ({
    canAddProject: () => usage.projects < planFeatures.limits.maxProjects,
    canAddSkill: () => usage.skills < planFeatures.limits.maxSkills,
    canAddExperience: () => usage.experiences < planFeatures.limits.maxExperiences,
    isThemeAllowed: (themeId: string) => planFeatures.limits.allowedThemes.includes(themeId),
    canUseSeoKeywords: () => planFeatures.limits.seoKeywordsEnabled,
    canUseOgImage: () => planFeatures.limits.ogImageEnabled,
    getProjectUsage: () => ({
      current: usage.projects,
      max: planFeatures.limits.maxProjects,
      isAtLimit: usage.projects >= planFeatures.limits.maxProjects,
    }),
    getSkillUsage: () => ({
      current: usage.skills,
      max: planFeatures.limits.maxSkills,
      isAtLimit: usage.skills >= planFeatures.limits.maxSkills,
    }),
    getExperienceUsage: () => ({
      current: usage.experiences,
      max: planFeatures.limits.maxExperiences,
      isAtLimit: usage.experiences >= planFeatures.limits.maxExperiences,
    }),
  }), [usage, planFeatures]);
  
  return {
    plan,
    planFeatures,
    usage,
    loading: workspaceLoading || usageLoading,
    ...helpers,
    refetchUsage: refetch,
  };
}
