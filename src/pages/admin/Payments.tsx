import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Search,
  IndianRupee,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from 'lucide-react';
import { SectionLoader } from '@/components/brand/LogoSpinner';
import { format } from 'date-fns';
import {
  useAdminPayments,
  usePaymentCount,
  useRevenueStats,
  type PaymentRecord,
} from '@/hooks/useAdminPayments';
import { PaymentDetailDialog } from '@/components/admin/PaymentDetailDialog';

const PAGE_SIZE = 10;

export default function AdminPayments() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: payments, isLoading } = useAdminPayments({
    page,
    pageSize: PAGE_SIZE,
    statusFilter,
    searchQuery,
    dateFrom,
    dateTo,
  });

  const { data: totalCount } = usePaymentCount(statusFilter, dateFrom, dateTo);
  const { data: stats, isLoading: statsLoading } = useRevenueStats();

  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE);

  const formatAmount = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;

  const statusColors: Record<string, string> = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  const handleViewPayment = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setDetailOpen(true);
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setDateFrom(null);
    setDateTo(null);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Payments & Revenue</h1>
      </div>

      {/* Revenue Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">
                {statsLoading ? '...' : formatAmount(stats?.totalRevenue || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">
                {statsLoading ? '...' : formatAmount(stats?.monthRevenue || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold">
                {statsLoading ? '...' : formatAmount(stats?.todayRevenue || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{statsLoading ? '...' : stats?.successCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed / Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold">
                {statsLoading ? '...' : `${stats?.failedCount} / ${stats?.pendingCount}`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, payment ID, or order ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as typeof statusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            {/* Date From */}
            <Input
              type="date"
              placeholder="From"
              value={dateFrom || ''}
              onChange={(e) => {
                setDateFrom(e.target.value || null);
                setPage(1);
              }}
              className="w-[150px]"
            />

            {/* Date To */}
            <Input
              type="date"
              placeholder="To"
              value={dateTo || ''}
              onChange={(e) => {
                setDateTo(e.target.value || null);
                setPage(1);
              }}
              className="w-[150px]"
            />

            <Button variant="outline" onClick={handleClearFilters}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SectionLoader />
          ) : !payments?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              No payments found matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Coupon</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">
                        {payment.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {payment.user_email || 'N/A'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatAmount(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[payment.status] || ''}>
                          {payment.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {payment.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                          {payment.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.coupon_code ? (
                          <Badge variant="secondary" className="font-mono text-xs">
                            {payment.coupon_code}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(payment.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPayment(payment)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({totalCount} total)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <PaymentDetailDialog
        payment={selectedPayment}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
