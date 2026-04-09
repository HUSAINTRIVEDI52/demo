import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, X, Smartphone, Monitor, Tablet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MinimalTheme } from '@/components/portfolio-themes/MinimalTheme';
import { ModernTheme } from '@/components/portfolio-themes/ModernTheme';
import { BoldTheme } from '@/components/portfolio-themes/BoldTheme';
import { CyberpunkTheme } from '@/components/portfolio-themes/CyberpunkTheme';
import { CorporateTheme } from '@/components/portfolio-themes/CorporateTheme';
import { NeonCreativeTheme } from '@/components/portfolio-themes/NeonCreativeTheme';
import { EditorialTheme } from '@/components/portfolio-themes/EditorialTheme';
import { WarmSunsetTheme } from '@/components/portfolio-themes/WarmSunsetTheme';
import type { FullPortfolioData, PortfolioSections, SectionOrder } from '@/pages/PublicPortfolio';
import type { BackgroundStyle } from '@/hooks/useWorkspace';
import { cn } from '@/lib/utils';

interface PortfolioPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  selectedTheme: string;
  profileData: {
    fullName: string;
    bio: string;
    location: string;
    avatarUrl: string | null;
  };
}

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

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const viewportSizes: Record<ViewportSize, { width: string; icon: React.ReactNode; label: string }> = {
  desktop: { width: '100%', icon: <Monitor className="h-4 w-4" />, label: 'Desktop' },
  tablet: { width: '768px', icon: <Tablet className="h-4 w-4" />, label: 'Tablet' },
  mobile: { width: '375px', icon: <Smartphone className="h-4 w-4" />, label: 'Mobile' },
};

export function PortfolioPreviewModal({
  open,
  onOpenChange,
  userId,
  selectedTheme,
  profileData,
}: PortfolioPreviewModalProps) {
  const [data, setData] = useState<FullPortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');

  useEffect(() => {
    if (open && userId) {
      fetchPreviewData();
    }
  }, [open, userId, selectedTheme, profileData]);

  const fetchPreviewData = async () => {
    setLoading(true);
    try {
      // Get workspace and portfolio
      const { data: workspace } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', userId)
        .single();

      if (!workspace) {
        setLoading(false);
        return;
      }

      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('*')
        .eq('workspace_id', workspace.workspace_id)
        .single();

      if (!portfolio) {
        setLoading(false);
        return;
      }

      // Fetch all portfolio data
      const [projectsRes, experiencesRes, skillsRes, certificationsRes, customSectionsRes, sectionsRes] = await Promise.all([
        supabase
          .from('projects')
          .select('*')
          .eq('portfolio_id', portfolio.id)
          .order('display_order', { ascending: true }),
        supabase
          .from('experiences')
          .select('*')
          .eq('portfolio_id', portfolio.id)
          .order('display_order', { ascending: true }),
        supabase
          .from('skills')
          .select('*')
          .eq('portfolio_id', portfolio.id)
          .order('display_order', { ascending: true }),
        supabase
          .from('certifications')
          .select('*')
          .eq('portfolio_id', portfolio.id)
          .order('display_order', { ascending: true }),
        supabase
          .from('custom_sections')
          .select('*')
          .eq('portfolio_id', portfolio.id)
          .eq('visibility', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('portfolio_sections')
          .select('*')
          .eq('portfolio_id', portfolio.id)
          .maybeSingle(),
      ]);

      const sectionConfig: PortfolioSections = sectionsRes.data
        ? {
            show_projects: sectionsRes.data.show_projects ?? true,
            show_experience: sectionsRes.data.show_experience ?? true,
            show_skills: sectionsRes.data.show_skills ?? true,
            show_certifications: sectionsRes.data.show_certifications ?? true,
            show_contact: sectionsRes.data.show_contact ?? true,
          }
        : {
            show_projects: true,
            show_experience: true,
            show_skills: true,
            show_certifications: true,
            show_contact: true,
          };

      const sectionOrderConfig: SectionOrder = sectionsRes.data
        ? {
            hero_order: sectionsRes.data.hero_order ?? 0,
            about_order: sectionsRes.data.about_order ?? 1,
            projects_order: sectionsRes.data.projects_order ?? 2,
            experience_order: sectionsRes.data.experience_order ?? 3,
            skills_order: sectionsRes.data.skills_order ?? 4,
            certifications_order: sectionsRes.data.certifications_order ?? 5,
            custom_sections_order: sectionsRes.data.custom_sections_order ?? 6,
            contact_order: sectionsRes.data.contact_order ?? 7,
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

      // Merge live profile data with portfolio data for real-time preview
      setData({
        portfolio: {
          id: portfolio.id,
          title: profileData.fullName || portfolio.title,
          tagline: portfolio.tagline,
          bio: profileData.bio || portfolio.bio,
          avatar_url: profileData.avatarUrl || portfolio.avatar_url,
          hero_image_url: portfolio.hero_image_url,
          location: profileData.location || portfolio.location,
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
          theme: selectedTheme,
          background_style: (portfolio.background_style as BackgroundStyle) || 'animated',
          seo_title: portfolio.seo_title,
          seo_description: portfolio.seo_description,
          seo_keywords: portfolio.seo_keywords,
          og_image: portfolio.og_image,
        },
        projects: (projectsRes.data || []).filter((p) => p.published !== false),
        experiences: (experiencesRes.data || []).filter((e) => e.published !== false),
        skills: (skillsRes.data || []).filter((s) => s.published !== false),
        certifications: certificationsRes.data || [],
        customSections: customSectionsRes.data || [],
        sections: sectionConfig,
        sectionOrder: sectionOrderConfig,
        workspaceId: workspace.workspace_id,
      });
    } catch (error) {
      console.error('Error fetching preview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const ThemeComponent = getThemeComponent(selectedTheme);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-border flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-lg font-semibold">Portfolio Preview</DialogTitle>
          
          {/* Viewport Switcher */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {(Object.keys(viewportSizes) as ViewportSize[]).map((size) => (
              <Button
                key={size}
                variant="ghost"
                size="sm"
                onClick={() => setViewport(size)}
                className={cn(
                  "h-8 px-3 gap-1.5",
                  viewport === size && "bg-background shadow-sm"
                )}
              >
                {viewportSizes[size].icon}
                <span className="hidden sm:inline text-xs">{viewportSizes[size].label}</span>
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-muted/50 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : !data ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Unable to load preview
            </div>
          ) : (
            <div 
              className="mx-auto bg-background rounded-lg shadow-xl overflow-hidden transition-all duration-300"
              style={{ 
                width: viewportSizes[viewport].width,
                maxWidth: '100%',
                height: 'fit-content',
                minHeight: '100%',
              }}
            >
              <div className="overflow-auto max-h-[calc(90vh-80px)]">
                <ThemeComponent data={data} />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
