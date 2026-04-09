import { Suspense } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { BRAND } from '@/config/branding';
import { PremiumBackground } from '@/components/premium/PremiumBackground';
import { ThemeSwitcher } from '@/components/premium/ThemeSwitcher';

import { useAuth } from '@/contexts/AuthContext';
import { useOffline } from '@/contexts/OfflineContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AnimatePresence } from 'framer-motion';
import { NavigationProgress } from '@/components/ui/navigation-progress';
import { ConnectionStatusIndicator } from '@/components/ui/network-aware-loader';
import { OfflineBanner } from '@/components/ui/offline-indicator';

// Public content skeleton for lazy loading
function PublicContentSkeleton() {
  return (
    <div className="container py-12 animate-in fade-in duration-200">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-10 w-64 mx-auto rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-96 mx-auto rounded bg-muted animate-pulse" />
        <div className="pt-8 space-y-4">
          <div className="h-12 w-full rounded-xl bg-muted animate-pulse" />
          <div className="h-12 w-full rounded-xl bg-muted animate-pulse" />
          <div className="h-12 w-full rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function PublicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { isOffline, retryConnection, isReconnecting } = useOffline();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (email: string | undefined) => {
    return email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation Progress Bar */}
      <NavigationProgress color="gradient" />

      {/* Premium Background */}
      <PremiumBackground variant={isAuthPage ? 'subtle' : 'hero'} />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/30 bg-card/30 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {/* Navigation links can be added here */}
          </nav>

          <div className="flex items-center gap-3">
            <ConnectionStatusIndicator 
              onRetry={isOffline ? retryConnection : undefined}
              isRetrying={isReconnecting}
            />
            <ThemeSwitcher />
            
            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="flex items-center gap-2 px-2"
                        aria-label="User menu"
                      >
                        <Avatar className="h-8 w-8 border-2 border-accent/30">
                          <AvatarFallback className="bg-accent/20 text-accent text-sm font-medium">
                            {getInitials(user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
                          {user.email?.split('@')[0]}
                        </span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-border/50">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium truncate">
                          {user.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/app/dashboard')} className="cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/app/settings')} className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : !isAuthPage && (
                  <>
                    <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20" asChild>
                      <Link to="/register">Get Started</Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content with Transition */}
      <main className="flex-1 relative z-10">
        {/* Offline Banner for non-auth pages */}
        <AnimatePresence>
          {isOffline && !isAuthPage && (
            <div className="container pt-4">
              <OfflineBanner 
                onRetry={retryConnection}
                isRetrying={isReconnecting}
              />
            </div>
          )}
        </AnimatePresence>
        
        <Suspense fallback={<PublicContentSkeleton />}>
          <Outlet />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 bg-card/30 backdrop-blur-xl relative z-10">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <Logo size="sm" />
            </div>
            <p className="text-sm text-muted-foreground">
              {BRAND.copyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
