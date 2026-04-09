import { motion } from 'framer-motion';
import { Shield, Github, Linkedin, Award, CheckCircle, Zap, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemePreset } from '../PremiumShowcase';

interface TrustStripProps {
  data: {
    certifications: string[];
    socialLinks: {
      github?: string;
      linkedin?: string;
    };
    projects: any[];
  };
  theme: ThemePreset;
  themeConfig: any;
}

export function TrustStrip({ data, theme, themeConfig }: TrustStripProps) {
  const trustItems = [
    { icon: Shield, label: 'AWS Certified', color: '#FF9900' },
    { icon: CheckCircle, label: `${data.projects.length}+ Projects`, color: themeConfig.colors.accent },
    { icon: Zap, label: '99.9% Uptime', color: themeConfig.colors.primary },
    { icon: Server, label: 'CI/CD Expert', color: themeConfig.colors.secondary },
  ];

  return (
    <section 
      className={cn(
        "py-8 border-y",
        theme === 'cyber-neon' && "border-[#00FFE1]/20 bg-[#0A0F14]/50",
        theme === 'minimal-dark' && "border-white/10 bg-white/5",
        theme === 'glassmorphism' && "border-white/10 bg-white/5 backdrop-blur-sm"
      )}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div 
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  theme === 'glassmorphism' ? "glass-card" : "bg-white/10"
                )}
              >
                <item.icon className="h-5 w-5" style={{ color: item.color }} />
              </div>
              <span 
                className="text-sm font-medium whitespace-nowrap"
                style={{ color: themeConfig.colors.text }}
              >
                {item.label}
              </span>
            </motion.div>
          ))}

          {/* Divider */}
          <div 
            className="hidden md:block w-px h-8"
            style={{ backgroundColor: `${themeConfig.colors.primary}30` }}
          />

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {data.socialLinks.github && (
              <motion.a
                href={data.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  theme === 'glassmorphism' ? "glass-card hover:bg-white/10" : "bg-white/10 hover:bg-white/15"
                )}
              >
                <Github className="h-5 w-5" style={{ color: themeConfig.colors.text }} />
              </motion.a>
            )}
            {data.socialLinks.linkedin && (
              <motion.a
                href={data.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  theme === 'glassmorphism' ? "glass-card hover:bg-white/10" : "bg-white/10 hover:bg-white/15"
                )}
              >
                <Linkedin className="h-5 w-5" style={{ color: '#0A66C2' }} />
              </motion.a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
