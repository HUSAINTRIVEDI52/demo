import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Zap,
  Eye,
  Share2,
  Sparkles,
  Check,
  ChevronRight,
  ExternalLink,
  Crown,
  Infinity as InfinityIcon,
  Palette,
  Search,
  Image,
  Mail,
  X,
  Shield,
  Clock,
  Star,
} from 'lucide-react';
import { BRAND } from '@/config/branding';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanLimits, PLAN_DEFINITIONS } from '@/hooks/usePlanLimits';
import { UpgradeModal } from '@/components/plan/UpgradeModal';
import { cn } from '@/lib/utils';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/premium/ScrollReveal';
import { PremiumCard } from '@/components/premium/PremiumCard';

interface ShowcasePortfolio {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  theme: string;
  location: string | null;
  avatar_url: string | null;
  role_label: string | null;
}

const outcomes = [
  {
    icon: Eye,
    title: 'Get noticed by recruiters',
    description: 'Stand out in a sea of resumes with a portfolio that shows your real work.',
  },
  {
    icon: Sparkles,
    title: 'Showcase work, not words',
    description: 'Let your projects speak louder than bullet points ever could.',
  },
  {
    icon: Share2,
    title: 'One link that says it all',
    description: 'Share a professional portfolio link that actually represents you.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Add your details',
    description: 'Name, bio, and projects — that\'s all you need to start.',
  },
  {
    number: '02',
    title: 'Pick a theme',
    description: 'Choose from stunning themes designed to make you shine.',
  },
  {
    number: '03',
    title: 'Publish & share',
    description: 'Go live instantly with your own portfolio link.',
  },
];

const roles = [
  'Developers',
  'Designers', 
  'Product Managers',
  'Data Scientists',
  'Students',
  'Freelancers',
];

const themeAccents: Record<string, string> = {
  modern: 'from-blue-500/20 to-violet-500/20',
  minimal: 'from-slate-500/20 to-zinc-500/20',
  bold: 'from-violet-500/20 to-pink-500/20',
  cyberpunk: 'from-purple-500/20 to-blue-500/20',
  corporate: 'from-blue-600/20 to-indigo-500/20',
  'neon-creative': 'from-pink-500/20 to-violet-500/20',
  editorial: 'from-indigo-500/20 to-blue-500/20',
  'warm-sunset': 'from-violet-400/20 to-purple-500/20',
};

const featureComparison = [
  {
    category: 'Content',
    features: [
      { name: 'Projects', free: '3', starter: '10', pro: 'Unlimited' },
      { name: 'Skills', free: '10', starter: '30', pro: 'Unlimited' },
      { name: 'Work experiences', free: '3', starter: '10', pro: 'Unlimited' },
      { name: 'Certifications', free: true, starter: true, pro: true },
    ]
  },
  { 
    category: 'Design',
    features: [
      { name: 'Available themes', free: '2', starter: '4', pro: '8' },
      { name: 'Premium themes', free: false, starter: false, pro: true },
      { name: 'Custom hero image', free: true, starter: true, pro: true },
      { name: 'Avatar upload', free: true, starter: true, pro: true },
    ]
  },
  { 
    category: 'SEO & Sharing',
    features: [
      { name: 'SEO title & description', free: true, starter: true, pro: true },
      { name: 'SEO keywords', free: false, starter: true, pro: true },
      { name: 'Custom OG image', free: false, starter: false, pro: true },
      { name: 'Social link previews', free: true, starter: true, pro: true },
    ]
  },
  { 
    category: 'Branding',
    features: [
      { name: 'Watermark removed', free: false, starter: true, pro: true },
      { name: 'Contact form', free: true, starter: true, pro: true },
      { name: 'Message inbox', free: true, starter: true, pro: true },
    ]
  },
  { 
    category: 'Support',
    features: [
      { name: 'Community support', free: true, starter: true, pro: true },
      { name: 'Priority support', free: false, starter: false, pro: true },
    ]
  },
];

const trustBadges = [
  { icon: Shield, label: 'Secure Payments' },
  { icon: Clock, label: '24/7 Uptime' },
  { icon: Star, label: '5-Star Rated' },
];

export default function Landing() {
  const { user } = useAuth();
  const { plan, loading: planLoading } = usePlanLimits();
  const navigate = useNavigate();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const rotatingWords = ['opportunities', 'interviews', 'clients', 'visibility'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const isPaidPlan = plan === 'starter' || plan === 'pro';
  const isProOrHigher = plan === 'pro';

  const handleUpgradeClick = (targetPlan: 'starter' | 'pro') => {
    if (!user) {
      navigate('/register');
      return;
    }
    if (targetPlan === 'starter' && isPaidPlan) {
      navigate('/app/dashboard');
      return;
    }
    if (targetPlan === 'pro' && isProOrHigher) {
      navigate('/app/dashboard');
      return;
    }
    setUpgradeModalOpen(true);
  };

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Perfect for getting started',
      highlights: [
        `Up to ${PLAN_DEFINITIONS.free.limits.maxProjects} projects`,
        `Up to ${PLAN_DEFINITIONS.free.limits.maxSkills} skills`,
        '2 themes available',
        'Basic SEO',
        'Watermark on portfolio',
      ],
      cta: user ? (plan === 'free' ? 'Current Plan' : 'Downgrade') : 'Get Started',
      onClick: () => user ? navigate('/app/dashboard') : navigate('/register'),
      popular: false,
      isCurrent: user && plan === 'free',
      disabled: user && plan === 'free',
      trial: false,
    },
    {
      name: 'Starter',
      price: '₹49',
      period: '/year',
      description: '7-day free trial, then billed yearly',
      highlights: [
        '7-day free trial included',
        `Up to ${PLAN_DEFINITIONS.starter.limits.maxProjects} projects`,
        `Up to ${PLAN_DEFINITIONS.starter.limits.maxSkills} skills`,
        '4 themes available',
        'SEO keywords',
        'No watermark',
      ],
      cta: user 
        ? (plan === 'starter' ? 'Current Plan' : isProOrHigher ? 'Included' : 'Start Free Trial')
        : 'Start Free Trial',
      onClick: () => handleUpgradeClick('starter'),
      popular: false,
      isCurrent: user && plan === 'starter',
      disabled: user && isPaidPlan,
      trial: true,
    },
    {
      name: 'Pro',
      price: '₹99',
      period: '/year',
      description: '7-day free trial, then billed yearly',
      highlights: [
        '7-day free trial included',
        'Unlimited projects',
        'Unlimited skills',
        'All 8 premium themes',
        'Full SEO controls',
        'Custom OG images',
        'Priority support',
      ],
      cta: user 
        ? (isProOrHigher ? 'Current Plan' : 'Start Free Trial')
        : 'Start Free Trial',
      onClick: () => handleUpgradeClick('pro'),
      popular: true,
      isCurrent: user && isProOrHigher,
      disabled: user && isProOrHigher,
      trial: true,
    },
  ];

  const { data: showcasePortfolios, isLoading: isLoadingShowcase } = useQuery({
    queryKey: ['showcase-portfolios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('showcase_portfolios')
        .select('id, slug, title, tagline, theme, location, avatar_url, role_label')
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .limit(3);
      
      if (error) throw error;
      return data as ShowcasePortfolio[];
    },
  });

  return (
    <>
      <Helmet>
        <title>Make Portfolio - Create Professional Portfolios in Minutes | Free Portfolio Builder</title>
        <meta name="description" content="Build stunning professional portfolios in under 5 minutes. Showcase your projects, skills, and experience with beautiful themes. Free to start, no coding required." />
        <meta name="keywords" content="portfolio builder, free portfolio website, professional portfolio, online portfolio creator, developer portfolio, designer portfolio, showcase projects, career portfolio" />
        <link rel="canonical" href="https://makeportfolios.com" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:site_name" content={BRAND.name} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Make Portfolio - Create Professional Portfolios in Minutes" />
        <meta property="og:description" content="Build stunning professional portfolios in under 5 minutes. Showcase your projects and skills with beautiful themes." />
        <meta property="og:url" content="https://makeportfolios.com" />
        <meta property="og:image" content="https://makeportfolios.com/og-image.png" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Make Portfolio - Create Professional Portfolios in Minutes" />
        <meta name="twitter:description" content="Build stunning portfolios in under 5 minutes. Free to start." />
        <meta name="twitter:image" content="https://makeportfolios.com/og-image.png" />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": BRAND.name,
            "description": "Build stunning professional portfolios in under 5 minutes. Showcase your projects, skills, and experience with beautiful themes.",
            "url": "https://makeportfolios.com",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR"
            }
          })}
        </script>
      </Helmet>
      <div className="flex flex-col overflow-hidden">
        {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-20 md:py-32">
        {/* Animated Background - Deep dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-violet-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
        
        {/* Floating Orbs - Blue/Violet theme */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]"
          animate={{ 
            scale: [1, 1.2, 1] as number[],
            opacity: [0.15, 0.25, 0.15] as number[],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' } as const}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-[100px]"
          animate={{ 
            scale: [1.2, 1, 1.2] as number[],
            opacity: [0.1, 0.2, 0.1] as number[],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 } as const}
        />
        <motion.div 
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent/15 rounded-full blur-[80px]"
          animate={{ 
            scale: [1, 1.3, 1] as number[],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 } as const}
        />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-8"
            >
              <Zap className="h-4 w-4" />
              <span>Build yours in under 5 minutes</span>
            </motion.div>
            
            {/* Main Headline */}
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Turn your work into
              <span className="block mt-2 h-[1.2em] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentWordIndex}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block bg-gradient-to-r from-violet-400 via-accent to-blue-400 bg-clip-text text-transparent"
                  >
                    {rotatingWords[currentWordIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.h1>
            
            {/* Subheading */}
            <motion.p 
              className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Create a stunning portfolio in minutes and stand out to recruiters, clients, and teams.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg shadow-primary/25 transition-all duration-300 font-semibold"
                  asChild
                >
                  <Link to="/register">
                    Start Building Your Portfolio
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="h-14 px-6 text-lg text-muted-foreground hover:text-foreground gap-2"
                  asChild
                >
                  <a href="#examples">
                    See Examples
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
              </motion.div>
            </motion.div>

            {/* Quick Trust Signal */}
            <motion.div 
              className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-accent" />
                Free to start
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-accent" />
                No credit card required
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-accent" />
                Live in minutes
              </span>
            </motion.div>
          </div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Social Proof Section */}
      <ScrollReveal>
        <section className="py-16 md:py-20 border-y border-border/50 bg-muted/30">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
                Trusted by professionals across tech & creative roles
              </p>
              <StaggerContainer className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                {roles.map((role) => (
                  <StaggerItem key={role}>
                    <motion.span 
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-4 py-2 rounded-full bg-background border border-border/50 text-sm md:text-base font-medium text-foreground/80 hover:border-accent/50 hover:text-accent transition-colors duration-200 cursor-default inline-block"
                    >
                      {role}
                    </motion.span>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Portfolio Showcase Section */}
      <section id="examples" className="py-20 md:py-28 scroll-mt-20">
        <div className="container">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">
                Real Examples
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
                See what you can build
              </h2>
              <p className="text-lg text-muted-foreground">
                Explore live portfolios created with {BRAND.name}. Click to preview.
              </p>
            </div>
          </ScrollReveal>

          {/* Loading Skeletons */}
          {isLoadingShowcase && (
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
                  <div className="h-24 bg-muted" />
                  <div className="relative pt-12 pb-6 px-6">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                      <div className="h-24 w-24 rounded-full bg-muted border-4 border-card" />
                    </div>
                    <div className="text-center space-y-3">
                      <div className="h-6 bg-muted rounded w-32 mx-auto" />
                      <div className="h-4 bg-muted rounded w-24 mx-auto" />
                      <div className="h-4 bg-muted rounded w-48 mx-auto" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Loaded Content */}
          {!isLoadingShowcase && showcasePortfolios && showcasePortfolios.length > 0 && (
            <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {showcasePortfolios.map((portfolio) => (
                <StaggerItem key={portfolio.id}>
                  <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
                    <PremiumCard 
                      className="h-full" 
                      enableTilt={true}
                      enableGlow={true}
                    >
                      <Link
                        to={`/preview/${portfolio.slug}`}
                        className="group block"
                      >
                        {/* Card Header with gradient based on theme */}
                        <div className={`h-24 bg-gradient-to-br ${themeAccents[portfolio.theme] || 'from-accent/20 to-primary/20'} relative`}>
                          <div className="absolute inset-0 bg-hero-pattern opacity-20" />
                          <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-medium text-muted-foreground capitalize">
                            {portfolio.theme}
                          </div>
                        </div>
                        
                        {/* Avatar */}
                        <div className="absolute top-12 left-1/2 -translate-x-1/2">
                          <div className="h-24 w-24 rounded-full border-4 border-card overflow-hidden bg-muted">
                            {portfolio.avatar_url ? (
                              <img 
                                src={portfolio.avatar_url.includes('unsplash.com') 
                                  ? portfolio.avatar_url.replace(/w=\d+/, 'w=200').replace(/h=\d+/, 'h=200')
                                  : portfolio.avatar_url
                                } 
                                alt={`${portfolio.title}'s profile photo`}
                                className="h-full w-full object-cover"
                                loading="lazy"
                                width="96"
                                height="96"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                                {portfolio.title.charAt(0)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="pt-16 pb-6 px-6 text-center">
                          <h3 className="text-xl font-semibold mb-1 group-hover:text-accent transition-colors">
                            {portfolio.title}
                          </h3>
                          {portfolio.role_label && (
                            <p className="text-sm font-medium text-accent mb-2">
                              {portfolio.role_label}
                            </p>
                          )}
                          {portfolio.tagline && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                              {portfolio.tagline}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-center gap-2 text-sm font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Preview Portfolio</span>
                            <ExternalLink className="h-4 w-4" />
                          </div>
                        </div>
                      </Link>
                    </PremiumCard>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

          {/* Empty State - only show after loading completes with no data */}
          {!isLoadingShowcase && (!showcasePortfolios || showcasePortfolios.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No examples available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Outcomes Section */}
      <ScrollReveal>
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container">
            <ScrollReveal>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
                  More than a resume.
                  <span className="block text-muted-foreground">A career homepage.</span>
                </h2>
              </div>
            </ScrollReveal>

            <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {outcomes.map((outcome) => (
                <StaggerItem key={outcome.title}>
                  <PremiumCard 
                    className="p-8 h-full" 
                    variant="glass"
                    enableGlow={true}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6"
                    >
                      <outcome.icon className="h-7 w-7 text-accent" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-3">{outcome.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{outcome.description}</p>
                  </PremiumCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </ScrollReveal>

      {/* How It Works Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">
                Simple & Fast
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold">
                Live in 3 steps
              </h2>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <StaggerItem key={step.number}>
                <div className="relative text-center md:text-left">
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-gradient-to-r from-accent/50 to-transparent" />
                  )}
                  
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-accent text-accent-foreground text-2xl font-bold mb-6 shadow-lg shadow-accent/25"
                  >
                    {step.number}
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <ScrollReveal delay={0.4}>
            <div className="text-center mt-16">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  className="h-12 px-8 bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                  asChild
                >
                  <Link to="/register">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-28 bg-muted/30 scroll-mt-20">
        <div className="container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Simple, transparent pricing</span>
              </motion.div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-4">
                Choose the right plan for{' '}
                <span className="text-primary">your portfolio</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Start free and upgrade when you need more. No hidden fees, no surprises.
              </p>
            </div>
          </ScrollReveal>

          {/* Pricing Cards */}
          <StaggerContainer className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-20 pt-6">
            {plans.map((planItem, index) => (
              <StaggerItem key={planItem.name}>
                <PremiumCard
                  className={cn(
                    'p-6 lg:p-8 flex flex-col h-full overflow-visible',
                    planItem.popular && 'md:scale-105 z-10'
                  )}
                  variant={planItem.popular ? 'solid' : 'glass'}
                  enableTilt={true}
                  enableGlow={true}
                >
                  <div className={cn(
                    'relative',
                    planItem.popular && 'bg-primary text-primary-foreground -m-6 lg:-m-8 p-6 lg:p-8 rounded-2xl'
                  )}>
                    {planItem.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <motion.div 
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-semibold shadow-lg"
                          animate={{ y: [0, -3, 0] as number[] }}
                          transition={{ duration: 2, repeat: Infinity } as const}
                        >
                          <Crown className="h-4 w-4" />
                          Most Popular
                        </motion.div>
                      </div>
                    )}

                    {planItem.isCurrent && (
                      <div className="absolute -top-3 right-4">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                          <Check className="h-3 w-3" />
                          Your Plan
                        </div>
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-2">{planItem.name}</h3>
                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-4xl lg:text-5xl font-display font-bold">{planItem.price}</span>
                        {planItem.period && (
                          <span className={cn(
                            'text-sm',
                            planItem.popular ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          )}>
                            {planItem.period}
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        'text-sm',
                        planItem.popular ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      )}>
                        {planItem.description}
                      </p>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {planItem.highlights.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm">
                          <div className={cn(
                            'h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                            planItem.popular ? 'bg-accent/20' : 'bg-primary/10'
                          )}>
                            <Check className={cn(
                              'h-3 w-3',
                              planItem.popular ? 'text-accent' : 'text-primary'
                            )} />
                          </div>
                          <span className={planItem.popular ? 'text-primary-foreground/90' : ''}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size="lg"
                        className={cn(
                          'w-full group',
                          planItem.popular
                            ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
                            : ''
                        )}
                        variant={planItem.popular ? 'default' : 'outline'}
                        onClick={planItem.onClick}
                        disabled={planItem.disabled}
                      >
                        {planItem.cta}
                        {!planItem.isCurrent && !planItem.disabled && (
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </PremiumCard>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Trust Badges */}
          <ScrollReveal>
            <div className="flex flex-wrap items-center justify-center gap-6 mb-20">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <badge.icon className="h-4 w-4 text-accent" />
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Feature Comparison Table */}
          <ScrollReveal>
            <div className="max-w-4xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
                  Compare plans in detail
                </h3>
                <p className="text-muted-foreground">
                  See exactly what's included in each plan
                </p>
              </div>

              <div className="hidden md:grid grid-cols-4 gap-4 pb-4 border-b border-border mb-4">
                <div className="text-sm font-medium text-muted-foreground">Feature</div>
                <div className="text-center">
                  <span className="text-sm font-semibold">Free</span>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500">
                    <Zap className="h-3.5 w-3.5" />
                    <span className="text-sm font-semibold">Starter</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary">
                    <Crown className="h-3.5 w-3.5" />
                    <span className="text-sm font-semibold">Pro</span>
                  </div>
                </div>
              </div>

              {featureComparison.map((category, catIndex) => (
                <ScrollReveal key={category.category} delay={catIndex * 0.1}>
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                      {category.category}
                    </h4>
                    <div className="space-y-2">
                      {category.features.map((feature) => (
                        <motion.div 
                          key={feature.name}
                          whileHover={{ x: 4 }}
                          className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 py-3 px-4 rounded-lg bg-card border border-border/50 hover:border-accent/30 transition-colors"
                        >
                          <div className="flex items-center gap-2 text-sm font-medium">
                            {feature.name}
                          </div>
                          
                          {/* Mobile view */}
                          <div className="flex md:hidden justify-between text-sm">
                            <span className="text-muted-foreground">Free:</span>
                            <span>
                              {typeof feature.free === 'boolean' ? (
                                feature.free ? (
                                  <Check className="h-4 w-4 text-primary" />
                                ) : (
                                  <X className="h-4 w-4 text-muted-foreground/50" />
                                )
                              ) : (
                                feature.free
                              )}
                            </span>
                          </div>
                          <div className="flex md:hidden justify-between text-sm">
                            <span className="text-muted-foreground">Starter:</span>
                            <span className="text-blue-500 font-medium">
                              {typeof feature.starter === 'boolean' ? (
                                feature.starter ? (
                                  <Check className="h-4 w-4 text-blue-500" />
                                ) : (
                                  <X className="h-4 w-4 text-muted-foreground/50" />
                                )
                              ) : (
                                feature.starter
                              )}
                            </span>
                          </div>
                          <div className="flex md:hidden justify-between text-sm">
                            <span className="text-muted-foreground">Pro:</span>
                            <span className="text-primary font-medium">
                              {typeof feature.pro === 'boolean' ? (
                                feature.pro ? (
                                  <Check className="h-4 w-4 text-primary" />
                                ) : (
                                  <X className="h-4 w-4 text-muted-foreground/50" />
                                )
                              ) : (
                                <span className="flex items-center gap-1">
                                  {feature.pro === 'Unlimited' && <InfinityIcon className="h-3.5 w-3.5" />}
                                  {feature.pro}
                                </span>
                              )}
                            </span>
                          </div>

                          {/* Desktop view */}
                          <div className="hidden md:flex justify-center items-center text-sm">
                            {typeof feature.free === 'boolean' ? (
                              feature.free ? (
                                <Check className="h-5 w-5 text-primary" />
                              ) : (
                                <X className="h-5 w-5 text-muted-foreground/40" />
                              )
                            ) : (
                              <span className="text-muted-foreground">{feature.free}</span>
                            )}
                          </div>
                          <div className="hidden md:flex justify-center items-center text-sm">
                            {typeof feature.starter === 'boolean' ? (
                              feature.starter ? (
                                <Check className="h-5 w-5 text-blue-500" />
                              ) : (
                                <X className="h-5 w-5 text-muted-foreground/40" />
                              )
                            ) : (
                              <span className="text-blue-500 font-medium">{feature.starter}</span>
                            )}
                          </div>
                          <div className="hidden md:flex justify-center items-center text-sm">
                            {typeof feature.pro === 'boolean' ? (
                              feature.pro ? (
                                <Check className="h-5 w-5 text-primary" />
                              ) : (
                                <X className="h-5 w-5 text-muted-foreground/40" />
                              )
                            ) : (
                              <span className="text-primary font-medium flex items-center gap-1">
                                {feature.pro === 'Unlimited' && <InfinityIcon className="h-4 w-4" />}
                                {feature.pro}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              ))}

              <ScrollReveal delay={0.3}>
                <div className="mt-12 text-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      size="lg" 
                      className="gap-2" 
                      onClick={() => handleUpgradeClick('pro')}
                      disabled={user && isProOrHigher}
                    >
                      <Crown className="h-4 w-4" />
                      {user 
                        ? (isProOrHigher ? 'You\'re on Pro!' : 'Upgrade to Pro')
                        : 'Get Started Free'
                      }
                    </Button>
                  </motion.div>
                </div>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Frequently asked questions
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know about our pricing
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="max-w-3xl mx-auto grid gap-4">
            {[
              {
                q: 'How does the free trial work?',
                a: 'Both Starter (₹49/yr) and Pro (₹99/yr) plans come with a 7-day free trial. Try all premium features free, and your card will only be charged after the trial ends. Cancel anytime before the trial ends to avoid charges.',
              },
              {
                q: 'How does the billing work?',
                a: 'After your 7-day free trial, your plan auto-renews yearly. Starter is ₹49/year and Pro is ₹99/year. You\'ll get full access to all plan features for the entire year.',
              },
              {
                q: 'What happens to my content if I cancel?',
                a: 'Your content is yours forever. If your subscription expires, you\'ll be moved to the Free plan but your existing content remains intact.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, debit cards, UPI, and net banking through our secure Razorpay integration.',
              },
              {
                q: 'Can I cancel my subscription?',
                a: 'Yes, you can cancel anytime. During the trial, cancel before it ends to avoid charges. After that, you keep access until the current billing period ends.',
              },
              {
                q: 'Is my payment secure?',
                a: 'Absolutely! All payments are processed through Razorpay, a PCI-DSS compliant payment gateway. We never store your card details.',
              },
            ].map((faq) => (
              <StaggerItem key={faq.q}>
                <PremiumCard className="p-6" variant="outline" enableGlow={true}>
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                </PremiumCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />
        <motion.div 
          className="absolute -top-24 -right-24 w-96 h-96 bg-accent/30 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.2, 1] as number[], opacity: [0.3, 0.5, 0.3] as number[] }}
          transition={{ duration: 4, repeat: Infinity } as const}
        />
        <motion.div 
          className="absolute -bottom-24 -left-24 w-80 h-80 bg-accent/20 rounded-full blur-[100px]"
          animate={{ scale: [1.2, 1, 1.2] as number[], opacity: [0.2, 0.4, 0.2] as number[] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 } as const}
        />
        
        <div className="container relative z-10">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <motion.h2 
                className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Your portfolio should work
                <span className="block">as hard as you do.</span>
              </motion.h2>
              <motion.p 
                className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Start free. Upgrade when you're ready.
                <br />
                No excuses — just your best work, finally visible.
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg" 
                  className="h-14 px-10 text-lg bg-background hover:bg-background/90 text-foreground gap-2 shadow-xl shadow-black/20 transition-transform duration-300 font-semibold"
                  asChild
                >
                  <Link to="/register">
                    Create My Portfolio
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              
              <p className="mt-8 text-sm text-primary-foreground/60">
                Join thousands of professionals showcasing their work with {BRAND.name}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 border-t border-border/50 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Developer Credit */}
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground mb-4">
                Developed with ❤️ by{' '}
                <span className="font-medium text-foreground">
                  Husain Trivedi
                </span>
              </p>
              
              {/* Contact Links */}
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                
                {/* Email */}
                <a
                  href="mailto:makeportfolios@gmail.com"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  makeportfolios@gmail.com
                </a>
                
                {/* WhatsApp */}
                <a
                  href="https://wa.me/918156005352"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
            
            {/* Divider */}
            <div className="border-t border-border/50 pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                  © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                  <Link 
                    to="/about" 
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About & Contact
                  </Link>
                  <Link 
                    to="/refund-policy" 
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Refund Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <UpgradeModal 
        open={upgradeModalOpen} 
        onOpenChange={setUpgradeModalOpen}
        trigger="general"
      />
      </div>
    </>
  );
}
