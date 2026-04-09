import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Eye, ArrowUpCircle, ArrowDownCircle, EyeOff, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionLoader } from '@/components/brand/LogoSpinner';
import { format } from 'date-fns';
import { ConfirmActionDialog } from '@/components/admin/ConfirmActionDialog';
import { WorkspaceDetailDialog } from '@/components/admin/WorkspaceDetailDialog';
import { useAdminActions } from '@/hooks/useAdminActions';

interface Workspace {
  id: string;
  name: string;
  plan: string;
  created_at: string;
  owner_id: string;
  owner?: {
    email: string;
    full_name: string | null;
  };
  portfolio?: {
    id: string;
    title: string;
    slug: string;
    published: boolean;
  };
}

const PAGE_SIZE = 20;

export default function AdminWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [actionWorkspace, setActionWorkspace] = useState<Workspace | null>(null);
  const [actionType, setActionType] = useState<'upgrade' | 'downgrade' | 'unpublish' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { upgradeWorkspace, downgradeWorkspace, forceUnpublishPortfolio } = useAdminActions();

  useEffect(() => {
    fetchWorkspaces();
  }, [page, searchQuery]);

  const fetchWorkspaces = async () => {
    setLoading(true);

    // Get count first
    const { count } = await supabase
      .from('workspaces')
      .select('*', { count: 'exact', head: true });

    setTotalCount(count || 0);

    // Fetch workspaces
    let query = supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data: workspacesData } = await query;

    if (workspacesData && workspacesData.length > 0) {
      // Fetch owners
      const ownerIds = [...new Set(workspacesData.map((ws) => ws.owner_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', ownerIds);

      // Fetch portfolios
      const workspaceIds = workspacesData.map((ws) => ws.id);
      const { data: portfolios } = await supabase
        .from('portfolios')
        .select('id, title, slug, published, workspace_id')
        .in('workspace_id', workspaceIds);

      // Combine data
      const enrichedWorkspaces = workspacesData.map((ws) => ({
        ...ws,
        owner: profiles?.find((p) => p.id === ws.owner_id),
        portfolio: portfolios?.find((p) => p.workspace_id === ws.id),
      }));

      // Filter by search if needed
      let filtered = enrichedWorkspaces;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = enrichedWorkspaces.filter((ws) =>
          ws.owner?.email?.toLowerCase().includes(query) ||
          ws.id.includes(query) ||
          ws.name.toLowerCase().includes(query)
        );
      }

      setWorkspaces(filtered as Workspace[]);
    } else {
      setWorkspaces([]);
    }

    setLoading(false);
  };

  const handleViewDetails = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    setDetailOpen(true);
  };

  const handleAction = (workspace: Workspace, action: 'upgrade' | 'downgrade' | 'unpublish') => {
    setActionWorkspace(workspace);
    setActionType(action);
  };

  const confirmAction = async () => {
    if (!actionWorkspace || !actionType) return;
    setActionLoading(true);

    let success = false;

    if (actionType === 'upgrade') {
      success = await upgradeWorkspace(actionWorkspace.id, actionWorkspace.name);
    } else if (actionType === 'downgrade') {
      success = await downgradeWorkspace(actionWorkspace.id, actionWorkspace.name);
    } else if (actionType === 'unpublish' && actionWorkspace.portfolio) {
      success = await forceUnpublishPortfolio(actionWorkspace.portfolio.id, actionWorkspace.portfolio.slug);
    }

    if (success) {
      fetchWorkspaces();
    }

    setActionLoading(false);
    setActionWorkspace(null);
    setActionType(null);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Workspaces</h1>
        <span className="text-sm text-muted-foreground">{totalCount} total workspaces</span>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by owner email or workspace ID..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0);
          }}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <SectionLoader />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workspace</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Portfolio Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workspaces.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No workspaces found
                    </TableCell>
                  </TableRow>
                ) : (
                  workspaces.map((ws) => (
                    <TableRow key={ws.id}>
                      <TableCell className="font-medium">{ws.name}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{ws.owner?.email || '-'}</p>
                          {ws.owner?.full_name && (
                            <p className="text-xs text-muted-foreground">{ws.owner.full_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ws.plan === 'pro' ? 'default' : 'secondary'}>
                          {ws.plan}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ws.portfolio ? (
                          <Badge variant={ws.portfolio.published ? 'outline' : 'secondary'}>
                            {ws.portfolio.published ? 'Published' : 'Draft'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No portfolio</span>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(ws.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(ws.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {ws.portfolio?.published && (
                              <DropdownMenuItem asChild>
                                <a
                                  href={`/${ws.portfolio.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Preview Portfolio
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {ws.plan === 'free' ? (
                              <DropdownMenuItem onClick={() => handleAction(ws, 'upgrade')}>
                                <ArrowUpCircle className="mr-2 h-4 w-4 text-green-600" />
                                Upgrade to Pro
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleAction(ws, 'downgrade')}>
                                <ArrowDownCircle className="mr-2 h-4 w-4" />
                                Downgrade to Free
                              </DropdownMenuItem>
                            )}
                            {ws.portfolio?.published && (
                              <DropdownMenuItem
                                onClick={() => handleAction(ws, 'unpublish')}
                                className="text-destructive"
                              >
                                <EyeOff className="mr-2 h-4 w-4" />
                                Force Unpublish
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Workspace Detail Dialog */}
      <WorkspaceDetailDialog
        workspaceId={selectedWorkspaceId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {/* Confirm Action Dialog */}
      <ConfirmActionDialog
        open={!!actionType}
        onOpenChange={(open) => !open && setActionType(null)}
        title={
          actionType === 'upgrade' ? 'Upgrade Workspace' :
          actionType === 'downgrade' ? 'Downgrade Workspace' :
          'Force Unpublish Portfolio'
        }
        description={
          actionType === 'upgrade'
            ? `Are you sure you want to upgrade "${actionWorkspace?.name}" to Pro plan? This is a manual upgrade without payment.`
            : actionType === 'downgrade'
            ? `Are you sure you want to downgrade "${actionWorkspace?.name}" to Free plan? They will lose access to Pro features.`
            : `Are you sure you want to force unpublish the portfolio for "${actionWorkspace?.name}"? It will no longer be publicly accessible.`
        }
        actionLabel={
          actionType === 'upgrade' ? 'Upgrade' :
          actionType === 'downgrade' ? 'Downgrade' :
          'Unpublish'
        }
        variant={actionType === 'unpublish' ? 'destructive' : 'default'}
        loading={actionLoading}
        onConfirm={confirmAction}
      />
    </div>
  );
}
