import { motion, useReducedMotion } from 'framer-motion';

type DividerVariant = 'cyber' | 'modern' | 'editorial' | 'dark-elite' | 'warm' | 'minimal';

interface SectionDividerProps {
  variant?: DividerVariant;
  className?: string;
}

export function SectionDivider({ variant = 'minimal', className }: SectionDividerProps) {
  const prefersReducedMotion = useReducedMotion();

  switch (variant) {
    case 'cyber':
      return (
        <div className={`relative py-8 ${className}`}>
          <div className="h-px bg-gradient-to-r from-transparent via-[#00FFE1]/30 to-transparent" />
          {!prefersReducedMotion && (
            <motion.div
              className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00FFE1] to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: [0, 1, 0] }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
            />
          )}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border border-[#00FFE1]/50" />
        </div>
      );

    case 'modern':
      return (
        <div className={`py-16 ${className}`}>
          <motion.div
            className="flex justify-center gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-accent/40"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
              />
            ))}
          </motion.div>
        </div>
      );

    case 'editorial':
      return (
        <div className={`flex justify-center py-12 ${className}`}>
          <motion.div
            className="w-24 h-px bg-[#D1D5DB]"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          />
        </div>
      );

    case 'dark-elite':
      return (
        <div className={`py-12 ${className}`}>
          <motion.div
            className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          />
        </div>
      );

    case 'warm':
      return (
        <div className={`flex justify-center py-12 ${className}`}>
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-px bg-white/30" />
            <div className="w-3 h-3 rounded-full bg-white/20" />
            <div className="w-16 h-px bg-white/30" />
          </motion.div>
        </div>
      );

    default:
      return (
        <div className={`py-8 ${className}`}>
          <div className="h-px bg-border" />
        </div>
      );
  }
}
