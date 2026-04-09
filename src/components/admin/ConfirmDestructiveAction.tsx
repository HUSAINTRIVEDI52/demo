import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDestructiveActionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string; // Text user must type to confirm (default: "CONFIRM")
  actionLabel?: string; // Button label (default: "Confirm")
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
}

export function ConfirmDestructiveAction({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'CONFIRM',
  actionLabel = 'Confirm',
  isLoading = false,
  variant = 'danger',
}: ConfirmDestructiveActionProps) {
  const [inputValue, setInputValue] = useState('');
  
  const isConfirmed = inputValue.toUpperCase() === confirmText.toUpperCase();

  const handleConfirm = async () => {
    if (!isConfirmed) return;
    await onConfirm();
    setInputValue('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setInputValue('');
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              variant === 'danger' ? 'bg-destructive/10' : 'bg-amber-100'
            }`}>
              <AlertTriangle className={`h-5 w-5 ${
                variant === 'danger' ? 'text-destructive' : 'text-amber-600'
              }`} />
            </div>
            <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <Label htmlFor="confirm-input" className="text-sm text-muted-foreground">
            Type <span className="font-mono font-semibold text-foreground">{confirmText}</span> to confirm
          </Label>
          <Input
            id="confirm-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Type ${confirmText} here`}
            className="mt-2"
            autoComplete="off"
            disabled={isLoading}
          />
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={!isConfirmed || isLoading}
          >
            {isLoading ? 'Processing...' : actionLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
