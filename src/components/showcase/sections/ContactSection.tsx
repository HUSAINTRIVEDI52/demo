import { motion } from 'framer-motion';
import { Mail, Send, Calendar, Github, Linkedin, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ThemePreset } from '../PremiumShowcase';

interface ContactSectionProps {
  data: {
    name: string;
    socialLinks: {
      github?: string;
      linkedin?: string;
      twitter?: string;
      email?: string;
    };
  };
  theme: ThemePreset;
  themeConfig: any;
}

export function ContactSection({ data, theme, themeConfig }: ContactSectionProps) {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[150px] opacity-20"
        style={{ backgroundColor: themeConfig.colors.primary }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
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
            Get In Touch
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-['Space_Grotesk'] mb-6">
            Let's build something{' '}
            <span className="gradient-text">scalable</span>
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ color: themeConfig.colors.muted }}
          >
            Ready to transform your infrastructure? Let's discuss how I can help you build 
            production-ready systems that scale.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn(
            "p-8 md:p-12 rounded-2xl",
            theme === 'cyber-neon' && "bg-[#0A0F14] border border-[#00FFE1]/30",
            theme === 'minimal-dark' && "bg-white/5 border border-white/10",
            theme === 'glassmorphism' && "glass-card"
          )}
        >
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: themeConfig.colors.text }}
                >
                  Your Name
                </label>
                <Input
                  placeholder="John Doe"
                  className={cn(
                    "h-12 transition-all duration-300",
                    theme === 'cyber-neon' && "bg-[#05070B] border-[#00FFE1]/30 focus:border-[#00FFE1] focus:ring-[#00FFE1]/20 text-white placeholder:text-white/40",
                    theme === 'minimal-dark' && "bg-white/5 border-white/20 focus:border-white/50 text-white placeholder:text-white/40",
                    theme === 'glassmorphism' && "bg-white/10 border-purple-500/30 focus:border-purple-500 text-white placeholder:text-white/40"
                  )}
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: themeConfig.colors.text }}
                >
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  className={cn(
                    "h-12 transition-all duration-300",
                    theme === 'cyber-neon' && "bg-[#05070B] border-[#00FFE1]/30 focus:border-[#00FFE1] focus:ring-[#00FFE1]/20 text-white placeholder:text-white/40",
                    theme === 'minimal-dark' && "bg-white/5 border-white/20 focus:border-white/50 text-white placeholder:text-white/40",
                    theme === 'glassmorphism' && "bg-white/10 border-purple-500/30 focus:border-purple-500 text-white placeholder:text-white/40"
                  )}
                />
              </div>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: themeConfig.colors.text }}
              >
                Subject
              </label>
              <Input
                placeholder="Project Inquiry"
                className={cn(
                  "h-12 transition-all duration-300",
                  theme === 'cyber-neon' && "bg-[#05070B] border-[#00FFE1]/30 focus:border-[#00FFE1] focus:ring-[#00FFE1]/20 text-white placeholder:text-white/40",
                  theme === 'minimal-dark' && "bg-white/5 border-white/20 focus:border-white/50 text-white placeholder:text-white/40",
                  theme === 'glassmorphism' && "bg-white/10 border-purple-500/30 focus:border-purple-500 text-white placeholder:text-white/40"
                )}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: themeConfig.colors.text }}
              >
                Message
              </label>
              <Textarea
                placeholder="Tell me about your project..."
                rows={5}
                className={cn(
                  "resize-none transition-all duration-300",
                  theme === 'cyber-neon' && "bg-[#05070B] border-[#00FFE1]/30 focus:border-[#00FFE1] focus:ring-[#00FFE1]/20 text-white placeholder:text-white/40",
                  theme === 'minimal-dark' && "bg-white/5 border-white/20 focus:border-white/50 text-white placeholder:text-white/40",
                  theme === 'glassmorphism' && "bg-white/10 border-purple-500/30 focus:border-purple-500 text-white placeholder:text-white/40"
                )}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 min-w-[200px]">
                <Button
                  type="submit"
                  size="lg"
                  className={cn(
                    "w-full h-14 text-lg font-semibold gap-2",
                    theme === 'cyber-neon' && "bg-gradient-to-r from-[#00FFE1] to-[#00FF88] text-[#05070B] hover:shadow-[0_0_30px_rgba(0,255,225,0.5)]",
                    theme === 'minimal-dark' && "bg-white text-black hover:bg-white/90",
                    theme === 'glassmorphism' && "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                  )}
                >
                  <Send className="h-5 w-5" />
                  Send Message
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="lg"
                  className={cn(
                    "h-14 px-8 text-lg font-semibold gap-2",
                    theme === 'cyber-neon' && "border-[#00FFE1]/50 text-[#00FFE1] hover:bg-[#00FFE1]/10",
                    theme === 'minimal-dark' && "border-white/30 text-white hover:bg-white/10",
                    theme === 'glassmorphism' && "border-purple-500/50 text-white hover:bg-purple-500/10"
                  )}
                >
                  <Calendar className="h-5 w-5" />
                  Book a Call
                </Button>
              </motion.div>
            </div>
          </form>

          {/* Social Links */}
          <div className="mt-10 pt-8 border-t" style={{ borderColor: `${themeConfig.colors.primary}20` }}>
            <p 
              className="text-center text-sm mb-4"
              style={{ color: themeConfig.colors.muted }}
            >
              Or connect with me on
            </p>
            <div className="flex justify-center gap-4">
              {data.socialLinks.github && (
                <motion.a
                  href={data.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
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
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                    theme === 'glassmorphism' ? "glass-card hover:bg-white/10" : "bg-white/10 hover:bg-white/15"
                  )}
                >
                  <Linkedin className="h-5 w-5" style={{ color: '#0A66C2' }} />
                </motion.a>
              )}
              {data.socialLinks.twitter && (
                <motion.a
                  href={data.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                    theme === 'glassmorphism' ? "glass-card hover:bg-white/10" : "bg-white/10 hover:bg-white/15"
                  )}
                >
                  <Twitter className="h-5 w-5" style={{ color: '#1DA1F2' }} />
                </motion.a>
              )}
              {data.socialLinks.email && (
                <motion.a
                  href={`mailto:${data.socialLinks.email}`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                    theme === 'glassmorphism' ? "glass-card hover:bg-white/10" : "bg-white/10 hover:bg-white/15"
                  )}
                >
                  <Mail className="h-5 w-5" style={{ color: themeConfig.colors.primary }} />
                </motion.a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
