import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, MapPin, Terminal, Zap, Users, Clock, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemePreset } from '../PremiumShowcase';
import { CountUpAnimation } from '../effects/CountUpAnimation';
import { ScrollReveal } from '../effects/ScrollReveal';

interface HeroSectionProps {
  data: {
    name: string;
    role: string;
    tagline: string;
    location: string;
    avatarUrl: string | null;
    projects: any[];
    experiences: any[];
  };
  theme: ThemePreset;
  themeConfig: any;
}

const roles = [
  'DevOps Engineer',
  'Cloud Architect',
  'SRE Specialist',
  'Automation Expert',
];

export function HeroSection({ data, theme, themeConfig }: HeroSectionProps) {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const currentRole = roles[currentRoleIndex];
    
    if (isTyping) {
      if (displayedText.length < currentRole.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentRole.slice(0, displayedText.length + 1));
        }, 80);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 40);
        return () => clearTimeout(timeout);
      } else {
        setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
        setIsTyping(true);
      }
    }
  }, [displayedText, isTyping, currentRoleIndex]);

  const stats = [
    { icon: Briefcase, label: 'Projects', value: `${data.projects.length || 15}+` },
    { icon: Clock, label: 'Experience', value: `${data.experiences.length || 5}+ yrs` },
    { icon: Zap, label: 'Uptime', value: '99.9%' },
    { icon: Users, label: 'Clients', value: '50+' },
  ];

  const techBadges = ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Python'];

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 px-6 overflow-hidden pt-24">
      {/* Terminal-style decorative element for cyber theme */}
      {theme === 'cyber-neon' && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute left-6 top-1/4 hidden xl:block"
        >
          <div className="bg-[#0A0F14] border border-[#00FFE1]/30 rounded-lg p-4 font-mono text-xs w-64 shadow-[0_0_30px_rgba(0,255,225,0.1)]">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#00FFE1]/20">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-[#00FFE1]/60 ml-2">terminal</span>
            </div>
            <div className="space-y-1 text-[#00FFE1]/80">
              <p><span className="text-[#8A2EFF]">$</span> kubectl get pods</p>
              <motion.p 
                className="text-[#00FF88]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                ✓ All systems operational
              </motion.p>
              <p><span className="text-[#8A2EFF]">$</span> terraform apply</p>
              <motion.p 
                className="text-[#00FF88]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                ✓ Infrastructure deployed
              </motion.p>
              <p><span className="text-[#8A2EFF]">$</span> _<span className="animate-pulse">|</span></p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <ScrollReveal direction="left" delay={0.2}>
            <div className="text-center lg:text-left">
              {/* Location Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6",
                  theme === 'glassmorphism' 
                    ? "glass-card" 
                    : "bg-white/5 border border-white/10"
                )}
              >
                <MapPin className="h-4 w-4" style={{ color: themeConfig.colors.primary }} />
                <span style={{ color: themeConfig.colors.muted }}>{data.location || 'San Francisco, CA'}</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 font-['Space_Grotesk']"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                I build{' '}
                <span className="gradient-text">scalable</span>
                <br />
                cloud infrastructure
              </motion.h1>

              {/* Typewriter Role */}
              <motion.div 
                className="flex items-center justify-center lg:justify-start gap-2 mb-8 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Terminal className="h-5 w-5" style={{ color: themeConfig.colors.secondary }} />
                <span className="text-lg" style={{ color: themeConfig.colors.muted }}>
                  {displayedText}
                  <span 
                    className="animate-pulse ml-0.5"
                    style={{ color: themeConfig.colors.primary }}
                  >
                    |
                  </span>
                </span>
              </motion.div>

              {/* Tech Badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-8">
                {techBadges.map((tech, index) => (
                  <motion.span
                    key={tech}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 cursor-default",
                      theme === 'cyber-neon' && "bg-[#00FFE1]/10 text-[#00FFE1] border border-[#00FFE1]/30 hover:bg-[#00FFE1]/20 hover:shadow-[0_0_20px_rgba(0,255,225,0.3)]",
                      theme === 'minimal-dark' && "bg-white/10 text-white border border-white/20 hover:bg-white/15",
                      theme === 'glassmorphism' && "glass-card text-white hover:bg-white/10"
                    )}
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-12">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group"
                >
                  {/* Button glow effect */}
                  <div 
                    className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                    style={{ background: `linear-gradient(135deg, ${themeConfig.colors.primary}, ${themeConfig.colors.secondary})` }}
                  />
                  <Button
                    size="lg"
                    className={cn(
                      "relative h-14 px-8 text-lg font-semibold transition-all duration-300",
                      theme === 'cyber-neon' && "bg-gradient-to-r from-[#00FFE1] to-[#00FF88] text-[#05070B] hover:shadow-[0_0_30px_rgba(0,255,225,0.5)]",
                      theme === 'minimal-dark' && "bg-white text-black hover:bg-white/90",
                      theme === 'glassmorphism' && "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                    )}
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    Hire Me
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                      "h-14 px-8 text-lg font-semibold transition-all duration-300 group",
                      theme === 'cyber-neon' && "border-[#00FFE1]/50 text-[#00FFE1] hover:bg-[#00FFE1]/10 hover:border-[#00FFE1]",
                      theme === 'minimal-dark' && "border-white/30 text-white hover:bg-white/10 hover:border-white/50",
                      theme === 'glassmorphism' && "border-purple-500/50 text-white hover:bg-purple-500/10 hover:border-purple-500"
                    )}
                    onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    View Projects
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </div>

              {/* Stats Row with Count-up */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className={cn(
                      "p-4 rounded-xl text-center transition-all duration-300",
                      theme === 'cyber-neon' && "bg-[#0A0F14] border border-[#00FFE1]/20 hover:border-[#00FFE1]/50 hover:shadow-[0_0_30px_rgba(0,255,225,0.1)]",
                      theme === 'minimal-dark' && "bg-white/5 border border-white/10 hover:border-white/20",
                      theme === 'glassmorphism' && "glass-card hover:bg-white/10"
                    )}
                  >
                    <stat.icon 
                      className="h-5 w-5 mx-auto mb-2" 
                      style={{ color: themeConfig.colors.primary }}
                    />
                    <CountUpAnimation
                      end={stat.value}
                      className="text-2xl font-bold block"
                      style={{ color: themeConfig.colors.text }}
                    />
                    <p className="text-xs" style={{ color: themeConfig.colors.muted }}>
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Avatar / Visual */}
          <ScrollReveal direction="right" delay={0.4}>
            <div className="relative flex justify-center">
              <div className="relative">
                {/* Animated Glow Ring */}
                <motion.div 
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ 
                    background: `radial-gradient(circle, ${themeConfig.colors.primary}40, transparent 70%)`,
                    transform: 'scale(1.3)',
                    filter: 'blur(60px)'
                  }}
                  animate={{
                    scale: [1.3, 1.5, 1.3],
                    opacity: [0.4, 0.6, 0.4]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
                
                {/* Profile Image Container with float animation */}
                <motion.div 
                  className={cn(
                    "relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden",
                    theme === 'cyber-neon' && "border-4 border-[#00FFE1]/50 shadow-[0_0_50px_rgba(0,255,225,0.3)]",
                    theme === 'minimal-dark' && "border-4 border-white/20",
                    theme === 'glassmorphism' && "border-4 border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)]"
                  )}
                  animate={{
                    y: [0, -15, 0]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  {data.avatarUrl ? (
                    <img 
                      src={data.avatarUrl} 
                      alt={data.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center text-8xl font-bold"
                      style={{ 
                        background: `linear-gradient(135deg, ${themeConfig.colors.primary}20, ${themeConfig.colors.secondary}20)`,
                        color: themeConfig.colors.primary
                      }}
                    >
                      {data.name.charAt(0)}
                    </div>
                  )}
                </motion.div>

                {/* Floating Badges */}
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className={cn(
                    "absolute -top-4 -right-4 px-4 py-2 rounded-full font-semibold text-sm shadow-lg",
                    theme === 'cyber-neon' && "bg-[#00FF88] text-[#05070B] shadow-[0_0_20px_rgba(0,255,136,0.4)]",
                    theme === 'minimal-dark' && "bg-white text-black",
                    theme === 'glassmorphism' && "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                  )}
                >
                  Open to Work
                </motion.div>

                <motion.div
                  animate={{ 
                    y: [0, 10, 0],
                    rotate: [0, -5, 0]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className={cn(
                    "absolute -bottom-2 -left-4 px-4 py-2 rounded-full font-mono text-sm",
                    theme === 'glassmorphism' ? "glass-card" : "bg-white/10 border border-white/20 backdrop-blur-sm"
                  )}
                  style={{ color: themeConfig.colors.primary }}
                >
                  ✓ AWS Certified
                </motion.div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 flex justify-center pt-2 cursor-pointer"
          style={{ borderColor: `${themeConfig.colors.primary}50` }}
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5], y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-3 rounded-full"
            style={{ backgroundColor: themeConfig.colors.primary }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
