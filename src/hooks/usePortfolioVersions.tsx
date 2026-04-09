import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

export interface PortfolioSnapshot {
  portfolio: {
    title: string;
    tagline: string | null;
    bio: string | null;
    location: string | null;
    website_url: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    twitter_url: string | null;
    theme: string;
    published: boolean;
    avatar_url: string | null;
    hero_image_url: string | null;
    seo_title: string | null;
    seo_description: string | null;
    seo_keywords: string | null;
    og_image: string | null;
  };
  sections: {
    show_skills: boolean;
    show_projects: boolean;
    show_experience: boolean;
    show_certifications: boolean;
    show_contact: boolean;
  };
  skills: Array<{
    id: string;
    name: string;
    category: string | null;
    proficiency: number | null;
    published: boolean | null;
    display_order: number | null;
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string | null;
    short_description: string | null;
    full_description: string | null;
    image_url: string | null;
    project_url: string | null;
    github_url: string | null;
    technologies: string[] | null;
    featured: boolean | null;
    published: boolean | null;
    display_order: number | null;
    category: string | null;
    project_type: string | null;
    status: string | null;
    role: string | null;
  }>;
  experiences: Array<{
    id: string;
    company: string;
    position: string;
    description: string | null;
    start_date: string;
    end_date: string | null;
    is_current: boolean | null;
    location: string | null;
    employment_type: string | null;
    responsibilities: string[] | null;
    achievements: string[] | null;
    technologies_used: string[] | null;
    published: boolean | null;
    display_order: number | null;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    issue_date: string | null;
    expiry_date: string | null;
    credential_id: string | null;
    credential_url: string | null;
    display_order: number | null;
  }>;
  customSections: Array<{
    id: string;
    title: string;
    content: string | null;
    visibility: boolean;
    display_order: number | null;
  }>;
}

export interface PortfolioVersion {
  id: string;
  workspace_id: string;
  portfolio_id: string;
  snapshot_data: PortfolioSnapshot;
  action_type: string;
  created_at: string;
}

export type ActionType = 
  | 'content_save' 
  | 'theme_change' 
  | 'publish_change' 
  | 'settings_save' 
  | 'restore' 
  | 'manual_save';

export function usePortfolioVersions() {
  const { workspace, portfolio, sections, refetch } = useWorkspace();
  const [versions, setVersions] = useState<PortfolioVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const fetchVersions = useCallback(async () => {
    if (!portfolio) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('portfolio_versions')
        .select('*')
        .eq('portfolio_id', portfolio.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Type the snapshot_data properly
      const typedVersions = (data || []).map(v => ({
        ...v,
        snapshot_data: v.snapshot_data as unknown as PortfolioSnapshot
      }));
      
      setVersions(typedVersions);
    } catch (err: any) {
      console.error('Error fetching versions:', err);
    } finally {
      setLoading(false);
    }
  }, [portfolio]);

  const createSnapshot = useCallback(async (actionType: ActionType): Promise<{ success: boolean; error?: string }> => {
    if (!workspace || !portfolio) {
      return { success: false, error: 'No workspace or portfolio found' };
    }

    try {
      // Fetch all current portfolio data
      const [skillsRes, projectsRes, experiencesRes, certificationsRes, customSectionsRes, sectionsRes] = await Promise.all([
        supabase.from('skills').select('*').eq('portfolio_id', portfolio.id).order('display_order'),
        supabase.from('projects').select('*').eq('portfolio_id', portfolio.id).order('display_order'),
        supabase.from('experiences').select('*').eq('portfolio_id', portfolio.id).order('display_order'),
        supabase.from('certifications').select('*').eq('portfolio_id', portfolio.id).order('display_order'),
        supabase.from('custom_sections').select('*').eq('portfolio_id', portfolio.id).order('display_order'),
        supabase.from('portfolio_sections').select('*').eq('portfolio_id', portfolio.id).maybeSingle(),
      ]);

      const snapshot: PortfolioSnapshot = {
        portfolio: {
          title: portfolio.title,
          tagline: portfolio.tagline,
          bio: portfolio.bio,
          location: portfolio.location,
          website_url: portfolio.website_url,
          linkedin_url: portfolio.linkedin_url,
          github_url: portfolio.github_url,
          twitter_url: portfolio.twitter_url,
          theme: portfolio.theme,
          published: portfolio.published,
          avatar_url: portfolio.avatar_url,
          hero_image_url: portfolio.hero_image_url,
          seo_title: portfolio.seo_title,
          seo_description: portfolio.seo_description,
          seo_keywords: portfolio.seo_keywords,
          og_image: portfolio.og_image,
        },
        sections: {
          show_skills: sectionsRes.data?.show_skills ?? true,
          show_projects: sectionsRes.data?.show_projects ?? true,
          show_experience: sectionsRes.data?.show_experience ?? true,
          show_certifications: sectionsRes.data?.show_certifications ?? true,
          show_contact: sectionsRes.data?.show_contact ?? true,
        },
        skills: (skillsRes.data || []).map(s => ({
          id: s.id,
          name: s.name,
          category: s.category,
          proficiency: s.proficiency,
          published: s.published,
          display_order: s.display_order,
        })),
        projects: (projectsRes.data || []).map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          short_description: p.short_description,
          full_description: p.full_description,
          image_url: p.image_url,
          project_url: p.project_url,
          github_url: p.github_url,
          technologies: p.technologies,
          featured: p.featured,
          published: p.published,
          display_order: p.display_order,
          category: p.category,
          project_type: p.project_type,
          status: p.status,
          role: p.role,
        })),
        experiences: (experiencesRes.data || []).map(e => ({
          id: e.id,
          company: e.company,
          position: e.position,
          description: e.description,
          start_date: e.start_date,
          end_date: e.end_date,
          is_current: e.is_current,
          location: e.location,
          employment_type: e.employment_type,
          responsibilities: e.responsibilities,
          achievements: e.achievements,
          technologies_used: e.technologies_used,
          published: e.published,
          display_order: e.display_order,
        })),
        certifications: (certificationsRes.data || []).map(c => ({
          id: c.id,
          name: c.name,
          issuer: c.issuer,
          issue_date: c.issue_date,
          expiry_date: c.expiry_date,
          credential_id: c.credential_id,
          credential_url: c.credential_url,
          display_order: c.display_order,
        })),
        customSections: (customSectionsRes.data || []).map(cs => ({
          id: cs.id,
          title: cs.title,
          content: cs.content,
          visibility: cs.visibility,
          display_order: cs.display_order,
        })),
      };

      const { error } = await supabase
        .from('portfolio_versions')
        .insert([{
          workspace_id: workspace.id,
          portfolio_id: portfolio.id,
          snapshot_data: JSON.parse(JSON.stringify(snapshot)),
          action_type: actionType,
        }]);

      if (error) throw error;

      return { success: true };
    } catch (err: any) {
      console.error('Error creating snapshot:', err);
      return { success: false, error: err.message };
    }
  }, [workspace, portfolio]);

  const restoreVersion = useCallback(async (version: PortfolioVersion): Promise<{ success: boolean; error?: string }> => {
    if (!workspace || !portfolio) {
      return { success: false, error: 'No workspace or portfolio found' };
    }

    setRestoring(true);

    try {
      const snapshot = version.snapshot_data;

      // Update portfolio
      const { error: portfolioError } = await supabase
        .from('portfolios')
        .update({
          title: snapshot.portfolio.title,
          tagline: snapshot.portfolio.tagline,
          bio: snapshot.portfolio.bio,
          location: snapshot.portfolio.location,
          website_url: snapshot.portfolio.website_url,
          linkedin_url: snapshot.portfolio.linkedin_url,
          github_url: snapshot.portfolio.github_url,
          twitter_url: snapshot.portfolio.twitter_url,
          theme: snapshot.portfolio.theme,
          published: snapshot.portfolio.published,
          avatar_url: snapshot.portfolio.avatar_url,
          hero_image_url: snapshot.portfolio.hero_image_url,
          seo_title: snapshot.portfolio.seo_title,
          seo_description: snapshot.portfolio.seo_description,
          seo_keywords: snapshot.portfolio.seo_keywords,
          og_image: snapshot.portfolio.og_image,
        })
        .eq('id', portfolio.id);

      if (portfolioError) throw portfolioError;

      // Update sections
      const { error: sectionsError } = await supabase
        .from('portfolio_sections')
        .update({
          show_skills: snapshot.sections.show_skills,
          show_projects: snapshot.sections.show_projects,
          show_experience: snapshot.sections.show_experience,
          show_certifications: snapshot.sections.show_certifications,
          show_contact: snapshot.sections.show_contact,
        })
        .eq('portfolio_id', portfolio.id);

      if (sectionsError) throw sectionsError;

      // Delete and re-insert skills
      await supabase.from('skills').delete().eq('portfolio_id', portfolio.id);
      if (snapshot.skills.length > 0) {
        const { error: skillsError } = await supabase
          .from('skills')
          .insert(snapshot.skills.map(s => ({ ...s, portfolio_id: portfolio.id })));
        if (skillsError) throw skillsError;
      }

      // Delete and re-insert projects
      await supabase.from('projects').delete().eq('portfolio_id', portfolio.id);
      if (snapshot.projects.length > 0) {
        const { error: projectsError } = await supabase
          .from('projects')
          .insert(snapshot.projects.map(p => ({ ...p, portfolio_id: portfolio.id })));
        if (projectsError) throw projectsError;
      }

      // Delete and re-insert experiences
      await supabase.from('experiences').delete().eq('portfolio_id', portfolio.id);
      if (snapshot.experiences.length > 0) {
        const { error: experiencesError } = await supabase
          .from('experiences')
          .insert(snapshot.experiences.map(e => ({ ...e, portfolio_id: portfolio.id })));
        if (experiencesError) throw experiencesError;
      }

      // Delete and re-insert certifications
      await supabase.from('certifications').delete().eq('portfolio_id', portfolio.id);
      if (snapshot.certifications.length > 0) {
        const { error: certificationsError } = await supabase
          .from('certifications')
          .insert(snapshot.certifications.map(c => ({ ...c, portfolio_id: portfolio.id })));
        if (certificationsError) throw certificationsError;
      }

      // Delete and re-insert custom sections
      await supabase.from('custom_sections').delete().eq('portfolio_id', portfolio.id);
      if (snapshot.customSections.length > 0) {
        const { error: customSectionsError } = await supabase
          .from('custom_sections')
          .insert(snapshot.customSections.map(cs => ({ ...cs, portfolio_id: portfolio.id })));
        if (customSectionsError) throw customSectionsError;
      }

      // Create a new version entry for the restore action
      await createSnapshot('restore');

      // Refresh workspace data
      refetch();

      toast.success('Portfolio restored successfully');
      return { success: true };
    } catch (err: any) {
      console.error('Error restoring version:', err);
      toast.error('Could not restore version. Please try again.');
      return { success: false, error: err.message };
    } finally {
      setRestoring(false);
    }
  }, [workspace, portfolio, createSnapshot, refetch]);

  const getActionLabel = (actionType: string): string => {
    const labels: Record<string, string> = {
      content_save: 'Content saved',
      theme_change: 'Theme changed',
      publish_change: 'Visibility changed',
      settings_save: 'Settings saved',
      restore: 'Restored from backup',
      manual_save: 'Manual save',
    };
    return labels[actionType] || actionType;
  };

  return {
    versions,
    loading,
    restoring,
    fetchVersions,
    createSnapshot,
    restoreVersion,
    getActionLabel,
  };
}
