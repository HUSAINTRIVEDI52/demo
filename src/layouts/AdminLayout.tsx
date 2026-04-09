import { Suspense } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOffline } from '@/contexts/OfflineContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Shield,
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  ArrowLeft,
  LogOut,
  Tag,
  CreditCard,
  Palette,
  Settings,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PremiumBackground } from '@/components/premium/PremiumBackground';
import { ThemeSwitcher } from '@/components/premium/ThemeSwitcher';

import { NavigationProgress } from '@/components/ui/navigation-progress';
import { ConnectionStatusIndicator } from '@/components/ui/network-aware-loader';
import { OfflineBanner } from '@/components/ui/offline-indicator';
import { AnimatePresence } from 'framer-motion';

// Admin content skeleton for lazy loading
function AdminContentSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-10 w-24 rounded-xl bg-muted animate-pulse" />
      </div>
      <div className="rounded-2xl border border-border/50 bg-card/30 p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg">
              <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-48 rounded bg-muted animate-pulse" />
                <div className="h-3 w-32 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-8 w-20 rounded-lg bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
const adminLinks = [
  { to: '/platform-admin', icon: LayoutDashboard, label: 'Overview' },
  { to: '/platform-admin/users', icon: Users, label: 'Users' },
  { to: '/platform-admin/workspaces', icon: Building2, label: 'Workspaces' },
  { to: '/platform-admin/payments', icon: CreditCard, label: 'Payments' },
  { to: '/platform-admin/coupons', icon: Tag, label: 'Coupons' },
  { to: '/platform-admin/themes', icon: Palette, label: 'Themes' },
  { to: '/platform-admin/features', icon: Settings, label: 'Features' },
  { to: '/platform-admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/platform-admin/logs', icon: FileText, label: 'Logs' },
];

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const { isOffline, retryConnection, isReconnecting } = useOffline();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const userInitials = user?.email?.charAt(0).toUpperCase() ?? 'A';

  return (
    <div className="min-h-screen flex bg-background">
      {/* Navigation Progress Bar */}
      <NavigationProgress color="primary" />

      {/* Premium Background */}
      <PremiumBackground variant="subtle" />

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border/50 bg-card/30 backdrop-blur-xl relative z-10">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-warning to-warning/60 flex items-center justify-center shadow-lg shadow-warning/20">
              <Shield className="h-4 w-4 text-warning-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-warning text-warning-foreground shadow-md shadow-warning/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/80'
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 border-border/50 bg-card/50 hover:bg-card"
            asChild
          >
            <Link to="/app/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-16 border-b border-border/50 bg-card/30 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <div className="lg:hidden flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-warning to-warning/60 flex items-center justify-center">
                <Shield className="h-4 w-4 text-warning-foreground" />
              </div>
              <span className="font-display text-lg font-bold">Admin</span>
            </div>
            <h1 className="hidden lg:block text-lg font-semibold font-display">
              Platform Admin
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ConnectionStatusIndicator 
              onRetry={isOffline ? retryConnection : undefined}
              isRetrying={isReconnecting}
            />
            <ThemeSwitcher />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-xl border border-border/50 bg-card/50">
                  <Avatar className="h-9 w-9 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-warning text-warning-foreground text-sm font-medium">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-border/50">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">{user?.email}</p>
                    <p className="text-xs text-warning">Super Admin</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem asChild>
                  <Link to="/app/dashboard" className="cursor-pointer">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to App
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Mobile Nav */}
        <div className="lg:hidden border-b border-border/50 bg-card/30 backdrop-blur-xl overflow-x-auto">
          <nav className="flex p-2 gap-1">
            {adminLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                    isActive
                      ? 'bg-warning text-warning-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/80'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Offline Banner */}
          <AnimatePresence>
            {isOffline && (
              <OfflineBanner 
                onRetry={retryConnection}
                isRetrying={isReconnecting}
                className="mb-4"
              />
            )}
          </AnimatePresence>
          
          <Suspense fallback={<AdminContentSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
