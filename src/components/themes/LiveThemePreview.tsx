import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Maximize2, 
  X, 
  Eye,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { LogoSpinner } from '@/components/brand/LogoSpinner';
import { cn } from '@/lib/utils';
import { useWorkspace } from '@/hooks/useWorkspace';
import { supabase } from '@/integrations/supabase/client';
import { CinematicModeProvider } from '@/components/showcase/effects/CinematicModeContext';
import { LazyThemeRenderer, themeNames } from './LazyThemeComponents';
import type { FullPortfolioData, PortfolioSections, SectionOrder } from '@/pages/PublicPortfolio';

const DEFAULT_THEME = 'minimal';

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const viewportConfig: Record<ViewportSize, { width: number; icon: React.ReactNode; label: string }> = {
  desktop: { width: 1200, icon: <Monitor className="h-4 w-4" />, label: 'Desktop' },
  tablet: { width: 768, icon: <Tablet className="h-4 w-4" />, label: 'Tablet' },
  mobile: { width: 375, icon: <Smartphone className="h-4 w-4" />, label: 'Mobile' },
};

interface LiveThemePreviewProps {
  previewTheme?: string;
  className?: string;
}

export function LiveThemePreview({ previewTheme, className }: LiveThemePreviewProps) {
  const { portfolio, workspace, sections, loading: workspaceLoading } = useWorkspace();
  const [data, setData] = useState<FullPortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentTheme = previewTheme || portfolio?.theme || DEFAULT_THEME;

  // Refresh preview when portfolio settings change (including background_style)
  useEffect(() => {
    if (portfolio?.id && !workspaceLoading) {
      fetchPreviewData();
    }
  }, [portfolio?.id, portfolio?.background_style, portfolio?.theme, workspaceLoading]);

  const fetchPreviewData = async () => {
    if (!portfolio) return;
    setLoading(true);

    try {
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

      const publishedProjects = (projectsRes.data || []).filter((p) => p.published !== false);
      const publishedExperiences = (experiencesRes.data || []).filter((e) => e.published !== false);
      const publishedSkills = (skillsRes.data || []).filter((s) => s.published !== false);

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
        workspacePlan: workspace?.plan || 'free',
      });
    } catch (error) {
      console.error('Error fetching preview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPreviewData();
    setIsRefreshing(false);
  };

  // Calculate scale based on container and viewport
  const containerWidth = viewport === 'desktop' ? 800 : viewport === 'tablet' ? 500 : 320;
  const scale = containerWidth / viewportConfig[viewport].width;

  if (workspaceLoading || loading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-48" />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex items-center justify-center h-[400px]">
          <LogoSpinner size="lg" showText />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="py-12 text-center">
          <Eye className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No portfolio data available for preview</p>
        </CardContent>
      </Card>
    );
  }

  // Update data with preview theme
  const previewData: FullPortfolioData = {
    ...data,
    portfolio: { ...data.portfolio, theme: currentTheme },
  };

  return (
    <>
      <Card className={cn("overflow-hidden bg-card/50 backdrop-blur-sm border-border/50", className)}>
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
                <Eye className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  Live Preview
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {themeNames[currentTheme] || currentTheme}
                  </Badge>
                </h3>
                <p className="text-xs text-muted-foreground">Real-time preview with your content</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Viewport Switcher */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                {(Object.keys(viewportConfig) as ViewportSize[]).map((size) => (
                  <Button
                    key={size}
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewport(size)}
                    className={cn(
                      "h-7 w-7 p-0",
                      viewport === size && "bg-background shadow-sm"
                    )}
                    title={viewportConfig[size].label}
                  >
                    {viewportConfig[size].icon}
                  </Button>
                ))}
              </div>

              {/* Actions */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-7 w-7 p-0"
                title="Refresh preview"
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(true)}
                className="h-7 w-7 p-0"
                title="Fullscreen preview"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div 
            className="relative mx-auto overflow-hidden rounded-lg border border-border/50 bg-background shadow-2xl"
            style={{ 
              width: containerWidth,
              height: viewport === 'mobile' ? 500 : 400,
            }}
          >
            {/* Browser chrome mockup */}
            <div className="h-6 bg-muted/50 border-b border-border/50 flex items-center gap-1.5 px-2">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-4">
                <div className="h-3.5 bg-muted rounded-full max-w-[200px] mx-auto" />
              </div>
            </div>
            
            {/* Preview container with scaling */}
            <div 
              className="origin-top-left overflow-hidden"
              style={{
                width: viewportConfig[viewport].width,
                height: (viewport === 'mobile' ? 500 : 400 - 24) / scale,
                transform: `scale(${scale})`,
              }}
            >
              <div className="h-full overflow-y-auto overflow-x-hidden">
                <CinematicModeProvider>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentTheme}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LazyThemeRenderer themeId={currentTheme} data={previewData} />
                    </motion.div>
                  </AnimatePresence>
                </CinematicModeProvider>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-3">
            Scroll inside the preview to see your full portfolio • Effects are active
          </p>
        </CardContent>
      </Card>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
          >
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                <Sparkles className="h-3 w-3 mr-1" />
                {themeNames[currentTheme] || currentTheme}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(false)}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>
            
            <div className="h-full overflow-y-auto">
              <CinematicModeProvider>
                <LazyThemeRenderer themeId={currentTheme} data={previewData} />
              </CinematicModeProvider>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
