import { motion } from 'framer-motion';
import { BRAND } from '@/config/branding';

interface PortfolioWatermarkProps {
  className?: string;
}

/**
 * Watermark component for free plan portfolios
 * This watermark is required and cannot be removed for free plan users
 */
export function PortfolioWatermark({ className }: PortfolioWatermarkProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className={className}
    >
      <a
        href={BRAND.url}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-50 group"
        aria-label={`Made with ${BRAND.name}`}
      >
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-background/90 backdrop-blur-md border border-border/50 shadow-lg hover:shadow-xl hover:border-accent/50 transition-all duration-300 group-hover:scale-105">
          {/* Logo Icon */}
          <div className="relative">
            <motion.div
              className="relative"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Glow effect */}
              <div 
                className="absolute inset-0 rounded-lg blur-sm opacity-40 group-hover:opacity-60 transition-opacity duration-300"
                style={{ backgroundColor: 'hsl(var(--accent))' }}
              />
              
              {/* Logo SVG */}
              <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10 h-6 w-6"
              >
                <defs>
                  <linearGradient id="watermarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--accent))" />
                    <stop offset="100%" stopColor="hsl(var(--accent) / 0.7)" />
                  </linearGradient>
                </defs>

                {/* Background */}
                <rect
                  x="2"
                  y="2"
                  width="36"
                  height="36"
                  rx="10"
                  fill="url(#watermarkGrad)"
                />

                {/* Left bar */}
                <rect
                  x="9"
                  y="11"
                  width="4"
                  height="18"
                  rx="2"
                  fill="white"
                  opacity="0.95"
                />

                {/* Middle peak */}
                <path
                  d="M16 11L20 7L24 11L24 29L20 25L16 29Z"
                  fill="white"
                  opacity="0.95"
                />

                {/* Right bar */}
                <rect
                  x="27"
                  y="11"
                  width="4"
                  height="18"
                  rx="2"
                  fill="white"
                  opacity="0.95"
                />
              </svg>
            </motion.div>
          </div>
          
          {/* Text */}
          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-200">
            <span className="font-semibold text-foreground group-hover:text-accent transition-colors duration-200">
              {BRAND.domain}
            </span>
          </span>
        </div>
      </a>
    </motion.div>
  );
}
