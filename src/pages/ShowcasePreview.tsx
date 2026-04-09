import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PageLoader } from '@/components/brand/LogoSpinner';
import { Helmet } from 'react-helmet-async';
import { BRAND } from '@/config/branding';
import { Json } from '@/integrations/supabase/types';
import { PremiumShowcase } from '@/components/showcase/PremiumShowcase';

interface ShowcasePortfolioRaw {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  bio: string | null;
  theme: string;
  location: string | null;
  avatar_url: string | null;
  role_label: string | null;
  projects: Json;
  skills: Json;
  experiences: Json;
}

function parseJsonArray<T>(json: Json, fallback: T[] = []): T[] {
  if (Array.isArray(json)) return json as T[];
  return fallback;
}

export default function ShowcasePreview() {
  const { slug } = useParams<{ slug: string }>();

  const { data: portfolio, isLoading, error } = useQuery({
    queryKey: ['showcase-portfolio', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('showcase_portfolios')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data as ShowcasePortfolioRaw;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return <PageLoader className="bg-[#05070B]" />;
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#05070B] gap-4">
        <h1 className="text-2xl font-bold text-white">Portfolio not found</h1>
        <Button asChild>
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Back to Home</Link>
        </Button>
      </div>
    );
  }

  const projectsData = parseJsonArray<any>(portfolio.projects);
  const skillsData = parseJsonArray<any>(portfolio.skills);
  const experiencesData = parseJsonArray<any>(portfolio.experiences);

  const showcaseData = {
    name: portfolio.title,
    role: portfolio.role_label || 'Professional',
    tagline: portfolio.tagline || '',
    bio: portfolio.bio || '',
    location: portfolio.location || 'Remote',
    avatarUrl: portfolio.avatar_url,
    projects: projectsData.map((p: any) => ({
      title: p.title,
      description: p.description,
      technologies: p.technologies || [],
      imageUrl: p.image_url || '',
      featured: false,
    })),
    skills: skillsData.map((s: any) => ({
      name: s.name,
      category: s.category || 'General',
      proficiency: s.proficiency || 80,
    })),
    experiences: experiencesData.map((e: any) => ({
      position: e.position,
      company: e.company,
      location: e.location || '',
      startDate: '2020-01',
      isCurrent: e.is_current || false,
      bullets: ['Key achievement and impact'],
    })),
    certifications: ['AWS Certified'],
    socialLinks: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      email: 'contact@example.com',
    },
  };

  const pageTitle = `${portfolio.title} - ${portfolio.role_label || 'Professional'} Portfolio`;
  const pageDescription = portfolio.tagline || portfolio.bio || `View ${portfolio.title}'s professional portfolio showcasing projects, skills, and experience.`;
  const pageUrl = `https://makeportfolios.com/showcase/${portfolio.slug}`;
  const ogImage = portfolio.avatar_url || 'https://makeportfolios.com/og-image.png';

  return (
    <>
      <Helmet>
        <title>{pageTitle} | {BRAND.name}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${portfolio.title} portfolio, ${portfolio.role_label || 'professional'} portfolio, portfolio example, ${BRAND.name}`} />
        <link rel="canonical" href={pageUrl} />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="profile" />
        <meta property="og:site_name" content={BRAND.name} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "name": pageTitle,
            "description": pageDescription,
            "url": pageUrl,
            "mainEntity": {
              "@type": "Person",
              "name": portfolio.title,
              "jobTitle": portfolio.role_label || "Professional",
              "description": portfolio.bio || portfolio.tagline,
              "image": portfolio.avatar_url,
              "address": portfolio.location ? { "@type": "PostalAddress", "addressLocality": portfolio.location } : undefined
            }
          })}
        </script>
      </Helmet>

      {/* Floating Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#00FFE1] to-[#00FF88] text-[#05070B] py-3 px-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-sm font-medium hover:opacity-80">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="h-4 w-px bg-black/20" />
            <span className="text-sm font-medium">
              Demo Portfolio • <span className="font-bold">Create yours free!</span>
            </span>
          </div>
          <Button size="sm" className="bg-[#05070B] text-white hover:bg-[#05070B]/90 gap-2" asChild>
            <Link to="/register">Start Building<ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>

      <div className="pt-12">
        <PremiumShowcase data={showcaseData} />
      </div>
    </>
  );
}
