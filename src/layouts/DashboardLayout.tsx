import { Suspense, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PageTransition } from '@/components/ui/page-transition';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useOffline } from '@/contexts/OfflineContext';
import { useRoutePreload } from '@/hooks/useRoutePreload';
import { useSyncQueueContext } from '@/contexts/SyncQueueContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useScrollPersistence, getMobileMenuState, saveMobileMenuState } from '@/hooks/useScrollPersistence';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Briefcase,
  Award,
  Zap,
  Palette,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  Menu,
  X,
  Inbox,
  FileText,
  History,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Logo, LogoIcon } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';
import { BRAND } from '@/config/branding';
import { PremiumBackground } from '@/components/premium/PremiumBackground';
import { ThemeToggle } from '@/components/premium/ThemeSwitcher';
import { AnimatePresence, motion } from 'framer-motion';
import { NavigationProgress } from '@/components/ui/navigation-progress';
import { InlineSuspenseSkeleton, ConnectionStatusIndicator } from '@/components/ui/network-aware-loader';
import { OfflineBanner } from '@/components/ui/offline-indicator';
import { SyncStatusIndicator } from '@/components/ui/sync-status-indicator';
import { BackToTopButton } from '@/components/ui/back-to-top-button';

// Dashboard content skeleton for lazy loading
function DashboardContentSkeleton() {
  // Simple static skeleton - no animate-pulse to avoid mobile lag
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-muted/60" />
          <div className="h-4 w-72 rounded bg-muted/60" />
        </div>
        <div className="h-10 w-28 rounded-xl bg-muted/60" />
      </div>
      
      {/* Content cards skeleton */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-6 space-y-4">
        <div className="h-5 w-32 rounded bg-muted/60" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-16 rounded bg-muted/60" />
                <div className="h-3 w-12 rounded bg-muted/60" />
              </div>
              <div className="h-2 w-full rounded-full bg-muted/60" />
            </div>
          ))}
        </div>
      </div>
      
      {/* More content skeleton */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-muted/60" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-muted/60 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-3/4 rounded bg-muted/60" />
                <div className="h-3 w-1/2 rounded bg-muted/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
const sidebarLinks = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/inbox', icon: Inbox, label: 'Inbox', showBadge: true },
  { to: '/app/portfolio', icon: User, label: 'Portfolio' },
  { to: '/app/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/app/experience', icon: Briefcase, label: 'Experience' },
  { to: '/app/skills', icon: Zap, label: 'Skills' },
  { to: '/app/certifications', icon: Award, label: 'Certifications' },
  { to: '/app/content', icon: FileText, label: 'Custom Sections' },
  { to: '/app/themes', icon: Palette, label: 'Themes' },
  { to: '/app/history', icon: History, label: 'Version History' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
];

export function DashboardLayout() {
  const { user, signOut, isSuperAdmin } = useAuth();
  const { portfolio } = useWorkspace();
  const { unreadCount } = useUnreadMessages();
  const { isOffline, retryConnection, isReconnecting } = useOffline();
  const { handleMouseEnter, handleMouseLeave, preloadAdjacentRoutes } = useRoutePreload();
  const { pendingCount, failedCount, isSyncing, lastSyncAt, syncNow } = useSyncQueueContext();
  const { isOnline } = useNetworkStatus();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Persist mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(() => getMobileMenuState());
  
  const handleMobileMenuToggle = useCallback((isOpen: boolean) => {
    setMobileMenuOpen(isOpen);
    saveMobileMenuState(isOpen);
  }, []);
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved === 'true';
    }
    return false;
  });

  // Persist sidebar state
  const handleSidebarToggle = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, []);
  
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Use scroll persistence hook
  const scrollPersistenceRef = useScrollPersistence();
  const mainContentRef = useRef<HTMLElement>(null);
  
  // Combine refs for scroll persistence and progress tracking
  const setMainContentRef = useCallback((element: HTMLElement | null) => {
    (mainContentRef as React.MutableRefObject<HTMLElement | null>).current = element;
    (scrollPersistenceRef as React.MutableRefObject<HTMLElement | null>).current = element;
  }, [scrollPersistenceRef]);

  // Track scroll progress
  const handleScroll = useCallback(() => {
    const element = mainContentRef.current;
    if (!element) return;
    
    const { scrollTop, scrollHeight, clientHeight } = element;
    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    setScrollProgress(Math.min(100, Math.max(0, progress)));
  }, []);

  // Handle click on progress track to jump to position
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const element = mainContentRef.current;
    if (!element) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const percentage = clickY / rect.height;
    
    const { scrollHeight, clientHeight } = element;
    const maxScroll = scrollHeight - clientHeight;
    const targetScroll = percentage * maxScroll;
    
    element.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  }, []);

  // Reset scroll progress on route change
  useEffect(() => {
    setScrollProgress(0);
  }, [location.pathname]);

  // Preload adjacent routes when the current page loads
  useEffect(() => {
    preloadAdjacentRoutes(location.pathname);
  }, [location.pathname, preloadAdjacentRoutes]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const userInitials = user?.email?.charAt(0).toUpperCase() ?? 'U';

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Navigation Progress Bar */}
      <NavigationProgress color="accent" />

      {/* Premium Background */}
      <PremiumBackground variant="subtle" />

      {/* Desktop Sidebar - Fixed, doesn't scroll */}
      <aside className={cn(
        'hidden lg:flex flex-col border-r border-border/50 bg-card/30 backdrop-blur-xl transition-all duration-300 relative z-10 h-screen overflow-y-auto',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}>
        {/* Scroll Progress Track - clickable to jump to position */}
        <div
          className="absolute right-0 top-0 w-3 h-full z-20 cursor-pointer group"
          onClick={handleProgressClick}
          title="Click to jump to position"
        >
          {/* Track background - visible on hover */}
          <div className="absolute right-0 top-0 w-1 h-full bg-border/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
          
          {/* Progress indicator */}
          <motion.div
            className="absolute right-0 top-0 w-1 bg-accent/80 rounded-full pointer-events-none"
            initial={{ height: 0 }}
            animate={{ height: `${scrollProgress}%` }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            style={{ 
              boxShadow: scrollProgress > 0 ? '0 0 8px hsl(var(--accent))' : 'none',
              opacity: scrollProgress > 0 ? 1 : 0
            }}
          />
        </div>
        <div className={cn(
          'p-6 border-b border-border/50 flex items-center',
          sidebarCollapsed ? 'justify-center' : 'justify-between'
        )}>
          <Link to="/" className="flex items-center">
            {sidebarCollapsed ? (
              <LogoIcon />
            ) : (
              <Logo size="md" />
            )}
          </Link>
          {!sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSidebarToggle(true)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {sidebarCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleSidebarToggle(false)}
            className="mx-auto mt-4 h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        <nav className={cn('flex-1 p-4 space-y-1', sidebarCollapsed && 'px-2')}>
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const showBadge = link.showBadge && unreadCount > 0;
            return (
              <Link
                key={link.to}
                to={link.to}
                onMouseEnter={() => handleMouseEnter(link.to)}
                onMouseLeave={handleMouseLeave}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  sidebarCollapsed && 'justify-center px-0',
                  isActive
                    ? 'bg-accent text-accent-foreground shadow-md shadow-accent/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/80'
                )}
                title={sidebarCollapsed ? link.label : undefined}
              >
                <link.icon className={cn('h-5 w-5', isActive && 'text-accent-foreground')} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{link.label}</span>
                    {showBadge && (
                      <Badge className="h-5 min-w-5 px-1.5 text-xs bg-accent/20 text-accent border-0">
                        {unreadCount}
                      </Badge>
                    )}
                  </>
                )}
                {sidebarCollapsed && showBadge && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        {isSuperAdmin && (
          <div className={cn('p-4 border-t border-border/50', sidebarCollapsed && 'px-2')}>
            <Link
              to="/platform-admin"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-warning hover:bg-warning/10 transition-all',
                sidebarCollapsed && 'justify-center px-0'
              )}
              title={sidebarCollapsed ? 'Platform Admin' : undefined}
            >
              <Shield className="h-5 w-5" />
              {!sidebarCollapsed && 'Platform Admin'}
            </Link>
          </div>
        )}

        {portfolio && (
          <div className={cn('p-4 border-t border-border/50', sidebarCollapsed && 'px-2')}>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'w-full gap-2 border-border/50 bg-card/50 hover:bg-card',
                sidebarCollapsed ? 'justify-center px-0' : 'justify-start'
              )}
              asChild
            >
              <a
                href={`/${portfolio.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                title={sidebarCollapsed ? 'View Portfolio' : undefined}
              >
                <ExternalLink className="h-4 w-4" />
                {!sidebarCollapsed && 'View Portfolio'}
              </a>
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-16 border-b border-border/50 bg-card/30 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => handleMobileMenuToggle(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-lg font-semibold font-display">
              {sidebarLinks.find((l) => l.to === location.pathname)?.label ?? 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <SyncStatusIndicator
              isOnline={isOnline}
              pendingCount={pendingCount}
              failedCount={failedCount}
              isSyncing={isSyncing}
              lastSyncAt={lastSyncAt}
              onSync={syncNow}
            />
            <ConnectionStatusIndicator 
              onRetry={isOffline ? retryConnection : undefined}
              isRetrying={isReconnecting}
            />
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-xl border border-border/50 bg-card/50">
                  <Avatar className="h-9 w-9 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-accent text-accent-foreground text-sm font-medium">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-border/50">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {isSuperAdmin ? 'Super Admin' : 'Member'}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem asChild>
                  <Link to="/app/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm" onClick={() => handleMobileMenuToggle(false)}>
            <nav className="fixed left-0 top-16 bottom-0 w-72 bg-card/95 backdrop-blur-xl border-r border-border/50 p-4 space-y-1 animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
              {sidebarLinks.map((link) => {
                const isActive = location.pathname === link.to;
                const showBadge = link.showBadge && unreadCount > 0;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onMouseEnter={() => handleMouseEnter(link.to)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleMobileMenuToggle(false)}
                    className={cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-card'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </span>
                    {showBadge && (
                      <Badge className="h-5 min-w-5 px-1.5 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                );
              })}
              
              {isSuperAdmin && (
                <Link
                  to="/platform-admin"
                  onClick={() => handleMobileMenuToggle(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-warning hover:bg-warning/10 transition-all"
                >
                  <Shield className="h-5 w-5" />
                  Platform Admin
                </Link>
              )}
            </nav>
          </div>
        )}

        {/* Page Content with Transition - This area scrolls */}
        <main 
          ref={setMainContentRef}
          onScroll={handleScroll}
          className="flex-1 p-4 lg:p-6 overflow-y-auto"
        >
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
          
          <Suspense fallback={<DashboardContentSkeleton />}>
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </Suspense>
        </main>

        {/* Back to Top Button */}
        <BackToTopButton scrollContainer={mainContentRef} />
      </div>
    </div>
  );
}
