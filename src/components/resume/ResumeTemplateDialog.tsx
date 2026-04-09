import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, FileDown, Check } from 'lucide-react';
import { RESUME_TEMPLATES, ResumeTemplate } from '@/lib/resume-templates';
import { cn } from '@/lib/utils';

interface ResumeTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (template: ResumeTemplate) => Promise<void>;
  exporting: boolean;
}

export function ResumeTemplateDialog({
  open,
  onOpenChange,
  onExport,
  exporting,
}: ResumeTemplateDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>('classic');

  const handleExport = async () => {
    await onExport(selectedTemplate);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Resume Template</DialogTitle>
          <DialogDescription>
            Select a layout style for your PDF resume export
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {RESUME_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={cn(
                'relative flex items-start gap-4 rounded-lg border p-4 text-left transition-all hover:bg-accent/50',
                selectedTemplate === template.id
                  ? 'border-primary bg-accent/30 ring-1 ring-primary'
                  : 'border-border'
              )}
            >
              <span className="text-2xl">{template.preview}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{template.name}</span>
                  {selectedTemplate === template.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
