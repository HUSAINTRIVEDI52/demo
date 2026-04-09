import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import type { CustomSection } from '@/hooks/useCustomSections';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  content: z.string().max(10000, 'Content too long').optional(),
  visibility: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface CustomSectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<CustomSection, 'id' | 'portfolio_id' | 'created_at' | 'updated_at' | 'display_order'>) => Promise<void>;
  editingSection?: CustomSection | null;
}

export function CustomSectionFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editingSection,
}: CustomSectionFormDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      visibility: true,
    },
  });

  useEffect(() => {
    if (editingSection) {
      form.reset({
        title: editingSection.title,
        content: editingSection.content || '',
        visibility: editingSection.visibility,
      });
    } else {
      form.reset({
        title: '',
        content: '',
        visibility: true,
      });
    }
  }, [editingSection, open, form]);

  const handleSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await onSubmit({
        title: values.title,
        content: values.content || null,
        visibility: values.visibility,
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSection ? 'Edit Section' : 'Add Custom Section'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Awards, Publications, Hobbies" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your section content here. You can use plain text or basic formatting."
                      className="min-h-[200px] resize-y"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Write the content for your custom section. Keep it concise and professional.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Visible on Portfolio</FormLabel>
                    <FormDescription>
                      Show this section on your public portfolio
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? 'Saving...' : (editingSection ? 'Save Changes' : 'Add Section')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
