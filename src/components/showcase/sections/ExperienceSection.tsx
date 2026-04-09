import { motion } from 'framer-motion';
import { Building2, MapPin, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemePreset } from '../PremiumShowcase';
import { ScrollReveal } from '../effects/ScrollReveal';
import { PremiumCard } from '../effects/PremiumCard';

interface ExperienceSectionProps {
  data: {
    experiences: Array<{
      position: string;
      company: string;
      location: string;
      startDate: string;
      endDate?: string;
      isCurrent: boolean;
      bullets: string[];
    }>;
  };
  theme: ThemePreset;
  themeConfig: any;
}

const defaultExperiences = [
  {
    position: 'Senior DevOps Engineer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    startDate: '2022-01',
    isCurrent: true,
    bullets: [
      'Led infrastructure migration to Kubernetes, reducing costs by 40%',
      'Implemented GitOps workflows with ArgoCD for 50+ microservices',
      'Designed and deployed multi-region disaster recovery solution',
    ],
  },
  {
    position: 'Cloud Engineer',
    company: 'CloudScale Solutions',
    location: 'New York, NY',
    startDate: '2020-03',
    endDate: '2022-01',
    isCurrent: false,
    bullets: [
      'Architected AWS infrastructure supporting 10M+ daily users',
      'Built CI/CD pipelines reducing deployment time by 80%',
      'Mentored team of 5 junior engineers',
    ],
  },
  {
    position: 'Systems Administrator',
    company: 'StartupXYZ',
    location: 'Austin, TX',
    startDate: '2018-06',
    endDate: '2020-03',
    isCurrent: false,
    bullets: [
      'Managed Linux servers and automated routine tasks',
      'Implemented monitoring with Prometheus and Grafana',
      'Reduced system downtime by 60%',
    ],
  },
];

export function ExperienceSection({ data, theme, themeConfig }: ExperienceSectionProps) {
  const experiences = data.experiences.length > 0 ? data.experiences : defaultExperiences;

  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p 
              className="text-sm uppercase tracking-widest mb-4"
              style={{ color: themeConfig.colors.primary }}
            >
              Career Path
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-['Space_Grotesk']">
              Work <span className="gradient-text">Experience</span>
            </h2>
          </div>
        </ScrollReveal>

        {/* Timeline */}
        <div className="relative">
          {/* Animated Timeline Line */}
          <motion.div 
            className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{ backgroundColor: `${themeConfig.colors.primary}30` }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />

          {/* Moving indicator on timeline */}
          <motion.div
            className="absolute left-0 md:left-1/2 w-3 h-3 rounded-full -translate-x-1/2 z-20"
            style={{ backgroundColor: themeConfig.colors.primary, boxShadow: `0 0 20px ${themeConfig.colors.primary}` }}
            animate={{
              top: ['0%', '100%', '0%']
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'linear'
            }}
          />

          {experiences.map((exp, index) => (
            <ScrollReveal
              key={`${exp.company}-${index}`}
              direction={index % 2 === 0 ? 'left' : 'right'}
              delay={index * 0.2}
            >
              <div
                className={cn(
                  "relative mb-12 md:w-1/2",
                  index % 2 === 0 ? "md:pr-12 md:ml-0" : "md:pl-12 md:ml-auto"
                )}
              >
                {/* Timeline Dot */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.3 }}
                  className={cn(
                    "absolute top-6 w-4 h-4 rounded-full border-4 z-10 cursor-pointer transition-all duration-300",
                    "left-0 md:left-auto",
                    index % 2 === 0 ? "md:right-0 md:translate-x-1/2" : "md:left-0 md:-translate-x-1/2"
                  )}
                  style={{ 
                    backgroundColor: themeConfig.colors.background,
                    borderColor: exp.isCurrent ? themeConfig.colors.primary : themeConfig.colors.secondary,
                    boxShadow: exp.isCurrent ? `0 0 15px ${themeConfig.colors.primary}` : 'none'
                  }}
                />

                {/* Content Card */}
                <PremiumCard
                  theme={theme}
                  themeConfig={themeConfig}
                  className="ml-8 md:ml-0 p-6 rounded-xl"
                  enableTilt={false}
                  enableGlow={true}
                >
                  {/* Current Badge */}
                  {exp.isCurrent && (
                    <motion.span 
                      className={cn(
                        "inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3",
                        theme === 'cyber-neon' && "bg-[#00FF88]/20 text-[#00FF88]",
                        theme === 'minimal-dark' && "bg-green-500/20 text-green-400",
                        theme === 'glassmorphism' && "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400"
                      )}
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Current Role
                    </motion.span>
                  )}

                  <h3 
                    className="text-xl font-bold mb-1"
                    style={{ color: themeConfig.colors.text }}
                  >
                    {exp.position}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                    <span 
                      className="flex items-center gap-1.5 text-sm font-medium"
                      style={{ color: themeConfig.colors.primary }}
                    >
                      <Building2 className="h-4 w-4" />
                      {exp.company}
                    </span>
                    <span 
                      className="flex items-center gap-1.5 text-sm"
                      style={{ color: themeConfig.colors.muted }}
                    >
                      <MapPin className="h-4 w-4" />
                      {exp.location}
                    </span>
                    <span 
                      className="flex items-center gap-1.5 text-sm"
                      style={{ color: themeConfig.colors.muted }}
                    >
                      <Calendar className="h-4 w-4" />
                      {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>

                  {/* Animated Bullets */}
                  <ul className="space-y-2">
                    {exp.bullets.map((bullet, bulletIndex) => (
                      <motion.li
                        key={bulletIndex}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + bulletIndex * 0.1 }}
                        className="flex items-start gap-3 text-sm group"
                        style={{ color: themeConfig.colors.muted }}
                      >
                        <motion.span 
                          className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 transition-all duration-300 group-hover:scale-150"
                          style={{ backgroundColor: themeConfig.colors.primary }}
                          whileHover={{ boxShadow: `0 0 10px ${themeConfig.colors.primary}` }}
                        />
                        <span className="group-hover:text-white transition-colors">{bullet}</span>
                      </motion.li>
                    ))}
                  </ul>
                </PremiumCard>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
