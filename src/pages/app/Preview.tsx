import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useWorkspace } from '@/hooks/useWorkspace';
import { supabase } from '@/integrations/supabase/client';
import { Eye, X } from 'lucide-react';
import { PageLoader } from '@/components/brand/LogoSpinner';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MinimalTheme } from '@/components/portfolio-themes/MinimalTheme';
import { ModernTheme } from '@/components/portfolio-themes/ModernTheme';
import { BoldTheme } from '@/components/portfolio-themes/BoldTheme';
import { CyberpunkTheme } from '@/components/portfolio-themes/CyberpunkTheme';
import { CorporateTheme } from '@/components/portfolio-themes/CorporateTheme';
import { NeonCreativeTheme } from '@/components/portfolio-themes/NeonCreativeTheme';
import { EditorialTheme } from '@/components/portfolio-themes/EditorialTheme';
import { WarmSunsetTheme } from '@/components/portfolio-themes/WarmSunsetTheme';
import type { FullPortfolioData, PortfolioSections, SectionOrder } from '@/pages/PublicPortfolio';

const DEFAULT_THEME = 'minimal';

const themeComponents: Record<string, React.ComponentType<{ data: FullPortfolioData }>> = {
  minimal: MinimalTheme,
  modern: ModernTheme,
  bold: BoldTheme,
  cyberpunk: CyberpunkTheme,
  corporate: CorporateTheme,
  'neon-creative': NeonCreativeTheme,
  editorial: EditorialTheme,
  'warm-sunset': WarmSunsetTheme,
};

const getThemeComponent = (themeId: string | null | undefined) => {
  const safeThemeId = themeId && themeComponents[themeId] ? themeId : DEFAULT_THEME;
  return themeComponents[safeThemeId];
};

export default function Preview() {
  const { portfolio, workspace, sections, loading: workspaceLoading } = useWorkspace();
  const [data, setData] = useState<FullPortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (portfolio?.id && !workspaceLoading) {
      fetchPreviewData();
    }
  }, [portfolio?.id, workspaceLoading]);

  const fetchPreviewData = async () => {
    if (!portfolio) return;

    try {
      // Fetch all portfolio data for preview (bypasses published check since user owns it)
      const [projectsRes, experiencesRes, skillsRes, certificationsRes, customSectionsRes, sectionsOrderRes] = await Promise.all([
        supabase
          .from('projects')
          .select('id, title, description, short_description, full_description, project_type, image_url, gallery_images, demo_video_url, project_url, github_url, case_study_url, technologies, tools_used, category, role, team_size, start_date, end_date, status, problem_statement, solution_summary, key_achievements, metrics, featured, published')
          .eq('portfolio_id', portfolio.id)
          .order('display_order', { ascending: true }),
        supabase
          .from('experiences')
          .select('id, company, position, employment_type, location, description, role_summary, responsibilities, achievements, technologies_used, start_date, end_date, is_current, published')
          .eq('portfolio_id', portfolio.id)
          .order('display_order', { ascending: true }),
        supabase
          .from('skills')
          .select('id, name, category, proficiency, published')
          .eq('portfolio_id', portfolio.id)
          .order('display_order', { ascending: true }),
        supabase
          .from('certifications')
          .select('id, name, issuer, credential_id, credential_url, issue_date, expiry_date')
          .eq('portfolio_id', portfolio.id)
          .order('display_order', { ascending: true }),
        supabase
          .from('custom_sections')
          .select('id, title, content, display_order')
          .eq('portfolio_id', portfolio.id)
          .eq('visibility', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('portfolio_sections')
          .select('hero_order, about_order, projects_order, experience_order, skills_order, certifications_order, custom_sections_order, contact_order')
          .eq('portfolio_id', portfolio.id)
          .maybeSingle(),
      ]);

      // Filter to only show published items (respects individual publish toggles)
      const publishedProjects = (projectsRes.data || []).filter((p) => p.published !== false);
      const publishedExperiences = (experiencesRes.data || []).filter((e) => e.published !== false);
      const publishedSkills = (skillsRes.data || []).filter((s) => s.published !== false);

      // Build sections config from workspace sections or defaults
      const sectionConfig: PortfolioSections = sections
        ? {
            show_projects: sections.show_projects ?? true,
            show_experience: sections.show_experience ?? true,
            show_skills: sections.show_skills ?? true,
            show_certifications: sections.show_certifications ?? true,
            show_contact: sections.show_contact ?? true,
          }
        : {
            show_projects: true,
            show_experience: true,
            show_skills: true,
            show_certifications: true,
            show_contact: true,
          };

      const sectionOrderConfig: SectionOrder = sectionsOrderRes.data
        ? {
            hero_order: sectionsOrderRes.data.hero_order ?? 0,
            about_order: sectionsOrderRes.data.about_order ?? 1,
            projects_order: sectionsOrderRes.data.projects_order ?? 2,
            experience_order: sectionsOrderRes.data.experience_order ?? 3,
            skills_order: sectionsOrderRes.data.skills_order ?? 4,
            certifications_order: sectionsOrderRes.data.certifications_order ?? 5,
            custom_sections_order: sectionsOrderRes.data.custom_sections_order ?? 6,
            contact_order: sectionsOrderRes.data.contact_order ?? 7,
          }
        : {
            hero_order: 0,
            about_order: 1,
            projects_order: 2,
            experience_order: 3,
            skills_order: 4,
            certifications_order: 5,
            custom_sections_order: 6,
            contact_order: 7,
          };

      setData({
        portfolio: {
          id: portfolio.id,
          title: portfolio.title,
          tagline: portfolio.tagline,
          bio: portfolio.bio,
          avatar_url: portfolio.avatar_url,
          hero_image_url: portfolio.hero_image_url,
          location: portfolio.location,
          contact_email: portfolio.contact_email || null,
          contact_phone: portfolio.contact_phone || null,
          website_url: portfolio.website_url,
          linkedin_url: portfolio.linkedin_url,
          github_url: portfolio.github_url,
          twitter_url: portfolio.twitter_url,
          instagram_url: portfolio.instagram_url || null,
          youtube_url: portfolio.youtube_url || null,
          dribbble_url: portfolio.dribbble_url || null,
          behance_url: portfolio.behance_url || null,
          medium_url: portfolio.medium_url || null,
          custom_social_label: portfolio.custom_social_label || null,
          custom_social_url: portfolio.custom_social_url || null,
          theme: portfolio.theme,
          background_style: portfolio.background_style || 'animated',
          seo_title: portfolio.seo_title,
          seo_description: portfolio.seo_description,
          seo_keywords: portfolio.seo_keywords,
          og_image: portfolio.og_image,
        },
        projects: publishedProjects,
        experiences: publishedExperiences,
        skills: publishedSkills,
        certifications: certificationsRes.data || [],
        customSections: customSectionsRes.data || [],
        sections: sectionConfig,
        sectionOrder: sectionOrderConfig,
        workspaceId: workspace?.id || '',
      });
    } catch (error) {
      console.error('Error fetching preview data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || workspaceLoading) {
    return <PageLoader />;
  }

  if (!data || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold mb-2">No Portfolio Found</h1>
          <p className="text-muted-foreground mb-4">Create your portfolio to preview it.</p>
          <Button asChild>
            <Link to="/app/portfolio">Create Portfolio</Link>
          </Button>
        </div>
      </div>
    );
  }

  const ThemeComponent = getThemeComponent(data.portfolio.theme);

  return (
    <>
      <Helmet>
        <title>Preview - {data.portfolio.title || 'Portfolio'}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Preview Banner - Fixed at top, not indexable */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-warning text-warning-foreground">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">Preview Mode – Not Public</span>
            {!portfolio.published && (
              <span className="text-xs bg-warning-foreground/20 px-2 py-0.5 rounded">Draft</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-warning-foreground/20"
            asChild
          >
            <Link to="/app/dashboard">
              <X className="h-4 w-4 mr-1" />
              Exit Preview
            </Link>
          </Button>
        </div>
      </div>

      {/* Add top padding to account for fixed banner */}
      <div className="pt-10">
        <ThemeComponent data={data} />
      </div>
    </>
  );
}
