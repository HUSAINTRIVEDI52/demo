import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Calendar, FileText, CreditCard, ExternalLink, User } from 'lucide-react';
import { LogoSpinner } from '@/components/brand/LogoSpinner';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface WorkspaceDetailDialogProps {
  workspaceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WorkspaceDetails {
  id: string;
  name: string;
  plan: string;
  created_at: string;
  owner_id: string;
  onboarding_completed: boolean;
}

interface OwnerInfo {
  id: string;
  email: string;
  full_name: string | null;
  status: string;
}

interface PortfolioInfo {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  theme: string;
  created_at: string;
  updated_at: string;
}

interface PaymentInfo {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

interface UsageStats {
  projects: number;
  skills: number;
  experiences: number;
  certifications: number;
}

export function WorkspaceDetailDialog({ workspaceId, open, onOpenChange }: WorkspaceDetailDialogProps) {
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<WorkspaceDetails | null>(null);
  const [owner, setOwner] = useState<OwnerInfo | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioInfo | null>(null);
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [usage, setUsage] = useState<UsageStats>({ projects: 0, skills: 0, experiences: 0, certifications: 0 });

  useEffect(() => {
    if (workspaceId && open) {
      fetchWorkspaceDetails();
    }
  }, [workspaceId, open]);

  const fetchWorkspaceDetails = async () => {
    if (!workspaceId) return;
    setLoading(true);

    // Fetch workspace
    const { data: wsData } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single();

    if (wsData) {
      setWorkspace(wsData as WorkspaceDetails);

      // Fetch owner
      const { data: ownerData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', wsData.owner_id)
        .single();
      
      if (ownerData) {
        setOwner(ownerData as OwnerInfo);
      }

      // Fetch portfolio
      const { data: portfolioData } = await supabase
        .from('portfolios')
        .select('*')
        .eq('workspace_id', workspaceId)
        .single();

      if (portfolioData) {
        setPortfolio(portfolioData as PortfolioInfo);

        // Fetch usage stats
        const [projects, skills, experiences, certifications] = await Promise.all([
          supabase.from('projects').select('id', { count: 'exact', head: true }).eq('portfolio_id', portfolioData.id),
          supabase.from('skills').select('id', { count: 'exact', head: true }).eq('portfolio_id', portfolioData.id),
          supabase.from('experiences').select('id', { count: 'exact', head: true }).eq('portfolio_id', portfolioData.id),
          supabase.from('certifications').select('id', { count: 'exact', head: true }).eq('portfolio_id', portfolioData.id),
        ]);

        setUsage({
          projects: projects.count || 0,
          skills: skills.count || 0,
          experiences: experiences.count || 0,
          certifications: certifications.count || 0,
        });
      }

      // Fetch payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(10);

      setPayments((paymentsData as PaymentInfo[]) || []);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Workspace Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LogoSpinner size="md" />
          </div>
        ) : workspace ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Workspace</h3>
              <div className="flex items-center justify-between">
                <span className="font-medium text-lg">{workspace.name}</span>
                <Badge variant={workspace.plan === 'pro' ? 'default' : 'secondary'}>
                  {workspace.plan}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Created {format(new Date(workspace.created_at), 'MMM d, yyyy')}
              </div>
              <p className="text-xs text-muted-foreground font-mono">ID: {workspace.id}</p>
            </div>

            <Separator />

            {/* Owner */}
            {owner && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" /> Owner
                </h3>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{owner.email}</span>
                    </div>
                    <Badge variant={owner.status === 'active' ? 'outline' : 'destructive'}>
                      {owner.status}
                    </Badge>
                  </div>
                  {owner.full_name && (
                    <p className="text-sm mt-1">{owner.full_name}</p>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Portfolio */}
            {portfolio ? (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Portfolio
                </h3>
                <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{portfolio.title}</span>
                    <Badge variant={portfolio.published ? 'default' : 'secondary'}>
                      {portfolio.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Theme: {portfolio.theme}</span>
                    <span>Updated: {format(new Date(portfolio.updated_at), 'MMM d, yyyy')}</span>
                  </div>
                  {portfolio.published && (
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <a href={`/${portfolio.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Portfolio
                      </a>
                    </Button>
                  )}
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  <div className="p-2 rounded border text-center">
                    <p className="text-lg font-bold">{usage.projects}</p>
                    <p className="text-xs text-muted-foreground">Projects</p>
                  </div>
                  <div className="p-2 rounded border text-center">
                    <p className="text-lg font-bold">{usage.skills}</p>
                    <p className="text-xs text-muted-foreground">Skills</p>
                  </div>
                  <div className="p-2 rounded border text-center">
                    <p className="text-lg font-bold">{usage.experiences}</p>
                    <p className="text-xs text-muted-foreground">Experiences</p>
                  </div>
                  <div className="p-2 rounded border text-center">
                    <p className="text-lg font-bold">{usage.certifications}</p>
                    <p className="text-xs text-muted-foreground">Certs</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No portfolio found</p>
            )}

            <Separator />

            {/* Payment History */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Payment History ({payments.length})
              </h3>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payments found</p>
              ) : (
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div key={payment.id} className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-sm">
                          {payment.currency} {(payment.amount / 100).toFixed(2)}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payment.created_at), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                      <Badge variant={payment.status === 'success' ? 'default' : 'destructive'}>
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Workspace not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
