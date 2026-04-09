import { Mail, MapPin, Globe, Linkedin, Github, Twitter, ExternalLink, Phone, Instagram, Youtube, Dribbble, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContactForm } from './ContactForm';
import type { PortfolioData } from '@/pages/PublicPortfolio';

// Behance icon component
const BehanceIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 1.898 1.459 2.584 2.85 2.584 1.037 0 1.879-.388 2.345-1.055h2.561zm-7.677-4.166h4.91c-.056-1.291-.661-2.164-2.404-2.164-1.63 0-2.344.921-2.506 2.164zM4.5 15.5h-.061V8.5H.5V19h4.061c2.865 0 4.939-1.016 4.939-3.625 0-1.875-1.25-2.875-4-2.875zm-1 5H3V14h.5c1.812 0 2.5.563 2.5 1.875 0 1.5-.938 1.625-2.5 1.625zm1-7h-.5V11h.5c1.25 0 2-.25 2-1.5S5.75 8 4.5 8H3v3.5h.5c1.25 0 2 .25 2 1.5s-.75 1.5-2 1.5z"/>
  </svg>
);

// Medium icon component
const MediumIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
  </svg>
);

interface ContactSectionProps {
  portfolio: PortfolioData;
  variant?: 'minimal' | 'modern' | 'bold' | 'cyberpunk' | 'corporate' | 'neon' | 'editorial' | 'warm';
}

export function ContactSection({ portfolio, variant = 'minimal' }: ContactSectionProps) {
  const hasSocialLinks = portfolio.linkedin_url || portfolio.github_url || portfolio.twitter_url || portfolio.website_url || portfolio.instagram_url || portfolio.youtube_url || portfolio.dribbble_url || portfolio.behance_url || portfolio.medium_url || portfolio.custom_social_url;
  
  // Theme-specific styles
  const themeStyles = {
    minimal: {
      container: 'bg-muted/30',
      accent: 'text-accent',
      formVariant: 'light' as const,
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      linkHover: 'hover:text-accent',
    },
    modern: {
      container: 'bg-gradient-to-br from-accent/5 to-accent/10',
      accent: 'text-accent',
      formVariant: 'light' as const,
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      linkHover: 'hover:text-accent',
    },
    bold: {
      container: 'bg-accent/10',
      accent: 'text-accent',
      formVariant: 'light' as const,
      iconBg: 'bg-accent/20',
      iconColor: 'text-accent',
      linkHover: 'hover:text-accent',
    },
    cyberpunk: {
      container: 'bg-black/50 border border-[hsl(var(--cyberpunk-accent,142_76%_56%)/0.3)]',
      accent: 'text-[hsl(var(--cyberpunk-accent,142_76%_56%))]',
      formVariant: 'dark' as const,
      iconBg: 'bg-[hsl(var(--cyberpunk-accent,142_76%_56%)/0.1)]',
      iconColor: 'text-[hsl(var(--cyberpunk-accent,142_76%_56%))]',
      linkHover: 'hover:text-[hsl(var(--cyberpunk-accent,142_76%_56%))]',
    },
    corporate: {
      container: 'bg-card border border-border',
      accent: 'text-accent',
      formVariant: 'light' as const,
      iconBg: 'bg-accent/5',
      iconColor: 'text-accent',
      linkHover: 'hover:text-accent',
    },
    neon: {
      container: 'bg-black/40 border border-[hsl(var(--neon-primary,300_100%_60%)/0.3)]',
      accent: 'text-[hsl(var(--neon-primary,300_100%_60%))]',
      formVariant: 'dark' as const,
      iconBg: 'bg-[hsl(var(--neon-primary,300_100%_60%)/0.1)]',
      iconColor: 'text-[hsl(var(--neon-primary,300_100%_60%))]',
      linkHover: 'hover:text-[hsl(var(--neon-primary,300_100%_60%))]',
    },
    editorial: {
      container: 'bg-muted/20 border-t border-b border-border',
      accent: 'text-foreground',
      formVariant: 'light' as const,
      iconBg: 'bg-muted',
      iconColor: 'text-foreground',
      linkHover: 'hover:text-foreground/70',
    },
    warm: {
      container: 'bg-accent/5',
      accent: 'text-accent',
      formVariant: 'light' as const,
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      linkHover: 'hover:text-accent',
    },
  };

  const styles = themeStyles[variant] || themeStyles.minimal;
  const isDark = styles.formVariant === 'dark';

  const socialLinks = [
    { url: portfolio.linkedin_url, icon: Linkedin, label: 'LinkedIn' },
    { url: portfolio.github_url, icon: Github, label: 'GitHub' },
    { url: portfolio.twitter_url, icon: Twitter, label: 'Twitter' },
    { url: portfolio.website_url, icon: Globe, label: 'Website' },
  ].filter(link => link.url);

  return (
    <div className={`rounded-2xl p-6 md:p-10 ${styles.container}`}>
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Left side - Info & Links */}
          <div className="space-y-6">
            <div>
              <h3 className={`text-2xl md:text-3xl font-display font-bold mb-3 ${styles.accent}`}>
                Get in Touch
              </h3>
              <p className={isDark ? 'text-white/70' : 'text-muted-foreground'}>
                Have a project in mind or just want to chat? I'd love to hear from you. 
                Fill out the form and I'll get back to you as soon as possible.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              {portfolio.location && (
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
                    <MapPin className={`h-5 w-5 ${styles.iconColor}`} />
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-white/50' : 'text-muted-foreground'}`}>Location</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-foreground'}`}>{portfolio.location}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Social Links */}
            {hasSocialLinks && (
              <div>
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-white/70' : 'text-muted-foreground'}`}>
                  Connect with me
                </p>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((link) => (
                    <Button
                      key={link.label}
                      variant={isDark ? 'outline' : 'secondary'}
                      size="sm"
                      asChild
                      className={isDark ? 'border-white/20 hover:bg-white/10' : ''}
                    >
                      <a href={link.url!} target="_blank" rel="noopener noreferrer">
                        <link.icon className="h-4 w-4 mr-2" />
                        {link.label}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Availability badge - optional enhancement */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${styles.iconBg}`}>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className={isDark ? 'text-white/80' : 'text-foreground'}>
                Available for new opportunities
              </span>
            </div>
          </div>

          {/* Right side - Contact Form */}
          <div className={`${isDark ? 'bg-white/5' : 'bg-background'} rounded-xl p-6 shadow-sm`}>
            <ContactForm
              portfolioId={portfolio.id}
              portfolioTitle={portfolio.title}
              variant={styles.formVariant}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
