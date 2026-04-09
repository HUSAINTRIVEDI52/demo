import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemePreset } from '../PremiumShowcase';

interface TestimonialsSectionProps {
  theme: ThemePreset;
  themeConfig: any;
}

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CTO at TechStartup',
    content: 'Exceptional DevOps expertise. Transformed our deployment process completely, reducing our release cycle from weeks to hours. Highly recommend!',
    rating: 5,
    avatar: '',
  },
  {
    name: 'Michael Roberts',
    role: 'Engineering Manager at CloudCorp',
    content: 'Outstanding cloud architecture skills. Built a scalable infrastructure that handles millions of requests with zero downtime. A true professional.',
    rating: 5,
    avatar: '',
  },
  {
    name: 'Emily Johnson',
    role: 'VP of Engineering at ScaleUp',
    content: 'Brilliant problem solver with deep knowledge of Kubernetes and AWS. Our infrastructure costs dropped by 40% after their optimization work.',
    rating: 5,
    avatar: '',
  },
];

export function TestimonialsSection({ theme, themeConfig }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <section 
      className={cn(
        "py-24 px-6",
        theme === 'cyber-neon' && "bg-[#0A0F14]/50",
        theme === 'minimal-dark' && "bg-white/[0.02]",
        theme === 'glassmorphism' && "bg-white/[0.02]"
      )}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p 
            className="text-sm uppercase tracking-widest mb-4"
            style={{ color: themeConfig.colors.primary }}
          >
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-['Space_Grotesk']">
            What Clients <span className="gradient-text">Say</span>
          </h2>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative">
          <div 
            className={cn(
              "relative min-h-[300px] rounded-2xl overflow-hidden",
              theme === 'glassmorphism' ? "glass-card" : "bg-white/5 border border-white/10"
            )}
          >
            {/* Quote Icon */}
            <Quote 
              className="absolute top-6 left-6 h-12 w-12 opacity-20"
              style={{ color: themeConfig.colors.primary }}
            />

            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'tween', duration: 0.4 }}
                className="p-8 md:p-12 text-center"
              >
                {/* Rating */}
                <div className="flex justify-center gap-1 mb-6">
                  {Array.from({ length: testimonials[currentIndex].rating }, (_, i) => (
                    <Star 
                      key={i} 
                      className="h-5 w-5 fill-current"
                      style={{ color: '#FFD700' }}
                    />
                  ))}
                </div>

                {/* Content */}
                <p 
                  className="text-xl md:text-2xl leading-relaxed mb-8 italic"
                  style={{ color: themeConfig.colors.text }}
                >
                  "{testimonials[currentIndex].content}"
                </p>

                {/* Author */}
                <div className="flex flex-col items-center">
                  <div 
                    className="w-16 h-16 rounded-full mb-4 flex items-center justify-center text-2xl font-bold"
                    style={{ 
                      backgroundColor: `${themeConfig.colors.primary}20`,
                      color: themeConfig.colors.primary
                    }}
                  >
                    {testimonials[currentIndex].name.charAt(0)}
                  </div>
                  <p 
                    className="font-semibold text-lg"
                    style={{ color: themeConfig.colors.text }}
                  >
                    {testimonials[currentIndex].name}
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: themeConfig.colors.muted }}
                  >
                    {testimonials[currentIndex].role}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className={cn(
                "rounded-full",
                theme === 'cyber-neon' && "border-[#00FFE1]/30 hover:bg-[#00FFE1]/10 hover:border-[#00FFE1]",
                theme === 'minimal-dark' && "border-white/20 hover:bg-white/10",
                theme === 'glassmorphism' && "border-purple-500/30 hover:bg-purple-500/10"
              )}
            >
              <ChevronLeft className="h-5 w-5" style={{ color: themeConfig.colors.text }} />
            </Button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    currentIndex === index 
                      ? "w-8" 
                      : "opacity-40 hover:opacity-70"
                  )}
                  style={{ 
                    backgroundColor: currentIndex === index 
                      ? themeConfig.colors.primary 
                      : themeConfig.colors.text 
                  }}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className={cn(
                "rounded-full",
                theme === 'cyber-neon' && "border-[#00FFE1]/30 hover:bg-[#00FFE1]/10 hover:border-[#00FFE1]",
                theme === 'minimal-dark' && "border-white/20 hover:bg-white/10",
                theme === 'glassmorphism' && "border-purple-500/30 hover:bg-purple-500/10"
              )}
            >
              <ChevronRight className="h-5 w-5" style={{ color: themeConfig.colors.text }} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
