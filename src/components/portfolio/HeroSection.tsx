import { MapPin, Globe, Linkedin, Github, Twitter, ArrowDown, Mail, Phone, Instagram, Youtube, Dribbble, Pen, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { PortfolioData } from '@/pages/PublicPortfolio';

type HeroVariant = 'minimal' | 'modern' | 'bold' | 'cyberpunk' | 'corporate' | 'neon' | 'editorial' | 'warm';

interface HeroSectionProps {
  portfolio: PortfolioData;
  variant?: HeroVariant;
  showProjectsCTA?: boolean;
  showContactCTA?: boolean;
}

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

// Behance icon component (not in lucide)
const BehanceIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 1.898 1.459 2.584 2.85 2.584 1.037 0 1.879-.388 2.345-1.055h2.561zm-7.677-4.166h4.91c-.056-1.291-.661-2.164-2.404-2.164-1.63 0-2.344.921-2.506 2.164zM4.5 15.5h-.061V8.5H.5V19h4.061c2.865 0 4.939-1.016 4.939-3.625 0-1.875-1.25-2.875-4-2.875zm-1 5H3V14h.5c1.812 0 2.5.563 2.5 1.875 0 1.5-.938 1.625-2.5 1.625zm1-7h-.5V11h.5c1.25 0 2-.25 2-1.5S5.75 8 4.5 8H3v3.5h.5c1.25 0 2 .25 2 1.5s-.75 1.5-2 1.5z"/>
  </svg>
);

// Medium icon component (not in lucide)
const MediumIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
  </svg>
);

// Social links component - shared across variants
function SocialLinks({ portfolio, variant }: { portfolio: PortfolioData; variant: HeroVariant }) {
  const links = [
    { url: portfolio.contact_email ? `mailto:${portfolio.contact_email}` : null, icon: Mail, label: 'Email' },
    { url: portfolio.contact_phone ? `tel:${portfolio.contact_phone}` : null, icon: Phone, label: 'Phone' },
    { url: portfolio.website_url, icon: Globe, label: 'Website' },
    { url: portfolio.linkedin_url, icon: Linkedin, label: 'LinkedIn' },
    { url: portfolio.github_url, icon: Github, label: 'GitHub' },
    { url: portfolio.twitter_url, icon: Twitter, label: 'Twitter' },
    { url: portfolio.instagram_url, icon: Instagram, label: 'Instagram' },
    { url: portfolio.youtube_url, icon: Youtube, label: 'YouTube' },
    { url: portfolio.dribbble_url, icon: Dribbble, label: 'Dribbble' },
    { url: portfolio.behance_url, icon: BehanceIcon, label: 'Behance' },
    { url: portfolio.medium_url, icon: MediumIcon, label: 'Medium' },
    { url: portfolio.custom_social_url, icon: Link, label: portfolio.custom_social_label || 'Link' },
  ].filter(l => l.url);

  if (links.length === 0) return null;

  const isDark = ['minimal', 'cyberpunk', 'neon'].includes(variant);
  const baseClass = isDark 
    ? 'text-muted-foreground hover:text-foreground' 
    : 'text-muted-foreground hover:text-foreground';

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {links.map(({ url, icon: Icon, label }) => (
        <a
          key={label}
          href={url!}
          target={url!.startsWith('mailto:') || url!.startsWith('tel:') ? undefined : '_blank'}
          rel={url!.startsWith('mailto:') || url!.startsWith('tel:') ? undefined : 'noopener noreferrer'}
          className={`${baseClass} transition-colors`}
          aria-label={label}
          title={label}
        >
          <Icon className="h-5 w-5" />
        </a>
      ))}
    </div>
  );
}

export function HeroSection({ portfolio, variant = 'minimal', showProjectsCTA = true, showContactCTA = true }: HeroSectionProps) {
  
  // ═══════════════════════════════════════════════════════════════════════════
  // MINIMAL / DARK ELITE - Quiet confidence, maximum clarity
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === 'minimal') {
    return (
      <header className="relative min-h-[80vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
        
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
          {portfolio.avatar_url && (
            <Avatar className="h-28 w-28 mx-auto mb-8 ring-2 ring-border/50">
              <AvatarImage src={portfolio.avatar_url} alt={portfolio.title} />
              <AvatarFallback className="text-3xl font-light">{portfolio.title.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6">
            {portfolio.title}
          </h1>
          
          {portfolio.tagline && (
            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto mb-4">
              {portfolio.tagline}
            </p>
          )}
          
          {portfolio.location && (
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
              <MapPin className="h-4 w-4" /> {portfolio.location}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            {showProjectsCTA && (
              <Button onClick={() => scrollToSection('projects')} size="lg" className="min-w-[160px]">
                View Work
              </Button>
            )}
            {showContactCTA && (
              <Button onClick={() => scrollToSection('contact')} variant="outline" size="lg" className="min-w-[160px]">
                Get in Touch
              </Button>
            )}
          </div>
          
          <SocialLinks portfolio={portfolio} variant={variant} />
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ArrowDown className="h-5 w-5 text-muted-foreground/50 animate-bounce" />
        </div>
      </header>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODERN - Clean, professional, approachable
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === 'modern') {
    return (
      <header className="relative py-20 md:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-[1fr_auto] gap-12 items-center">
            <div>
              <p className="text-sm font-medium text-accent uppercase tracking-wider mb-4">
                {portfolio.location || 'Portfolio'}
              </p>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6">
                {portfolio.title}
              </h1>
              
              {portfolio.tagline && (
                <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
                  {portfolio.tagline}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 mb-8">
                {showProjectsCTA && (
                  <Button onClick={() => scrollToSection('projects')} size="lg">
                    See My Work
                  </Button>
                )}
                {showContactCTA && (
                  <Button onClick={() => scrollToSection('contact')} variant="ghost" size="lg">
                    <Mail className="h-4 w-4 mr-2" /> Contact
                  </Button>
                )}
              </div>
              
              <SocialLinks portfolio={portfolio} variant={variant} />
            </div>
            
            {portfolio.avatar_url && (
              <div className="hidden md:block">
                <Avatar className="h-48 w-48 ring-4 ring-muted">
                  <AvatarImage src={portfolio.avatar_url} alt={portfolio.title} />
                  <AvatarFallback className="text-5xl font-light bg-muted">{portfolio.title.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BOLD - Content-first, authoritative, clear hierarchy
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === 'bold') {
    return (
      <header className="relative min-h-[85vh] flex items-end pb-16 md:pb-24">
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 w-full">
          {/* Avatar - smaller, professional */}
          {portfolio.avatar_url && (
            <Avatar className="h-20 w-20 mb-8 ring-2 ring-border/30">
              <AvatarImage src={portfolio.avatar_url} alt={portfolio.title} className="object-cover" />
              <AvatarFallback className="text-2xl font-bold bg-muted">{portfolio.title.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
          
          {/* Name - Large, authoritative */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-4 leading-[1.1]">
            {portfolio.title}
          </h1>
          
          {/* Tagline - Clear role statement */}
          {portfolio.tagline && (
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-6 max-w-2xl">
              {portfolio.tagline}
            </p>
          )}
          
          {/* Location - Subtle context */}
          {portfolio.location && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground/80 mb-8">
              <MapPin className="h-4 w-4" /> {portfolio.location}
            </p>
          )}
          
          {/* Actions - Clear primary/secondary */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {showProjectsCTA && (
              <Button onClick={() => scrollToSection('projects')} size="lg">
                View My Work
              </Button>
            )}
            {showContactCTA && (
              <Button onClick={() => scrollToSection('contact')} variant="ghost" size="lg">
                <Mail className="h-4 w-4 mr-2" /> Get in Touch
              </Button>
            )}
          </div>
          
          {/* Social - Secondary importance */}
          <SocialLinks portfolio={portfolio} variant={variant} />
        </div>
      </header>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CYBERPUNK - Technical, focused, distinctive with terminal aesthetic
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === 'cyberpunk') {
    return (
      <header className="relative min-h-[90vh] flex items-center border-b border-[#00FFE1]/20 overflow-hidden">
        {/* Background with animated grid */}
        <div className="absolute inset-0 bg-[#05070B]">
          <div 
            className="absolute inset-0 opacity-[0.04]" 
            style={{
              backgroundImage: `linear-gradient(#00FFE1 1px, transparent 1px), linear-gradient(90deg, #00FFE1 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }} 
          />
          {/* Glowing orb effects */}
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px] bg-[#00FFE1]/10" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full blur-[100px] bg-[#8A2EFF]/10" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 w-full">
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-12 items-center">
            {/* Left content */}
            <div>
              {/* Terminal-style intro */}
              <div className="mb-6 font-mono text-sm">
                <span className="text-[#00FFE1]/60">{'>'}</span>
                <span className="text-[#8A2EFF]"> const</span>
                <span className="text-[#E5FFF9]"> developer</span>
                <span className="text-[#00FFE1]/60"> = {'{'}</span>
              </div>
              
              {/* Name with glow */}
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold text-[#00FFE1] mb-4 leading-tight" 
                style={{ textShadow: '0 0 30px rgba(0, 255, 225, 0.4), 0 0 60px rgba(0, 255, 225, 0.2)' }}
              >
                {portfolio.title}
              </h1>
              
              {portfolio.tagline && (
                <p className="text-lg md:text-xl text-[#E5FFF9]/80 font-mono mb-4 max-w-xl">
                  <span className="text-[#00FF88]">role:</span> "{portfolio.tagline}"
                </p>
              )}
              
              {portfolio.location && (
                <p className="flex items-center gap-2 text-sm font-mono text-[#8A2EFF] mb-6">
                  <MapPin className="h-4 w-4" />
                  <span className="text-[#E5FFF9]/60">location:</span> "{portfolio.location}"
                </p>
              )}
              
              <div className="font-mono text-sm text-[#00FFE1]/60 mb-8">
                {'}'};
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                {showProjectsCTA && (
                  <Button 
                    onClick={() => scrollToSection('projects')}
                    className="bg-[#00FFE1] text-[#05070B] hover:bg-[#00FFE1]/90 font-mono font-semibold px-6 shadow-[0_0_20px_rgba(0,255,225,0.3)]"
                  >
                    ./view-projects
                  </Button>
                )}
                {showContactCTA && (
                  <Button 
                    onClick={() => scrollToSection('contact')}
                    variant="outline"
                    className="border-[#8A2EFF] text-[#8A2EFF] hover:bg-[#8A2EFF]/10 font-mono"
                  >
                    ./contact
                  </Button>
                )}
              </div>
              
              {/* Social links */}
              <div className="flex items-center gap-4">
                {portfolio.github_url && (
                  <a 
                    href={portfolio.github_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-lg border border-[#00FF88]/30 bg-[#00FF88]/5 flex items-center justify-center text-[#00FF88] hover:bg-[#00FF88]/10 hover:border-[#00FF88]/60 transition-all"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {portfolio.linkedin_url && (
                  <a 
                    href={portfolio.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-lg border border-[#8A2EFF]/30 bg-[#8A2EFF]/5 flex items-center justify-center text-[#8A2EFF] hover:bg-[#8A2EFF]/10 hover:border-[#8A2EFF]/60 transition-all"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {portfolio.twitter_url && (
                  <a 
                    href={portfolio.twitter_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-lg border border-[#00FFE1]/30 bg-[#00FFE1]/5 flex items-center justify-center text-[#00FFE1] hover:bg-[#00FFE1]/10 hover:border-[#00FFE1]/60 transition-all"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Right side - Avatar (only shown when available) */}
            {portfolio.avatar_url && (
              <div className="hidden lg:flex justify-center">
                <div className="relative">
                  {/* Glow ring */}
                  <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#00FFE1]/20 via-[#8A2EFF]/20 to-[#00FF88]/20 blur-xl" />
                  <div className="relative w-56 h-56 rounded-full border-2 border-[#00FFE1]/50 overflow-hidden shadow-[0_0_40px_rgba(0,255,225,0.2)]">
                    <img 
                      src={portfolio.avatar_url} 
                      alt={portfolio.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Status indicator */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#0A0F14] border border-[#00FF88]/50 rounded-full font-mono text-xs text-[#00FF88] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                    available
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button 
            onClick={() => scrollToSection('about')}
            className="flex flex-col items-center gap-2 text-[#00FFE1]/50 hover:text-[#00FFE1] transition-colors"
          >
            <span className="text-xs font-mono">scroll</span>
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </button>
        </div>
      </header>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CORPORATE - Executive, polished, trustworthy
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === 'corporate') {
    return (
      <header className="relative py-20 md:py-28 bg-gradient-to-b from-[#F8FAFC] to-white border-b border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-[auto_1fr] gap-12 items-center">
            {portfolio.avatar_url && (
              <Avatar className="h-36 w-36 ring-4 ring-[#1E3A8A]/10 shadow-xl mx-auto md:mx-0">
                <AvatarImage src={portfolio.avatar_url} alt={portfolio.title} />
                <AvatarFallback className="text-4xl font-semibold bg-[#1E3A8A] text-white">{portfolio.title.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0F172A] mb-4">
                {portfolio.title}
              </h1>
              
              {portfolio.tagline && (
                <p className="text-xl text-[#475569] leading-relaxed mb-4 max-w-xl">
                  {portfolio.tagline}
                </p>
              )}
              
              {portfolio.location && (
                <p className="flex items-center justify-center md:justify-start gap-2 text-sm text-[#64748B] mb-6">
                  <MapPin className="h-4 w-4" /> {portfolio.location}
                </p>
              )}
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                {showProjectsCTA && (
                  <Button onClick={() => scrollToSection('projects')} className="bg-[#1E3A8A] hover:bg-[#1E40AF]">
                    View Portfolio
                  </Button>
                )}
                {showContactCTA && (
                  <Button onClick={() => scrollToSection('contact')} variant="outline" className="border-[#1E3A8A] text-[#1E3A8A]">
                    Contact Me
                  </Button>
                )}
              </div>
              
              <div className="flex justify-center md:justify-start gap-4">
                {portfolio.linkedin_url && (
                  <a href={portfolio.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-[#1E3A8A] transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {portfolio.github_url && (
                  <a href={portfolio.github_url} target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-[#1E3A8A] transition-colors">
                    <Github className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NEON CREATIVE - Vibrant, expressive, artistic
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === 'neon') {
    return (
      <header className="relative min-h-[90vh] flex items-center bg-[#0A0A0F]">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF3CAC]/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#2B86C5]/20 rounded-full blur-[128px]" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
          {portfolio.avatar_url && (
            <Avatar className="h-32 w-32 mx-auto mb-8 ring-4 ring-[#FF3CAC]/30">
              <AvatarImage src={portfolio.avatar_url} alt={portfolio.title} />
              <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-[#FF3CAC] to-[#2B86C5] text-white">
                {portfolio.title.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {portfolio.title}
          </h1>
          
          {portfolio.tagline && (
            <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
              {portfolio.tagline}
            </p>
          )}
          
          {portfolio.location && (
            <p className="flex items-center justify-center gap-2 text-sm text-[#FF3CAC] mb-10">
              <MapPin className="h-4 w-4" /> {portfolio.location}
            </p>
          )}
          
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {showProjectsCTA && (
              <Button 
                onClick={() => scrollToSection('projects')}
                size="lg"
                className="bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] hover:opacity-90 text-white border-0"
              >
                Explore Work
              </Button>
            )}
            {showContactCTA && (
              <Button 
                onClick={() => scrollToSection('contact')}
                variant="outline"
                size="lg"
                className="border-[#FF3CAC]/50 text-[#FF3CAC] hover:bg-[#FF3CAC]/10"
              >
                Say Hello
              </Button>
            )}
          </div>
          
          <div className="flex justify-center gap-6">
            {portfolio.github_url && (
              <a href={portfolio.github_url} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-[#FF3CAC] transition-colors">
                <Github className="h-5 w-5" />
              </a>
            )}
            {portfolio.linkedin_url && (
              <a href={portfolio.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-[#784BA0] transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {portfolio.twitter_url && (
              <a href={portfolio.twitter_url} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-[#2B86C5] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </header>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EDITORIAL - Refined, intellectual, timeless
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === 'editorial') {
    return (
      <header className="relative py-24 md:py-32 bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {portfolio.location && (
            <p className="text-xs uppercase tracking-[0.3em] text-[#9CA3AF] mb-8">
              {portfolio.location}
            </p>
          )}
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-light text-[#111827] mb-8 leading-[1.1]">
            {portfolio.title}
          </h1>
          
          {portfolio.tagline && (
            <p className="text-xl md:text-2xl text-[#6B7280] font-light leading-relaxed max-w-2xl mx-auto mb-12">
              {portfolio.tagline}
            </p>
          )}
          
          <div className="w-16 h-px bg-[#D1D5DB] mx-auto mb-12" />
          
          <div className="flex justify-center gap-6 mb-12">
            {showProjectsCTA && (
              <button 
                onClick={() => scrollToSection('projects')}
                className="text-sm uppercase tracking-wider text-[#374151] hover:text-[#111827] transition-colors"
              >
                Work
              </button>
            )}
            <span className="text-[#D1D5DB]">·</span>
            {showContactCTA && (
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-sm uppercase tracking-wider text-[#374151] hover:text-[#111827] transition-colors"
              >
                Contact
              </button>
            )}
          </div>
          
          <div className="flex justify-center gap-6">
            {portfolio.linkedin_url && (
              <a href={portfolio.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[#9CA3AF] hover:text-[#111827] transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {portfolio.github_url && (
              <a href={portfolio.github_url} target="_blank" rel="noopener noreferrer" className="text-[#9CA3AF] hover:text-[#111827] transition-colors">
                <Github className="h-4 w-4" />
              </a>
            )}
            {portfolio.twitter_url && (
              <a href={portfolio.twitter_url} target="_blank" rel="noopener noreferrer" className="text-[#9CA3AF] hover:text-[#111827] transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </header>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WARM - Friendly, approachable, personal
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === 'warm') {
    return (
      <header className="relative py-20 md:py-28 bg-gradient-to-br from-[#FFF7ED] via-[#FFFBEB] to-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-medium text-[#EA580C] mb-4">
                Hello, I'm
              </p>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#7C2D12] mb-6 leading-tight">
                {portfolio.title}
              </h1>
              
              {portfolio.tagline && (
                <p className="text-xl text-[#9A3412] leading-relaxed mb-6">
                  {portfolio.tagline}
                </p>
              )}
              
              {portfolio.location && (
                <p className="flex items-center gap-2 text-sm text-[#C2410C] mb-8">
                  <MapPin className="h-4 w-4" /> {portfolio.location}
                </p>
              )}
              
              <div className="flex flex-wrap gap-4 mb-8">
                {showProjectsCTA && (
                  <Button 
                    onClick={() => scrollToSection('projects')}
                    size="lg"
                    className="bg-[#EA580C] hover:bg-[#C2410C] text-white"
                  >
                    See My Work
                  </Button>
                )}
                {showContactCTA && (
                  <Button 
                    onClick={() => scrollToSection('contact')}
                    variant="outline"
                    size="lg"
                    className="border-[#EA580C] text-[#EA580C] hover:bg-[#EA580C]/10"
                  >
                    Get in Touch
                  </Button>
                )}
              </div>
              
              <div className="flex gap-4">
                {portfolio.linkedin_url && (
                  <a href={portfolio.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[#9A3412] hover:text-[#EA580C] transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {portfolio.github_url && (
                  <a href={portfolio.github_url} target="_blank" rel="noopener noreferrer" className="text-[#9A3412] hover:text-[#EA580C] transition-colors">
                    <Github className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
            
            {portfolio.avatar_url && (
              <div className="hidden md:flex justify-center">
                <Avatar className="h-72 w-72 ring-8 ring-white shadow-2xl">
                  <AvatarImage src={portfolio.avatar_url} alt={portfolio.title} className="object-cover" />
                  <AvatarFallback className="text-6xl font-bold bg-[#FED7AA] text-[#9A3412]">{portfolio.title.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Fallback - same as minimal
  return (
    <header className="py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">{portfolio.title}</h1>
      {portfolio.tagline && <p className="text-xl text-muted-foreground">{portfolio.tagline}</p>}
    </header>
  );
}
