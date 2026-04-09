import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { z } from 'zod';
import type { Certification } from '@/hooks/useCertifications';

interface CertificationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certification?: Certification | null;
  onSubmit: (data: Omit<Certification, 'id' | 'portfolio_id' | 'created_at' | 'display_order'>) => Promise<void>;
}

const certificationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  issuer: z.string().trim().min(1, 'Issuer is required').max(200, 'Issuer must be less than 200 characters'),
  credential_id: z.string().trim().max(100, 'Credential ID must be less than 100 characters').optional(),
  credential_url: z.string().trim().url('Invalid URL format').max(500, 'URL must be less than 500 characters').optional().or(z.literal('')),
});

export function CertificationFormDialog({ open, onOpenChange, certification, onSubmit }: CertificationFormDialogProps) {
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    issuer: '',
    credential_id: '',
    credential_url: '',
    issue_date: undefined as Date | undefined,
    expiry_date: undefined as Date | undefined,
  });

  useEffect(() => {
    if (certification) {
      setForm({
        name: certification.name,
        issuer: certification.issuer,
        credential_id: certification.credential_id || '',
        credential_url: certification.credential_url || '',
        issue_date: certification.issue_date ? new Date(certification.issue_date) : undefined,
        expiry_date: certification.expiry_date ? new Date(certification.expiry_date) : undefined,
      });
    } else {
      setForm({
        name: '',
        issuer: '',
        credential_id: '',
        credential_url: '',
        issue_date: undefined,
        expiry_date: undefined,
      });
    }
  }, [certification, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = certificationSchema.safeParse({
      name: form.name,
      issuer: form.issuer,
      credential_id: form.credential_id || undefined,
      credential_url: form.credential_url || undefined,
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    await onSubmit({
      name: form.name.trim(),
      issuer: form.issuer.trim(),
      credential_id: form.credential_id.trim() || null,
      credential_url: form.credential_url.trim() || null,
      issue_date: form.issue_date ? format(form.issue_date, 'yyyy-MM-dd') : null,
      expiry_date: form.expiry_date ? format(form.expiry_date, 'yyyy-MM-dd') : null,
    });
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{certification ? 'Edit Certification' : 'Add Certification'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Certification Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="AWS Solutions Architect"
              maxLength={200}
            />
          </div>

          {/* Issuer */}
          <div className="space-y-2">
            <Label htmlFor="issuer">Issuing Organization *</Label>
            <Input
              id="issuer"
              value={form.issuer}
              onChange={(e) => setForm(prev => ({ ...prev, issuer: e.target.value }))}
              placeholder="Amazon Web Services"
              maxLength={200}
            />
          </div>

          {/* Credential ID */}
          <div className="space-y-2">
            <Label htmlFor="credential_id">Credential ID</Label>
            <Input
              id="credential_id"
              value={form.credential_id}
              onChange={(e) => setForm(prev => ({ ...prev, credential_id: e.target.value }))}
              placeholder="ABC123XYZ"
              maxLength={100}
            />
          </div>

          {/* Credential URL */}
          <div className="space-y-2">
            <Label htmlFor="credential_url">Verification URL</Label>
            <Input
              id="credential_url"
              value={form.credential_url}
              onChange={(e) => setForm(prev => ({ ...prev, credential_url: e.target.value }))}
              placeholder="https://..."
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Link to verify your credential
            </p>
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.issue_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.issue_date ? format(form.issue_date, "MMM yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.issue_date}
                    onSelect={(date) => setForm(prev => ({ ...prev, issue_date: date }))}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.expiry_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.expiry_date ? format(form.expiry_date, "MMM yyyy") : "No expiry"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.expiry_date}
                    onSelect={(date) => setForm(prev => ({ ...prev, expiry_date: date }))}
                    disabled={(date) => 
                      form.issue_date ? date < form.issue_date : false
                    }
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? 'Saving...' : (certification ? 'Save Changes' : 'Add Certification')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
