import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Send, CheckCircle } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  subject: z.string().trim().max(200, 'Subject must be less than 200 characters').optional(),
  message: z.string().trim().min(1, 'Message is required').max(2000, 'Message must be less than 2000 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  portfolioId: string;
  portfolioTitle: string;
  className?: string;
  variant?: 'light' | 'dark';
}

export function ContactForm({ portfolioId, portfolioTitle, className = '', variant = 'light' }: ContactFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('contact_messages')
        .insert({
          portfolio_id: portfolioId,
          sender_name: data.name,
          sender_email: data.email,
          subject: data.subject || null,
          message: data.message,
        });

      if (insertError) throw insertError;

      setSubmitted(true);
      reset();
    } catch (err: any) {
      setError('Failed to send message. Please try again.');
      console.error('Contact form error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const isDark = variant === 'dark';

  if (submitted) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <CheckCircle className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
        <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
        <p className={isDark ? 'text-white/70' : 'text-muted-foreground'}>
          Thank you for reaching out. I'll get back to you soon.
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => setSubmitted(false)}
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="name" className={isDark ? 'text-white/90' : ''}>Name</Label>
        <Input
          id="name"
          placeholder="Your name"
          {...register('name')}
          className={isDark ? 'bg-white/10 border-white/20 text-white placeholder:text-white/50' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className={isDark ? 'text-white/90' : ''}>Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          {...register('email')}
          className={isDark ? 'bg-white/10 border-white/20 text-white placeholder:text-white/50' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject" className={isDark ? 'text-white/90' : ''}>Subject (optional)</Label>
        <Input
          id="subject"
          placeholder="What's this about?"
          {...register('subject')}
          className={isDark ? 'bg-white/10 border-white/20 text-white placeholder:text-white/50' : ''}
        />
        {errors.subject && (
          <p className="text-sm text-red-500">{errors.subject.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className={isDark ? 'text-white/90' : ''}>Message</Label>
        <Textarea
          id="message"
          placeholder="Your message..."
          rows={5}
          {...register('message')}
          className={isDark ? 'bg-white/10 border-white/20 text-white placeholder:text-white/50' : ''}
        />
        {errors.message && (
          <p className="text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <Button 
        type="submit" 
        disabled={submitting}
        className="w-full"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        Send Message
      </Button>
    </form>
  );
}
