import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  FileText,
  User,
  Building2,
  Tag,
  CreditCard,
  Settings,
  Palette,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';

const PAGE_SIZE = 20;

const actionTypeLabels: Record<string, string> = {
  user_suspend: 'User Suspend',
  user_reactivate: 'User Reactivate',
  workspace_plan_upgrade: 'Plan Upgrade',
  workspace_plan_downgrade: 'Plan Downgrade',
  coupon_create: 'Coupon Create',
  coupon_edit: 'Coupon Edit',
  coupon_disable: 'Coupon Disable',
  manual_pro_assignment: 'Manual Pro Assignment',
  theme_enable: 'Theme Enable',
  theme_disable: 'Theme Disable',
  theme_access_change: 'Theme Access Change',
  feature_enable: 'Feature Enable',
  feature_disable: 'Feature Disable',
  forced_unpublish: 'Forced Unpublish',
  payment_override: 'Payment Override',
};

const targetTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  user: User,
  workspace: Building2,
  coupon: Tag,
  payment: CreditCard,
  system: Settings,
  theme: Palette,
  feature: Shield,
};

const actionTypeColors: Record<string, string> = {
  user_suspend: 'bg-destructive/10 text-destructive',
  user_reactivate: 'bg-green-100 text-green-700',
  workspace_plan_upgrade: 'bg-blue-100 text-blue-700',
  workspace_plan_downgrade: 'bg-amber-100 text-amber-700',
  coupon_create: 'bg-green-100 text-green-700',
  coupon_edit: 'bg-blue-100 text-blue-700',
  coupon_disable: 'bg-destructive/10 text-destructive',
  manual_pro_assignment: 'bg-purple-100 text-purple-700',
  theme_enable: 'bg-green-100 text-green-700',
  theme_disable: 'bg-destructive/10 text-destructive',
  theme_access_change: 'bg-blue-100 text-blue-700',
  feature_enable: 'bg-green-100 text-green-700',
  feature_disable: 'bg-destructive/10 text-destructive',
  forced_unpublish: 'bg-destructive/10 text-destructive',
  payment_override: 'bg-amber-100 text-amber-700',
};

interface AdminLog {
  id: string;
  admin_user_id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  description: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  admin_email?: string;
}

export default function AdminLogs() {
  const [page, setPage] = useState(0);
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch logs with pagination
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-logs', page, actionTypeFilter, targetTypeFilter, searchQuery],
    queryFn: async () => {
      // First get the logs
      let query = supabase
        .from('admin_action_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (actionTypeFilter !== 'all') {
        query = query.eq('action_type', actionTypeFilter);
      }

      if (targetTypeFilter !== 'all') {
        query = query.eq('target_type', targetTypeFilter);
      }

      const { data: logs, error, count } = await query;

      if (error) throw error;

      // Fetch admin emails for the logs
      const adminIds = [...new Set((logs || []).map(log => log.admin_user_id))];
      
      let adminEmails: Record<string, string> = {};
      if (adminIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', adminIds);
        
        if (profiles) {
          adminEmails = profiles.reduce((acc, p) => {
            acc[p.id] = p.email;
            return acc;
          }, {} as Record<string, string>);
        }
      }

      // Enrich logs with admin emails
      const enrichedLogs = (logs || []).map(log => ({
        ...log,
        admin_email: adminEmails[log.admin_user_id] || 'Unknown',
      }));

      // Filter by search query (client-side for description/email)
      let filteredLogs = enrichedLogs;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredLogs = enrichedLogs.filter(log => 
          log.admin_email?.toLowerCase().includes(query) ||
          log.description?.toLowerCase().includes(query) ||
          log.target_id?.toLowerCase().includes(query)
        );
      }

      return {
        logs: filteredLogs as AdminLog[],
        totalCount: count || 0,
      };
    },
    staleTime: 30000,
  });

  const totalPages = Math.ceil((data?.totalCount || 0) / PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load admin logs</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-amber-900 mb-2">Admin Logs</h1>
        <p className="text-muted-foreground">
          Audit trail of all administrative actions. Logs are append-only and cannot be modified.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by admin email, description, or target ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Action type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {Object.entries(actionTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Target type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Targets</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="workspace">Workspace</SelectItem>
                <SelectItem value="coupon">Coupon</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="theme">Theme</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Action Logs
          </CardTitle>
          <CardDescription>
            {data?.totalCount || 0} total log entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No logs found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.logs.map((log) => {
                  const TargetIcon = targetTypeIcons[log.target_type] || Settings;
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.admin_email}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={actionTypeColors[log.action_type] || 'bg-muted'}
                        >
                          {actionTypeLabels[log.action_type] || log.action_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TargetIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm capitalize">{log.target_type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {log.description || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {log.ip_address || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-amber-50/50 border-amber-200">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">Audit Trail Security</h4>
              <p className="text-sm text-amber-700 mt-1">
                All admin actions are logged automatically and cannot be modified or deleted. 
                IP addresses are captured for security auditing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
