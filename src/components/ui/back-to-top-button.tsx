import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackToTopButtonProps {
  scrollContainer?: React.RefObject<HTMLElement>;
  threshold?: number;
  className?: string;
}

export function BackToTopButton({ 
  scrollContainer, 
  threshold = 300,
  className 
}: BackToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = scrollContainer?.current ?? window;
    
    const handleScroll = () => {
      const scrollTop = scrollContainer?.current 
        ? scrollContainer.current.scrollTop 
        : window.scrollY;
      setIsVisible(scrollTop > threshold);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollContainer, threshold]);

  const scrollToTop = useCallback(() => {
    const container = scrollContainer?.current;
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [scrollContainer]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className={cn(
            "fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full flex items-center justify-center",
            "bg-accent text-accent-foreground shadow-lg shadow-accent/25",
            "border border-accent/20 backdrop-blur-sm",
            "hover:shadow-xl hover:shadow-accent/30 transition-shadow duration-300",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background",
            className
          )}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
