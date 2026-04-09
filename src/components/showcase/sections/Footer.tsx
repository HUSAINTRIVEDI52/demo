import { motion } from 'framer-motion';
import { Heart, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BRAND } from '@/config/branding';
import { ThemePreset } from '../PremiumShowcase';

interface FooterProps {
  data: {
    name: string;
    role: string;
  };
  theme: ThemePreset;
  themeConfig: any;
}

export function Footer({ data, theme, themeConfig }: FooterProps) {
  const quickLinks = [
    { label: 'Projects', href: '#projects' },
    { label: 'Experience', href: '#experience' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <footer 
      className={cn(
        "py-12 px-6 border-t",
        theme === 'cyber-neon' && "border-[#00FFE1]/20 bg-[#05070B]",
        theme === 'minimal-dark' && "border-white/10 bg-[#0A0A0B]",
        theme === 'glassmorphism' && "border-white/10 bg-[#0F0F23]"
      )}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Name & Role */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center md:text-left"
          >
            <h3 
              className="text-xl font-bold mb-1"
              style={{ color: themeConfig.colors.text }}
            >
              {data.name}
            </h3>
            <p 
              className="text-sm"
              style={{ color: themeConfig.colors.muted }}
            >
              {data.role || 'DevOps Engineer & Cloud Architect'}
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-6"
          >
            {quickLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: themeConfig.colors.muted }}
              >
                {link.label}
              </a>
            ))}
          </motion.div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center md:text-right"
          >
            <p 
              className="text-sm"
              style={{ color: themeConfig.colors.muted }}
            >
              © {new Date().getFullYear()} {data.name}. All rights reserved.
            </p>
          </motion.div>
        </div>

        {/* Made with */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 pt-8 border-t text-center"
          style={{ borderColor: `${themeConfig.colors.primary}10` }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm transition-all duration-300 hover:opacity-80 group"
            style={{ color: themeConfig.colors.muted }}
          >
            Made with <Heart className="h-4 w-4 text-red-500 group-hover:scale-110 transition-transform" /> using{' '}
            <span 
              className="font-semibold"
              style={{ color: themeConfig.colors.primary }}
            >
              {BRAND.name}
            </span>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </motion.div>
      </div>
    </footer>
  );
}
