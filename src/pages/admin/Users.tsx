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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Eye, Ban, CheckCircle, LogOut, ChevronLeft, ChevronRight, ExternalLink, Globe, Monitor } from 'lucide-react';
import { SectionLoader } from '@/components/brand/LogoSpinner';
import { format } from 'date-fns';
import { UserDetailDialog } from '@/components/admin/UserDetailDialog';
import { ConfirmActionDialog } from '@/components/admin/ConfirmActionDialog';
import { useAdminActions } from '@/hooks/useAdminActions';

interface Profile {
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

interface UserWithPortfolio extends Profile {
  portfolio_slug?: string;
  portfolio_published?: boolean;
}

const PAGE_SIZE = 20;

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [actionUser, setActionUser] = useState<UserWithPortfolio | null>(null);
  const [actionType, setActionType] = useState<'suspend' | 'reactivate' | 'logout' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { suspendUser, reactivateUser, logAction } = useAdminActions();

  useEffect(() => {
    fetchUsers();
  }, [page, searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (searchQuery.trim()) {
      query = query.or(`email.ilike.%${searchQuery}%,id.eq.${searchQuery}`);
    }

    const { data, count, error } = await query;
    
    if (!error && data) {
      // Fetch portfolio info for each user
      const userIds = data.map(u => u.id);
      
      // Get workspace memberships
      const { data: memberships } = await supabase
        .from('workspace_members')
        .select('user_id, workspace_id')
        .in('user_id', userIds);
      
      if (memberships && memberships.length > 0) {
        const workspaceIds = [...new Set(memberships.map(m => m.workspace_id))];
        
        // Get portfolios
        const { data: portfolios } = await supabase
          .from('portfolios')
          .select('workspace_id, slug, published')
          .in('workspace_id', workspaceIds);
        
        // Map users with portfolio info
        const usersWithPortfolio: UserWithPortfolio[] = data.map(user => {
          const userMembership = memberships.find(m => m.user_id === user.id);
          const portfolio = userMembership 
            ? portfolios?.find(p => p.workspace_id === userMembership.workspace_id)
            : null;
          
          return {
            ...(user as unknown as Profile),
            portfolio_slug: portfolio?.slug,
            portfolio_published: portfolio?.published,
          };
        });
        
        setUsers(usersWithPortfolio);
      } else {
        setUsers(data.map(u => u as unknown as UserWithPortfolio));
      }
      
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    setDetailOpen(true);
  };

  const handleAction = (user: UserWithPortfolio, action: 'suspend' | 'reactivate' | 'logout') => {
    setActionUser(user);
    setActionType(action);
  };

  const confirmAction = async () => {
    if (!actionUser || !actionType) return;
    setActionLoading(true);

    let success = false;
    
    if (actionType === 'suspend') {
      success = await suspendUser(actionUser.id, actionUser.email);
    } else if (actionType === 'reactivate') {
      success = await reactivateUser(actionUser.id, actionUser.email);
    } else if (actionType === 'logout') {
      // Force logout is logged but actual session invalidation requires admin API
      await logAction({
        actionType: 'force_logout',
        targetType: 'user',
        targetId: actionUser.id,
        details: { email: actionUser.email },
      });
      success = true;
    }

    if (success) {
      fetchUsers();
    }

    setActionLoading(false);
    setActionUser(null);
    setActionType(null);
  };

  // Parse OS from user agent
  const parseOS = (userAgent: string | null, deviceOs: string | null): string => {
    if (deviceOs) return deviceOs;
    if (!userAgent) return '-';
    
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Other';
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Users</h1>
        <span className="text-sm text-muted-foreground">{totalCount} total users</span>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by email or user ID..."
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
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <SectionLoader />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Portfolio</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>IP / OS</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.email}</p>
                          {user.full_name && (
                            <p className="text-xs text-muted-foreground">{user.full_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.portfolio_slug ? (
                          user.portfolio_published ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1"
                              asChild
                            >
                              <a
                                href={`/${user.portfolio_slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View
                              </a>
                            </Button>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Draft</Badge>
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.last_login_at ? format(new Date(user.last_login_at), 'MMM d, yyyy') : '-'}
                          {user.last_login_at && (
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(user.last_login_at), 'HH:mm')}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            <span className="font-mono">{user.last_ip_address || '-'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Monitor className="h-3 w-3 text-muted-foreground" />
                            <span>{parseOS(user.last_user_agent, user.last_device_os)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(user.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {user.portfolio_published && user.portfolio_slug && (
                              <DropdownMenuItem asChild>
                                <a
                                  href={`/${user.portfolio_slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View Portfolio
                                </a>
                              </DropdownMenuItem>
                            )}
                            {user.status === 'active' ? (
                              <DropdownMenuItem 
                                onClick={() => handleAction(user, 'suspend')}
                                className="text-destructive"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Suspend User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleAction(user, 'reactivate')}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Reactivate User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleAction(user, 'logout')}>
                              <LogOut className="mr-2 h-4 w-4" />
                              Force Logout
                            </DropdownMenuItem>
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

      {/* User Detail Dialog */}
      <UserDetailDialog
        userId={selectedUserId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {/* Confirm Action Dialog */}
      <ConfirmActionDialog
        open={!!actionType}
        onOpenChange={(open) => !open && setActionType(null)}
        title={
          actionType === 'suspend' ? 'Suspend User' :
          actionType === 'reactivate' ? 'Reactivate User' :
          'Force Logout User'
        }
        description={
          actionType === 'suspend' 
            ? `Are you sure you want to suspend ${actionUser?.email}? They will not be able to log in until reactivated.`
            : actionType === 'reactivate'
            ? `Are you sure you want to reactivate ${actionUser?.email}? They will be able to log in again.`
            : `Are you sure you want to force logout ${actionUser?.email}? This will invalidate their current sessions.`
        }
        actionLabel={
          actionType === 'suspend' ? 'Suspend' :
          actionType === 'reactivate' ? 'Reactivate' :
          'Force Logout'
        }
        variant={actionType === 'suspend' ? 'destructive' : 'default'}
        loading={actionLoading}
        onConfirm={confirmAction}
      />
    </div>
  );
}
