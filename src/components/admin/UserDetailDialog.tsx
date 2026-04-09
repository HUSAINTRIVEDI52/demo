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
import { Mail, Calendar, Clock, Building2, FileText, CreditCard, Globe, Monitor, ExternalLink } from 'lucide-react';
import { LogoSpinner } from '@/components/brand/LogoSpinner';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface UserDetailDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserDetails {
  id: string;
  email: string;
  full_name: string | null;
  status: string;
  created_at: string;
  last_login_at: string | null;
  last_ip_address: string | null;
  last_device_os: string | null;
  last_user_agent: string | null;
}

interface WorkspaceInfo {
  id: string;
  name: string;
  plan: string;
  created_at: string;
  portfolio?: {
    id: string;
    title: string;
    slug: string;
    published: boolean;
  };
}

interface PaymentInfo {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export function UserDetailDialog({ userId, open, onOpenChange }: UserDetailDialogProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [payments, setPayments] = useState<PaymentInfo[]>([]);

  useEffect(() => {
    if (userId && open) {
      fetchUserDetails();
    }
  }, [userId, open]);

  const fetchUserDetails = async () => {
    if (!userId) return;
    setLoading(true);

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      setUser(profile as unknown as UserDetails);
    }

    // Fetch user's workspaces via workspace_members
    const { data: memberships } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', userId);

    if (memberships && memberships.length > 0) {
      const workspaceIds = memberships.map((m) => m.workspace_id);
      
      const { data: workspacesData } = await supabase
        .from('workspaces')
        .select('*')
        .in('id', workspaceIds);

      if (workspacesData) {
        // Get portfolios for each workspace
        const { data: portfoliosData } = await supabase
          .from('portfolios')
          .select('id, title, slug, published, workspace_id')
          .in('workspace_id', workspaceIds);

        const workspacesWithPortfolios = workspacesData.map((ws) => ({
          ...ws,
          portfolio: portfoliosData?.find((p) => p.workspace_id === ws.id),
        }));

        setWorkspaces(workspacesWithPortfolios as WorkspaceInfo[]);

        // Get payments for workspaces
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('*')
          .in('workspace_id', workspaceIds)
          .order('created_at', { ascending: false })
          .limit(10);

        setPayments((paymentsData as PaymentInfo[]) || []);
      }
    }

    setLoading(false);
  };

  // Parse OS from user agent
  const parseOS = (userAgent: string | null, deviceOs: string | null): string => {
    if (deviceOs) return deviceOs;
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Unknown';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LogoSpinner size="md" />
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Profile</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                    {user.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Last login: {user.last_login_at 
                      ? format(new Date(user.last_login_at), 'MMM d, yyyy HH:mm') 
                      : 'Never'}
                  </span>
                </div>
              </div>
              {user.full_name && (
                <p className="text-sm"><strong>Name:</strong> {user.full_name}</p>
              )}
              <p className="text-xs text-muted-foreground font-mono">ID: {user.id}</p>
            </div>

            <Separator />

            {/* Device & Location Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Last Session Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    IP: {user.last_ip_address || 'Not tracked'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    OS: {parseOS(user.last_user_agent, user.last_device_os)}
                  </span>
                </div>
              </div>
              {user.last_user_agent && (
                <p className="text-xs text-muted-foreground truncate" title={user.last_user_agent}>
                  User Agent: {user.last_user_agent}
                </p>
              )}
            </div>

            <Separator />

            {/* Workspaces */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Workspaces ({workspaces.length})
              </h3>
              {workspaces.length === 0 ? (
                <p className="text-sm text-muted-foreground">No workspaces found</p>
              ) : (
                <div className="space-y-2">
                  {workspaces.map((ws) => (
                    <div key={ws.id} className="p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{ws.name}</span>
                        <Badge variant={ws.plan === 'pro' ? 'default' : 'secondary'}>
                          {ws.plan}
                        </Badge>
                      </div>
                      {ws.portfolio && (
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            <span>{ws.portfolio.title}</span>
                            <Badge variant={ws.portfolio.published ? 'outline' : 'secondary'} className="text-xs">
                              {ws.portfolio.published ? 'Published' : 'Draft'}
                            </Badge>
                          </div>
                          {ws.portfolio.published && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              asChild
                            >
                              <a
                                href={`/${ws.portfolio.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

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
          <p className="text-muted-foreground">User not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
}