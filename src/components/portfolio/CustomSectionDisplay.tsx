import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';

export interface CustomSectionData {
  id: string;
  title: string;
  content: string | null;
}

interface CustomSectionDisplayProps {
  section: CustomSectionData;
  variant?: string;
  className?: string;
}

// Configure DOMPurify with safe tags and attributes
const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'span', 'div'];
const ALLOWED_ATTR = ['href', 'title', 'target', 'rel', 'class'];

// Sanitize content using DOMPurify - prevents XSS attacks
function sanitizeContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'], // Allow target for links
    FORCE_BODY: true,
  });
}

// Convert plain text with line breaks to paragraphs, then sanitize
function formatContent(content: string): string {
  let processedContent = content;
  
  // If content looks like plain text (no HTML tags), convert line breaks to paragraphs
  if (!/<[^>]+>/.test(content)) {
    processedContent = content
      .split(/\n\n+/)
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br/>')}</p>`)
      .join('');
  }
  
  // Always sanitize the output with DOMPurify
  return sanitizeContent(processedContent);
}

const variantStyles: Record<string, { container: string; content: string }> = {
  minimal: {
    container: '',
    content: 'prose prose-sm max-w-none text-muted-foreground',
  },
  modern: {
    container: 'bg-card rounded-xl p-6 border border-border',
    content: 'prose prose-sm max-w-none',
  },
  bold: {
    container: 'bg-gradient-to-br from-accent/5 to-transparent rounded-2xl p-8',
    content: 'prose prose-sm max-w-none',
  },
  cyberpunk: {
    container: 'border border-accent/30 bg-black/50 p-6 font-mono',
    content: 'prose prose-sm prose-invert max-w-none text-accent/80',
  },
  corporate: {
    container: 'bg-muted/30 rounded-lg p-6 border-l-4 border-accent',
    content: 'prose prose-sm max-w-none',
  },
  neon: {
    container: 'bg-black/40 rounded-xl p-6 border border-accent/20 backdrop-blur-sm',
    content: 'prose prose-sm prose-invert max-w-none',
  },
  editorial: {
    container: 'border-t border-border pt-8',
    content: 'prose prose-lg max-w-none font-serif',
  },
  warm: {
    container: 'bg-orange-50/50 dark:bg-orange-950/10 rounded-xl p-6',
    content: 'prose prose-sm max-w-none text-orange-900 dark:text-orange-100',
  },
  default: {
    container: '',
    content: 'prose prose-sm max-w-none text-muted-foreground',
  },
};

export function CustomSectionDisplay({ section, variant = 'default', className }: CustomSectionDisplayProps) {
  if (!section.content) return null;

  const styles = variantStyles[variant] || variantStyles.default;
  const formattedContent = formatContent(section.content);

  return (
    <div className={cn(styles.container, className)}>
      <div 
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    </div>
  );
}
