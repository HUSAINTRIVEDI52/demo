import { motion } from 'framer-motion';
import { Code2, Rocket, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemePreset } from '../PremiumShowcase';
import { ScrollReveal, StaggerChildren, StaggerItem } from '../effects/ScrollReveal';
import { PremiumCard } from '../effects/PremiumCard';

interface AboutSectionProps {
  data: {
    name: string;
    bio: string;
    avatarUrl: string | null;
  };
  theme: ThemePreset;
  themeConfig: any;
}

export function AboutSection({ data, theme, themeConfig }: AboutSectionProps) {
  const infoCards = [
    {
      icon: Code2,
      title: 'What I Do',
      description: 'Design and implement scalable cloud infrastructure, CI/CD pipelines, and automation solutions.',
    },
    {
      icon: Rocket,
      title: "What I'm Best At",
      description: 'Kubernetes orchestration, AWS architecture, Infrastructure as Code, and DevOps best practices.',
    },
    {
      icon: Users,
      title: 'How I Work',
      description: 'Collaborative approach with clear communication, agile methodologies, and continuous improvement.',
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <ScrollReveal direction="left" delay={0.2}>
            <div className="relative">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Animated glow behind image */}
                <motion.div 
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{ 
                    background: `radial-gradient(circle, ${themeConfig.colors.primary}30, transparent 70%)`,
                    filter: 'blur(60px)'
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
                <div 
                  className={cn(
                    "relative rounded-3xl overflow-hidden aspect-square max-w-md mx-auto transition-all duration-500",
                    theme === 'cyber-neon' && "border-2 border-[#00FFE1]/30 hover:border-[#00FFE1]/60 hover:shadow-[0_0_50px_rgba(0,255,225,0.2)]",
                    theme === 'minimal-dark' && "border border-white/10 hover:border-white/30",
                    theme === 'glassmorphism' && "border-2 border-purple-500/30 hover:border-purple-500/60 hover:shadow-[0_0_50px_rgba(168,85,247,0.2)]"
                  )}
                >
                  {data.avatarUrl ? (
                    <img 
                      src={data.avatarUrl} 
                      alt={data.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ 
                        background: `linear-gradient(135deg, ${themeConfig.colors.surface}, ${themeConfig.colors.background})` 
                      }}
                    >
                      <span 
                        className="text-9xl font-bold"
                        style={{ color: themeConfig.colors.primary }}
                      >
                        {data.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </ScrollReveal>

          {/* Text Side */}
          <div>
            <ScrollReveal delay={0.1}>
              <p
                className="text-sm uppercase tracking-widest mb-4"
                style={{ color: themeConfig.colors.primary }}
              >
                About Me
              </p>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-['Space_Grotesk']">
                Building the future of{' '}
                <span className="gradient-text">cloud infrastructure</span>
              </h2>
            </ScrollReveal>
            
            <ScrollReveal delay={0.3}>
              <p
                className="text-lg leading-relaxed mb-10"
                style={{ color: themeConfig.colors.muted }}
              >
                {data.bio || "Passionate about creating robust, scalable systems that power modern applications. With expertise in cloud technologies and DevOps practices, I help teams deliver faster and more reliably."}
              </p>
            </ScrollReveal>

            {/* Info Cards with stagger animation */}
            <StaggerChildren className="space-y-4" staggerDelay={0.15}>
              {infoCards.map((card, index) => (
                <StaggerItem key={card.title}>
                  <PremiumCard
                    theme={theme}
                    themeConfig={themeConfig}
                    className="p-5 rounded-xl cursor-default"
                    enableTilt={false}
                    enableGlow={true}
                  >
                    <div className="flex items-start gap-4">
                      <motion.div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${themeConfig.colors.primary}15` }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <card.icon className="h-6 w-6" style={{ color: themeConfig.colors.primary }} />
                      </motion.div>
                      <div>
                        <h3 
                          className="font-semibold mb-1 text-lg"
                          style={{ color: themeConfig.colors.text }}
                        >
                          {card.title}
                        </h3>
                        <p 
                          className="text-sm leading-relaxed"
                          style={{ color: themeConfig.colors.muted }}
                        >
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </PremiumCard>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </div>
      </div>
    </section>
  );
}
