import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { UpgradeModal } from './UpgradeModal';

interface UpgradeBannerProps {
  message?: string;
  compact?: boolean;
  trigger?: 'projects' | 'skills' | 'experiences' | 'themes' | 'seo' | 'general';
}

export function UpgradeBanner({ message = 'Upgrade to Pro to unlock more', compact = false, trigger = 'general' }: UpgradeBannerProps) {
  const [modalOpen, setModalOpen] = useState(false);

  if (compact) {
    return (
      <>
        <Badge 
          variant="secondary" 
          className="gap-1 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 cursor-pointer hover:bg-amber-200 dark:hover:bg-amber-900/50"
          onClick={() => setModalOpen(true)}
        >
          <Crown className="h-3 w-3" />
          Pro
        </Badge>
        <UpgradeModal open={modalOpen} onOpenChange={setModalOpen} trigger={trigger} />
      </>
    );
  }
  
  return (
    <>
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {message}
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex-shrink-0"
        >
          <Crown className="h-3.5 w-3.5 mr-1.5" />
          Upgrade
        </Button>
      </div>
      <UpgradeModal open={modalOpen} onOpenChange={setModalOpen} trigger={trigger} />
    </>
  );
}
