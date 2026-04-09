import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ExternalLink, Calendar, Award, MapPin, Github, Linkedin, Twitter, Mail, Phone, Globe, ArrowUpRight, Terminal, Code2, Users, Star, MessageSquare, ChevronRight, ChevronDown, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ContactForm } from '@/components/portfolio/ContactForm';
import { motion, AnimatePresence } from 'framer-motion';
import type { FullPortfolioData, Project, Experience, Skill } from '@/pages/PublicPortfolio';
import { cn } from '@/lib/utils';
import { useCinematicMode } from '@/components/showcase/effects/CinematicModeContext';
import { CursorEffects } from '@/components/portfolio/effects';


// Glitch Text Component - simplified for better performance
function GlitchText({ text, className }: { text: string; className?: string }) {
  const [isGlitching, setIsGlitching] = useState(false);
  
  useEffect(() => {
    // Reduced frequency - glitch every 5-8 seconds instead of 3-5
    const glitchInterval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 150);
    }, 5000 + Math.random() * 3000);
    
    return () => clearInterval(glitchInterval);
  }, []);
  
  return (
    <span className={cn("relative inline-block", className)}>
      <span className={cn(
        "relative z-10 transition-transform duration-75",
        isGlitching && "translate-x-[1px]"
      )}>
        {text}
      </span>
      {isGlitching && (
        <span 
          className="absolute inset-0 text-[#00ffff] opacity-50 -translate-x-[2px]"
          aria-hidden="true"
        >
          {text}
        </span>
      )}
    </span>
  );
}

// Scanline overlay effect - optimized with CSS only, no JS animation
function ScanlineOverlay() {
  return (
    <div 
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.015]"
      style={{
        background: 'repeating-linear-gradient(0deg, rgba(0, 255, 65, 0.05) 0px, transparent 1px, transparent 3px)',
        backgroundSize: '100% 3px',
      }}
    />
  );
}

// Random glitch blocks - reduced frequency and simplified
function GlitchBlocks() {
  const [block, setBlock] = useState<{ id: number; top: number; width: number } | null>(null);
  
  useEffect(() => {
    // Reduced frequency - only trigger every 4-6 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setBlock({
          id: Date.now(),
          top: Math.random() * 100,
          width: Math.random() * 30 + 10,
        });
        // Clear quickly
        setTimeout(() => setBlock(null), 80);
      }
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!block) return null;
  
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <div
        className="absolute left-0 right-0 h-1 bg-[#00FF41]/10"
        style={{ top: `${block.top}%`, width: `${block.width}%` }}
      />
    </div>
  );
}

interface CyberRajThemeProps {
  data: FullPortfolioData;
}

type SectionType = 'about' | 'projects' | 'experience' | 'skills' | 'certifications' | 'custom_sections' | 'contact';

// Orbiting Circles Component
function OrbitingCircles({ className, children, reverse, duration = 20, delay = 10, radius = 50, path = true }: {
  className?: string;
  children?: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
}) {
  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <circle
            className="stroke-[#00FF41]/10 stroke-1"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
          />
        </svg>
      )}
      <div
        style={{
          '--duration': duration,
          '--radius': radius,
          '--delay': -delay,
        } as React.CSSProperties}
        className={cn(
          'absolute flex h-full w-full transform-gpu animate-orbit items-center justify-center rounded-full',
          { '[animation-direction:reverse]': reverse },
          className
        )}
      >
        {children}
      </div>
    </>
  );
}

// 3D Wireframe Sphere - optimized with reduced frame rate and intersection observer
function WireframeSphere({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isVisible, setIsVisible] = useState(false);
  
  // Only animate when visible
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(canvas);
    
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (!isVisible) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    let rotation = 0;
    let lastTime = 0;
    const fps = 20; // Limit to 20fps
    const interval = 1000 / fps;
    
    const drawSphere = (currentTime: number) => {
      animationRef.current = requestAnimationFrame(drawSphere);
      
      const delta = currentTime - lastTime;
      if (delta < interval) return;
      lastTime = currentTime - (delta % interval);
      
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = '#00FF41';
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.3;
      
      // Simplified - fewer lines
      for (let lat = -90; lat <= 90; lat += 30) {
        ctx.beginPath();
        const latRad = (lat * Math.PI) / 180;
        const r = radius * Math.cos(latRad);
        
        for (let lon = 0; lon <= 360; lon += 10) {
          const lonRad = ((lon + rotation) * Math.PI) / 180;
          const x = centerX + r * Math.cos(lonRad);
          const y = centerY + radius * Math.sin(latRad);
          
          if (lon === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      
      for (let lon = 0; lon < 360; lon += 45) {
        ctx.beginPath();
        const lonRad = ((lon + rotation) * Math.PI) / 180;
        
        for (let lat = -90; lat <= 90; lat += 10) {
          const latRad = (lat * Math.PI) / 180;
          const r = radius * Math.cos(latRad);
          const x = centerX + r * Math.cos(lonRad);
          const y = centerY + radius * Math.sin(latRad);
          
          if (lat === -90) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      
      if (!prefersReducedMotion) rotation += 0.2;
    };
    
    animationRef.current = requestAnimationFrame(drawSphere);
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isVisible]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={400} 
      className={cn('opacity-40', className)}
    />
  );
}

// Blinking Cursor
function BlinkingCursor() {
  return (
    <span className="inline-block w-3 h-6 bg-[#00FF41] animate-pulse ml-1" />
  );
}

// Particle Background - optimized with fewer particles and no connections
function ParticleBackground({ enabled = true }: { enabled?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!enabled) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    // Reduced particle count for better performance
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    const particleCount = 30; // Reduced from 80
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2, // Slower
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }
    
    let animationId: number;
    let lastTime = 0;
    const fps = 30; // Limit to 30fps
    const interval = 1000 / fps;
    
    const animate = (currentTime: number) => {
      animationId = requestAnimationFrame(animate);
      
      const delta = currentTime - lastTime;
      if (delta < interval) return;
      lastTime = currentTime - (delta % interval);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 65, ${p.alpha})`;
        ctx.fill();
      });
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [enabled]);
  
  if (!enabled) return null;
  
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 will-change-transform" />;
}

// Glow Orbs Background - CSS-only, no JS animations
function GlowOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#00FF41]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#38bdf8]/5 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00FF41]/3 rounded-full blur-[120px]" />
    </div>
  );
}

// Scroll Indicator
function ScrollIndicator() {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY < 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  if (!show) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2"
    >
      <span className="text-[#00FF41]/60 font-mono text-xs">scroll</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ChevronDown className="h-5 w-5 text-[#00FF41]/60" />
      </motion.div>
    </motion.div>
  );
}

// Tech Icon Component
function TechIcon({ name }: { name: string }) {
  const iconMap: Record<string, string> = {
    'react': '⚛️',
    'typescript': '🔷',
    'javascript': '🟨',
    'python': '🐍',
    'node': '🟢',
    'aws': '☁️',
    'docker': '🐳',
    'kubernetes': '☸️',
    'mongodb': '🍃',
    'postgresql': '🐘',
    'redis': '🔴',
    'graphql': '◈',
    'rest': '🔌',
    'git': '📦',
    'linux': '🐧',
    'terraform': '🏗️',
    'default': '💻',
  };
  
  const key = name.toLowerCase();
  return <span className="text-xl">{iconMap[key] || iconMap.default}</span>;
}

export function CyberRajTheme({ data }: CyberRajThemeProps) {
  const { portfolio, projects, experiences, skills, certifications, customSections, sections, sectionOrder } = data;

  // Get cinematic mode settings - safely handle context not being available
  let cinematicMode = true;
  let particlesEnabled = true;
  try {
    const context = useCinematicMode();
    cinematicMode = context.cinematicMode;
    particlesEnabled = context.particlesEnabled;
  } catch {
    // Context not available, default to enabled
  }


  const formatDate = (dateStr: string) => format(new Date(dateStr), 'MMM yyyy');

  const orderedSections: { type: SectionType; order: number }[] = [
    { type: 'about', order: sectionOrder.about_order },
    { type: 'projects', order: sectionOrder.projects_order },
    { type: 'experience', order: sectionOrder.experience_order },
    { type: 'skills', order: sectionOrder.skills_order },
    { type: 'certifications', order: sectionOrder.certifications_order },
    { type: 'custom_sections', order: sectionOrder.custom_sections_order },
    { type: 'contact', order: sectionOrder.contact_order },
  ];
  orderedSections.sort((a, b) => a.order - b.order);

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'Core Skills';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Social links
  const socialLinks = [
    { url: portfolio.github_url, icon: Github, label: 'GitHub' },
    { url: portfolio.linkedin_url, icon: Linkedin, label: 'LinkedIn' },
    { url: portfolio.twitter_url, icon: Twitter, label: 'Twitter' },
    { url: portfolio.website_url, icon: Globe, label: 'Website' },
  ].filter(l => l.url);

  // Navigation links
  const navLinks = [
    { id: 'about', label: 'About', show: !!portfolio.bio },
    { id: 'skills', label: 'Skills', show: sections.show_skills && skills.length > 0 },
    { id: 'projects', label: 'Projects', show: sections.show_projects && projects.length > 0 },
    { id: 'experience', label: 'Experience', show: sections.show_experience && experiences.length > 0 },
    { id: 'contact', label: 'Contact', show: sections.show_contact },
  ].filter(l => l.show);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Typewriter effect for roles with sound
  const roles = portfolio.tagline?.split(',').map(r => r.trim()) || ['Developer', 'Engineer', 'Creator'];
  const [currentRole, setCurrentRole] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const role = roles[currentRole];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < role.length) {
          setDisplayText(role.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentRole((prev) => (prev + 1) % roles.length);
        }
      }
    }, isDeleting ? 50 : 100);
    
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentRole, roles]);

  // Hero Section
  const renderHero = () => (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#00FF41]/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-[#00FF41] font-mono text-lg font-bold tracking-wider">
            {portfolio.title.split(' ')[0].toUpperCase()}
          </span>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-gray-400 hover:text-[#00FF41] font-inter text-sm font-medium transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00FF41] transition-all group-hover:w-full" />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {socialLinks.slice(0, 2).map(({ url, icon: Icon, label }) => (
              <a
                key={label}
                href={url!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#00FF41] transition-colors"
                aria-label={label}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Hero Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Orbiting elements around avatar */}
        <div className="relative w-48 h-48 mx-auto mb-12">
          {/* Avatar - clean display without overlays */}
          <div className="absolute inset-0 flex items-center justify-center">
            {portfolio.avatar_url ? (
              <div className="w-44 h-44 rounded-full overflow-hidden border-2 border-[#00FF41]/50 shadow-[0_0_30px_rgba(0,255,65,0.3)]">
                <img 
                  src={portfolio.avatar_url} 
                  alt={portfolio.title}
                  className="w-full h-full object-cover"
                  style={{ imageRendering: 'auto' }}
                  loading="eager"
                  decoding="async"
                />
              </div>
            ) : (
              <div className="w-44 h-44 rounded-full bg-[#0a0a0a] border-2 border-[#00FF41]/50 flex items-center justify-center">
                <Terminal className="h-14 w-14 text-[#00FF41]" />
              </div>
            )}
          </div>
        </div>
        
        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-[#00FF41] font-mono text-sm mb-4 tracking-wider">
            &lt;hello world /&gt;
          </p>
          
          <h1 className="text-5xl md:text-7xl font-inter font-bold text-white mb-6 tracking-tight">
            I'm <GlitchText text={portfolio.title.split(' ')[0]} className="text-[#00FF41]" />
          </h1>
          
          <div className="text-2xl md:text-3xl font-inter text-gray-400 mb-8 h-10">
            <span>{displayText}</span>
            <BlinkingCursor />
          </div>
          
          {portfolio.location && (
            <p className="flex items-center justify-center gap-2 text-gray-500 font-inter text-sm mb-8">
              <MapPin className="h-4 w-4 text-[#00FF41]" />
              {portfolio.location}
            </p>
          )}
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            {sections.show_projects && projects.length > 0 && (
              <Button 
                onClick={() => scrollToSection('projects')}
                className="bg-[#00FF41] text-[#0a0a0a] hover:bg-[#00FF41]/90 font-inter font-semibold px-8 py-6 rounded-lg shadow-[0_0_20px_rgba(0,255,65,0.3)] hover:shadow-[0_0_30px_rgba(0,255,65,0.5)] transition-all"
              >
                View My Work
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {sections.show_contact && (
              <Button 
                onClick={() => scrollToSection('contact')}
                variant="outline"
                className="border-[#00FF41]/50 text-[#00FF41] hover:bg-[#00FF41]/10 font-inter font-semibold px-8 py-6 rounded-lg"
              >
                Get In Touch
              </Button>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Wireframe sphere in background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-20 hidden xl:block">
        <WireframeSphere />
      </div>
      
      <ScrollIndicator />
    </section>
  );

  // About Section
  const renderAbout = () => {
    if (!portfolio.bio) return null;
    
    return (
      <section id="about" className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-inter font-bold text-white mb-4 flex items-center gap-4">
              <span className="text-[#00FF41] font-mono">01.</span>
              About Me
              <div className="flex-1 h-px bg-gradient-to-r from-[#00FF41]/20 to-transparent ml-4" />
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="md:col-span-2">
                <p className="text-gray-400 font-inter text-lg leading-relaxed">
                  {portfolio.bio}
                </p>
                
                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-6 mt-8">
                  {projects.length > 0 && (
                    <div className="text-center p-4 bg-[#0f0f0f] border border-[#00FF41]/10 rounded-lg">
                      <div className="text-3xl font-bold text-[#00FF41] font-mono">{projects.length}+</div>
                      <div className="text-gray-500 text-sm mt-1">Projects</div>
                    </div>
                  )}
                  {experiences.length > 0 && (
                    <div className="text-center p-4 bg-[#0f0f0f] border border-[#00FF41]/10 rounded-lg">
                      <div className="text-3xl font-bold text-[#00FF41] font-mono">
                        {Math.max(...experiences.map(e => new Date().getFullYear() - new Date(e.start_date).getFullYear()))}+
                      </div>
                      <div className="text-gray-500 text-sm mt-1">Years Exp</div>
                    </div>
                  )}
                  {skills.length > 0 && (
                    <div className="text-center p-4 bg-[#0f0f0f] border border-[#00FF41]/10 rounded-lg">
                      <div className="text-3xl font-bold text-[#00FF41] font-mono">{skills.length}+</div>
                      <div className="text-gray-500 text-sm mt-1">Skills</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Tech focus */}
              <div className="bg-[#0f0f0f] border border-[#00FF41]/10 rounded-lg p-6">
                <h3 className="text-[#00FF41] font-mono text-sm mb-4">// core_focus</h3>
                <ul className="space-y-3">
                  {skills.slice(0, 5).map((skill) => (
                    <li key={skill.id} className="flex items-center gap-3 text-gray-400 font-inter text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41]" />
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  };

  // Skills Section
  const renderSkills = () => {
    if (!sections.show_skills || skills.length === 0) return null;
    
    return (
      <section id="skills" className="py-24 bg-[#0f0f0f]/50 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-inter font-bold text-white mb-4 flex items-center gap-4">
              <span className="text-[#00FF41] font-mono">02.</span>
              Skills & Tech
              <div className="flex-1 h-px bg-gradient-to-r from-[#00FF41]/20 to-transparent ml-4" />
            </h2>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
              {Object.entries(groupedSkills).map(([category, categorySkills], idx) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-[#0a0a0a] border border-gray-800/50 rounded-xl p-6 hover:border-[#00FF41]/30 transition-all group"
                >
                  <h3 className="text-[#00FF41] font-mono text-sm mb-6 flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    {category}
                  </h3>
                  
                  <div className="space-y-4">
                    {categorySkills.map((skill) => (
                      <div key={skill.id}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-300 font-inter text-sm">{skill.name}</span>
                          <span className="text-gray-500 font-mono text-xs">{skill.proficiency}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.proficiency}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-[#00FF41] to-[#38bdf8] rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    );
  };

  // Projects Section
  const renderProjects = () => {
    if (!sections.show_projects || projects.length === 0) return null;
    
    const sortedProjects = [...projects].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
    
    return (
      <section id="projects" className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-inter font-bold text-white mb-4 flex items-center gap-4">
              <span className="text-[#00FF41] font-mono">03.</span>
              Featured Projects
              <div className="flex-1 h-px bg-gradient-to-r from-[#00FF41]/20 to-transparent ml-4" />
            </h2>
            
            <div className="grid gap-8 md:grid-cols-2 mt-12">
              {sortedProjects.map((project, idx) => (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="group relative bg-[#0f0f0f] border border-gray-800/50 rounded-xl overflow-hidden hover:border-[#00FF41]/30 transition-all"
                >
                  {/* Project image */}
                  {project.image_url && (
                    <div className="aspect-video overflow-hidden relative">
                      <img 
                        src={project.image_url} 
                        alt={project.title}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
                      
                      {project.featured && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-[#00FF41] text-[#0a0a0a] font-mono text-xs">
                            Featured
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-inter font-bold text-white mb-3 group-hover:text-[#00FF41] transition-colors">
                      {project.title}
                    </h3>
                    
                    {(project.short_description || project.description) && (
                      <p className="text-gray-400 font-inter text-sm mb-4 line-clamp-2">
                        {project.short_description || project.description}
                      </p>
                    )}
                    
                    {/* Technologies */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.slice(0, 4).map((tech) => (
                          <span key={tech} className="text-xs font-mono px-2 py-1 bg-[#00FF41]/10 text-[#00FF41] rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Links */}
                    <div className="flex items-center gap-4">
                      {project.project_url && (
                        <a 
                          href={project.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-inter text-gray-400 hover:text-[#00FF41] flex items-center gap-1 transition-colors"
                        >
                          Live Demo <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {project.github_url && (
                        <a 
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-inter text-gray-400 hover:text-[#00FF41] flex items-center gap-1 transition-colors"
                        >
                          Source <Github className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    );
  };

  // Experience Section
  const renderExperience = () => {
    if (!sections.show_experience || experiences.length === 0) return null;
    
    return (
      <section id="experience" className="py-24 bg-[#0f0f0f]/50 relative">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-inter font-bold text-white mb-4 flex items-center gap-4">
              <span className="text-[#00FF41] font-mono">04.</span>
              Experience
              <div className="flex-1 h-px bg-gradient-to-r from-[#00FF41]/20 to-transparent ml-4" />
            </h2>
            
            <div className="mt-12 relative">
              {/* Timeline line */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#00FF41]/50 via-[#00FF41]/20 to-transparent" />
              
              {experiences.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={cn(
                    'relative mb-12 md:w-1/2',
                    idx % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:ml-auto'
                  )}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 md:left-auto md:right-0 top-2 w-3 h-3 rounded-full bg-[#00FF41] shadow-[0_0_10px_rgba(0,255,65,0.5)]"
                    style={{ [idx % 2 === 0 ? 'right' : 'left']: '-6px' }}
                  />
                  
                  <div className="ml-6 md:ml-0 bg-[#0a0a0a] border border-gray-800/50 rounded-xl p-6 hover:border-[#00FF41]/30 transition-all">
                    <div className="text-[#00FF41] font-mono text-xs mb-2">
                      {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : exp.end_date ? formatDate(exp.end_date) : ''}
                    </div>
                    
                    <h3 className="text-lg font-inter font-bold text-white mb-1">{exp.position}</h3>
                    <p className="text-[#38bdf8] font-inter text-sm mb-3">{exp.company}</p>
                    
                    {exp.location && (
                      <p className={cn(
                        'flex items-center gap-2 text-gray-500 text-xs mb-4',
                        idx % 2 === 0 && 'md:justify-end'
                      )}>
                        <MapPin className="h-3 w-3" />
                        {exp.location}
                      </p>
                    )}
                    
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className={cn('space-y-2', idx % 2 === 0 && 'md:text-left')}>
                        {exp.achievements.slice(0, 3).map((achievement, aidx) => (
                          <li key={aidx} className="text-sm text-gray-400 flex items-start gap-2">
                            <span className="text-[#00FF41] mt-1">▹</span>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    );
  };

  // Contact Section
  const renderContact = () => {
    if (!sections.show_contact) return null;
    
    return (
      <section id="contact" className="py-24 relative">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#00FF41] font-mono text-sm">05. What's Next?</span>
            <h2 className="text-4xl md:text-5xl font-inter font-bold text-white mt-4 mb-6">
              Get In Touch
            </h2>
            <p className="text-gray-400 font-inter text-lg mb-12 max-w-xl mx-auto">
              I'm currently open to new opportunities and collaborations. Whether you have a question or just want to say hi, I'll try my best to get back to you!
            </p>
            
            {/* Contact form */}
            <div className="bg-[#0f0f0f] border border-gray-800/50 rounded-xl p-8 text-left">
              <ContactForm portfolioId={portfolio.id} portfolioTitle={portfolio.title} variant="dark" />
            </div>
            
            {/* Social links */}
            <div className="flex justify-center gap-6 mt-12">
              {socialLinks.map(({ url, icon: Icon, label }) => (
                <a
                  key={label}
                  href={url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 w-12 rounded-full bg-[#0f0f0f] border border-gray-800/50 flex items-center justify-center text-gray-400 hover:text-[#00FF41] hover:border-[#00FF41]/30 transition-all"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    );
  };

  const renderSection = (type: SectionType) => {
    switch (type) {
      case 'about': return renderAbout();
      case 'projects': return renderProjects();
      case 'experience': return renderExperience();
      case 'skills': return renderSkills();
      case 'contact': return renderContact();
      default: return null;
    }
  };

  // Determine if animated backgrounds should be shown based on background_style setting
  const showAnimatedBackground = portfolio.background_style !== 'none' && portfolio.background_style !== 'static';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-inter">
      {/* Cursor Effects - controlled by cinematic settings */}
      <CursorEffects primaryColor="#00FF41" />
      
      {/* Glitch effects - only when cinematic mode is on AND background is animated */}
      {cinematicMode && showAnimatedBackground && <ScanlineOverlay />}
      {cinematicMode && showAnimatedBackground && <GlitchBlocks />}
      
      {/* Animated backgrounds - controlled by cinematic, particle settings AND background_style */}
      {showAnimatedBackground && <ParticleBackground enabled={cinematicMode && particlesEnabled} />}
      {cinematicMode && showAnimatedBackground && <GlowOrbs />}
      
      {/* Main content */}
      <main className="relative z-10">
        {renderHero()}
        
        {orderedSections.map((section) => (
          <React.Fragment key={section.type}>
            {renderSection(section.type)}
          </React.Fragment>
        ))}
        
        {/* Footer */}
        <footer className="py-12 border-t border-gray-800/50">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-gray-600 font-mono text-sm">
              Designed & Built by {portfolio.title}
            </p>
            <p className="text-gray-700 font-mono text-xs mt-2">
              © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </footer>
      </main>
      
      {/* Custom styles for animations */}
      <style>{`
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(var(--radius, 100px)) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(var(--radius, 100px)) rotate(-360deg); }
        }
        
        .animate-orbit {
          animation: orbit calc(var(--duration, 20) * 1s) linear infinite;
          animation-delay: calc(var(--delay, 0) * 1s);
        }
        
        .font-inter {
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        .font-mono {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
        }
        
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }
        
        @keyframes glitch-1 {
          0%, 100% { transform: translate(0); opacity: 0.8; }
          20% { transform: translate(3px, -1px); }
          40% { transform: translate(-3px, 1px); }
          60% { transform: translate(2px, -2px); }
          80% { transform: translate(-2px, 2px); }
        }
        
        @keyframes glitch-2 {
          0%, 100% { transform: translate(0); opacity: 0.8; }
          20% { transform: translate(-3px, 1px); }
          40% { transform: translate(3px, -1px); }
          60% { transform: translate(-2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }
        
        @keyframes scanline {
          0% { transform: translateY(0); }
          100% { transform: translateY(100vh); }
        }
        
        .animate-glitch {
          animation: glitch 0.2s ease-in-out;
        }
        
        .animate-glitch-1 {
          animation: glitch-1 0.2s ease-in-out;
        }
        
        .animate-glitch-2 {
          animation: glitch-2 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
