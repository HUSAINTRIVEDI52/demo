import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { PortfolioSkeleton } from '@/components/portfolio/PortfolioSkeleton';
import { MinimalTheme } from '@/components/portfolio-themes/MinimalTheme';
import { ModernTheme } from '@/components/portfolio-themes/ModernTheme';
import { BoldTheme } from '@/components/portfolio-themes/BoldTheme';
import { CyberpunkTheme } from '@/components/portfolio-themes/CyberpunkTheme';
import { CorporateTheme } from '@/components/portfolio-themes/CorporateTheme';
import { NeonCreativeTheme } from '@/components/portfolio-themes/NeonCreativeTheme';
import { EditorialTheme } from '@/components/portfolio-themes/EditorialTheme';
import { WarmSunsetTheme } from '@/components/portfolio-themes/WarmSunsetTheme';
import { DeveloperTheme } from '@/components/portfolio-themes/DeveloperTheme';
import { HackerTheme } from '@/components/portfolio-themes/HackerTheme';
import { CyberRajTheme } from '@/components/portfolio-themes/CyberRajTheme';
import { trackPortfolioView, trackProjectView } from '@/hooks/useEventTracking';
import { getCanonicalUrl, BRAND } from '@/config/branding';
import { PortfolioWatermark } from '@/components/portfolio/PortfolioWatermark';

import type { BackgroundStyle } from '@/hooks/useWorkspace';

export interface PortfolioData {
  id: string;
  title: string;
  tagline: string | null;
  bio: string | null;
  avatar_url: string | null;
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
  theme: string;
  background_style: BackgroundStyle;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_image: string | null;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  full_description: string | null;
  project_type: string | null;
  image_url: string | null;
  gallery_images: string[] | null;
  demo_video_url: string | null;
  project_url: string | null;
  github_url: string | null;
  case_study_url: string | null;
  technologies: string[] | null;
  tools_used: string[] | null;
  category: string | null;
  role: string | null;
  team_size: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  problem_statement: string | null;
  solution_summary: string | null;
  key_achievements: string[] | null;
  metrics: string | null;
  featured: boolean | null;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  employment_type?: string | null;
  location: string | null;
  description: string | null;
  role_summary?: string | null;
  responsibilities?: string[] | null;
  achievements?: string[] | null;
  technologies_used?: string[] | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean | null;
}

export interface Skill {
  id: string;
  name: string;
  category: string | null;
  proficiency: number | null;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  credential_id: string | null;
  credential_url: string | null;
  issue_date: string | null;
  expiry_date: string | null;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string | null;
  display_order: number | null;
}

export interface PortfolioSections {
  show_projects: boolean;
  show_experience: boolean;
  show_skills: boolean;
  show_certifications: boolean;
  show_contact: boolean;
}

export interface SectionOrder {
  hero_order: number;
  about_order: number;
  projects_order: number;
  experience_order: number;
  skills_order: number;
  certifications_order: number;
  custom_sections_order: number;
  contact_order: number;
}

export interface FullPortfolioData {
  portfolio: PortfolioData;
  projects: Project[];
  experiences: Experience[];
  skills: Skill[];
  certifications: Certification[];
  customSections: CustomSection[];
  sections: PortfolioSections;
  sectionOrder: SectionOrder;
  workspaceId: string;
  workspacePlan?: string; // Plan type for watermark logic
  onProjectView?: (projectId: string) => void;
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
  developer: DeveloperTheme,
  hacker: HackerTheme,
  terminal: CyberRajTheme,
};

// Safe theme getter with fallback
const getThemeComponent = (themeId: string | null | undefined) => {
  const safeThemeId = themeId && themeComponents[themeId] ? themeId : DEFAULT_THEME;
  return themeComponents[safeThemeId];
};

export default function PublicPortfolio() {
  const { username } = useParams();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<FullPortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Get source from URL params (src parameter)
  const source = searchParams.get('src');

  useEffect(() => {
    if (username) fetchPortfolio();
  }, [username]);

  const fetchPortfolio = async () => {
    // Fetch portfolio with workspace_id for view tracking
    const { data: portfolioData, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id, workspace_id, title, tagline, bio, avatar_url, hero_image_url, location, contact_email, contact_phone, website_url, linkedin_url, github_url, twitter_url, instagram_url, youtube_url, dribbble_url, behance_url, medium_url, custom_social_label, custom_social_url, theme, background_style, seo_title, seo_description, seo_keywords, og_image')
      .eq('slug', username)
      .eq('published', true)
      .maybeSingle();

    if (portfolioError || !portfolioData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    // Track portfolio view with source (deduped per session)
    trackPortfolioView(portfolioData.id, portfolioData.workspace_id, source);

    // Fetch all related data in parallel (including workspace for plan)
    const [projectsRes, experiencesRes, skillsRes, certificationsRes, customSectionsRes, sectionsRes, workspaceRes] = await Promise.all([
      supabase
        .from('projects')
        .select('id, title, description, short_description, full_description, project_type, image_url, gallery_images, demo_video_url, project_url, github_url, case_study_url, technologies, tools_used, category, role, team_size, start_date, end_date, status, problem_statement, solution_summary, key_achievements, metrics, featured')
        .eq('portfolio_id', portfolioData.id)
        .eq('published', true)
        .order('display_order', { ascending: true }),
      supabase
        .from('experiences')
        .select('id, company, position, employment_type, location, description, role_summary, responsibilities, achievements, technologies_used, start_date, end_date, is_current')
        .eq('portfolio_id', portfolioData.id)
        .eq('published', true)
        .order('display_order', { ascending: true }),
      supabase
        .from('skills')
        .select('id, name, category, proficiency')
        .eq('portfolio_id', portfolioData.id)
        .eq('published', true)
        .order('display_order', { ascending: true }),
      supabase
        .from('certifications')
        .select('id, name, issuer, credential_id, credential_url, issue_date, expiry_date')
        .eq('portfolio_id', portfolioData.id)
        .order('display_order', { ascending: true }),
      supabase
        .from('custom_sections')
        .select('id, title, content, display_order')
        .eq('portfolio_id', portfolioData.id)
        .eq('visibility', true)
        .order('display_order', { ascending: true }),
      supabase
        .from('portfolio_sections')
        .select('show_projects, show_experience, show_skills, show_certifications, show_contact, hero_order, about_order, projects_order, experience_order, skills_order, certifications_order, custom_sections_order, contact_order')
        .eq('portfolio_id', portfolioData.id)
        .maybeSingle(),
      supabase
        .from('workspaces')
        .select('plan')
        .eq('id', portfolioData.workspace_id)
        .maybeSingle(),
    ]);

    // Default sections to hidden if not explicitly set - prevents content leak
    const defaultSections: PortfolioSections = {
      show_projects: false,
      show_experience: false,
      show_skills: false,
      show_certifications: false,
      show_contact: false,
    };

    const defaultSectionOrder: SectionOrder = {
      hero_order: 0,
      about_order: 1,
      projects_order: 2,
      experience_order: 3,
      skills_order: 4,
      certifications_order: 5,
      custom_sections_order: 6,
      contact_order: 7,
    };

    // Use type assertion since we're selecting all fields we need
    const p = portfolioData as any;
    
    setData({
      portfolio: {
        id: p.id,
        title: p.title,
        tagline: p.tagline,
        bio: p.bio,
        avatar_url: p.avatar_url,
        hero_image_url: p.hero_image_url,
        location: p.location,
        contact_email: p.contact_email || null,
        contact_phone: p.contact_phone || null,
        website_url: p.website_url,
        linkedin_url: p.linkedin_url,
        github_url: p.github_url,
        twitter_url: p.twitter_url,
        instagram_url: p.instagram_url || null,
        youtube_url: p.youtube_url || null,
        dribbble_url: p.dribbble_url || null,
        behance_url: p.behance_url || null,
        medium_url: p.medium_url || null,
        custom_social_label: p.custom_social_label || null,
        custom_social_url: p.custom_social_url || null,
        theme: p.theme,
        background_style: (p.background_style as BackgroundStyle) || 'animated',
        seo_title: p.seo_title,
        seo_description: p.seo_description,
        seo_keywords: p.seo_keywords,
        og_image: p.og_image,
      },
      projects: projectsRes.data || [],
      experiences: experiencesRes.data || [],
      skills: skillsRes.data || [],
      certifications: certificationsRes.data || [],
      customSections: customSectionsRes.data || [],
      sections: sectionsRes.data 
        ? {
            show_projects: sectionsRes.data.show_projects ?? false,
            show_experience: sectionsRes.data.show_experience ?? false,
            show_skills: sectionsRes.data.show_skills ?? false,
            show_certifications: sectionsRes.data.show_certifications ?? false,
            show_contact: sectionsRes.data.show_contact ?? false,
          }
        : defaultSections,
      sectionOrder: sectionsRes.data
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
        : defaultSectionOrder,
      workspaceId: portfolioData.workspace_id,
      workspacePlan: workspaceRes.data?.plan || 'free',
      onProjectView: (projectId: string) => trackProjectView(projectId, portfolioData.workspace_id),
    });
    setLoading(false);
  };

  if (loading) {
    return <PortfolioSkeleton variant="minimal" />;
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold mb-2">404</h1>
          <p className="text-muted-foreground">Portfolio not found or not published</p>
        </div>
      </div>
    );
  }

  const ThemeComponent = getThemeComponent(data.portfolio.theme);

  // SEO values with safe fallbacks for SSR and missing data
  const seoTitle = data.portfolio.seo_title || data.portfolio.title || 'Portfolio';
  const seoDescription = data.portfolio.seo_description || data.portfolio.tagline || data.portfolio.bio || 'Professional portfolio';
  
  // Validate OG image URL - only use if it's a valid absolute URL
  const validateImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol) ? url : null;
    } catch {
      return null;
    }
  };
  
  const ogImage = validateImageUrl(data.portfolio.og_image) 
    || validateImageUrl(data.portfolio.hero_image_url) 
    || validateImageUrl(data.portfolio.avatar_url);
  
  const seoKeywords = data.portfolio.seo_keywords;
  
  // Use centralized branding for canonical URL
  const canonicalUrl = getCanonicalUrl(`/${username}`);

  // Build skills list for structured data
  const skillsList = data.skills.map(s => s.name).join(', ');

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        {seoKeywords && <meta name="keywords" content={seoKeywords} />}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:site_name" content={BRAND.name} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        {ogImage && <meta property="og:image" content={ogImage} />}
        {ogImage && <meta property="og:image:alt" content={`${data.portfolio.title}'s portfolio`} />}
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        
        {/* JSON-LD Structured Data for Person/ProfilePage */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "name": seoTitle,
            "description": seoDescription,
            "url": canonicalUrl,
            "mainEntity": {
              "@type": "Person",
              "name": data.portfolio.title,
              "description": data.portfolio.bio || data.portfolio.tagline,
              "image": ogImage || undefined,
              "jobTitle": data.experiences[0]?.position || undefined,
              "worksFor": data.experiences[0]?.company ? {
                "@type": "Organization",
                "name": data.experiences[0].company
              } : undefined,
              "address": data.portfolio.location ? {
                "@type": "PostalAddress",
                "addressLocality": data.portfolio.location
              } : undefined,
              "knowsAbout": skillsList || undefined,
              "sameAs": [
                data.portfolio.linkedin_url,
                data.portfolio.github_url,
                data.portfolio.twitter_url,
                data.portfolio.website_url,
              ].filter(Boolean),
              "url": canonicalUrl
            }
          })}
        </script>
      </Helmet>

      <ThemeComponent data={data} />
      
      {/* Watermark for free plan users - cannot be removed */}
      {data.workspacePlan === 'free' && <PortfolioWatermark />}
    </>
  );
}
