import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Server, Database, Wrench, Code, Container } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemePreset } from '../PremiumShowcase';
import { ScrollReveal } from '../effects/ScrollReveal';
import { PremiumCard } from '../effects/PremiumCard';

interface SkillsSectionProps {
  data: {
    skills: Array<{
      name: string;
      category: string;
      proficiency: number;
    }>;
  };
  theme: ThemePreset;
  themeConfig: any;
}

const categoryIcons: Record<string, any> = {
  'Cloud': Cloud,
  'DevOps': Server,
  'Backend': Database,
  'Tools': Wrench,
  'Languages': Code,
  'Containers': Container,
};

const defaultSkills = [
  { name: 'AWS', category: 'Cloud', proficiency: 95 },
  { name: 'GCP', category: 'Cloud', proficiency: 85 },
  { name: 'Azure', category: 'Cloud', proficiency: 80 },
  { name: 'Kubernetes', category: 'DevOps', proficiency: 90 },
  { name: 'Docker', category: 'DevOps', proficiency: 95 },
  { name: 'Terraform', category: 'DevOps', proficiency: 90 },
  { name: 'Ansible', category: 'DevOps', proficiency: 85 },
  { name: 'Jenkins', category: 'DevOps', proficiency: 88 },
  { name: 'Python', category: 'Backend', proficiency: 92 },
  { name: 'Go', category: 'Backend', proficiency: 75 },
  { name: 'Node.js', category: 'Backend', proficiency: 85 },
  { name: 'PostgreSQL', category: 'Backend', proficiency: 88 },
  { name: 'Git', category: 'Tools', proficiency: 95 },
  { name: 'Prometheus', category: 'Tools', proficiency: 85 },
  { name: 'Grafana', category: 'Tools', proficiency: 88 },
  { name: 'Linux', category: 'Tools', proficiency: 92 },
];

export function SkillsSection({ data, theme, themeConfig }: SkillsSectionProps) {
  const skills = data.skills.length > 0 ? data.skills : defaultSkills;
  const categories = [...new Set(skills.map(s => s.category))];
  const [activeCategory, setActiveCategory] = useState(categories[0] || 'Cloud');

  const filteredSkills = skills.filter(s => s.category === activeCategory);

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p 
              className="text-sm uppercase tracking-widest mb-4"
              style={{ color: themeConfig.colors.primary }}
            >
              Technical Expertise
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-['Space_Grotesk']">
              Skills & <span className="gradient-text">Technologies</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Category Tabs with animation */}
        <ScrollReveal delay={0.2}>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category, index) => {
              const Icon = categoryIcons[category] || Code;
              return (
                <motion.button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all duration-300 relative overflow-hidden",
                    activeCategory === category
                      ? theme === 'cyber-neon' 
                        ? "bg-[#00FFE1] text-[#05070B] shadow-[0_0_20px_rgba(0,255,225,0.4)]"
                        : theme === 'minimal-dark'
                        ? "bg-white text-black"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                      : theme === 'glassmorphism'
                      ? "glass-card hover:bg-white/10"
                      : "bg-white/5 hover:bg-white/10 border border-white/10"
                  )}
                  style={{
                    color: activeCategory !== category ? themeConfig.colors.text : undefined
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="h-4 w-4" />
                  {category}
                  
                  {/* Active indicator shimmer */}
                  {activeCategory === category && (
                    <motion.div
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        backgroundSize: '200% 100%'
                      }}
                      animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Skills Grid with enhanced animations */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {filteredSkills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <PremiumCard
                  theme={theme}
                  themeConfig={themeConfig}
                  className="relative p-5 rounded-xl text-center cursor-default overflow-hidden"
                  enableTilt={false}
                  enableGlow={true}
                >
                  {/* Animated proficiency bar */}
                  <motion.div 
                    className="absolute bottom-0 left-0 h-1 rounded-b-xl"
                    style={{ backgroundColor: themeConfig.colors.primary }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.proficiency}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.05, ease: 'easeOut' }}
                  />
                  
                  {/* Glow effect on proficiency bar */}
                  <motion.div 
                    className="absolute bottom-0 left-0 h-2 rounded-b-xl opacity-50 blur-sm"
                    style={{ backgroundColor: themeConfig.colors.primary }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.proficiency}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.05, ease: 'easeOut' }}
                  />
                  
                  <span 
                    className="text-lg font-semibold"
                    style={{ color: themeConfig.colors.text }}
                  >
                    {skill.name}
                  </span>
                  <p 
                    className="text-xs mt-1"
                    style={{ color: themeConfig.colors.muted }}
                  >
                    {skill.proficiency}%
                  </p>
                </PremiumCard>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* GitHub Contribution Style Heatmap */}
        <ScrollReveal delay={0.4}>
          <div className="mt-16">
            <p 
              className="text-sm uppercase tracking-widest mb-6 text-center"
              style={{ color: themeConfig.colors.muted }}
            >
              Contribution Activity
            </p>
            <PremiumCard
              theme={theme}
              themeConfig={themeConfig}
              className="p-6 rounded-xl overflow-x-auto"
              enableTilt={false}
              enableGlow={false}
            >
              <div className="flex gap-1 justify-center min-w-max">
                {Array.from({ length: 52 }, (_, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const intensity = Math.random();
                      return (
                        <motion.div
                          key={dayIndex}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: (weekIndex * 7 + dayIndex) * 0.001 }}
                          whileHover={{ 
                            scale: 1.5, 
                            boxShadow: `0 0 10px ${themeConfig.colors.primary}` 
                          }}
                          className="w-3 h-3 rounded-sm cursor-pointer transition-all duration-200"
                          style={{
                            backgroundColor: intensity > 0.7 
                              ? themeConfig.colors.primary 
                              : intensity > 0.4 
                              ? `${themeConfig.colors.primary}80`
                              : intensity > 0.2 
                              ? `${themeConfig.colors.primary}40`
                              : `${themeConfig.colors.primary}15`,
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </PremiumCard>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
