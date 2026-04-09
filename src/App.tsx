import { Suspense, lazy, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppThemeProvider } from "@/contexts/AppThemeContext";
import { NetworkLoadingProvider } from "@/contexts/NetworkLoadingContext";
import { OfflineProvider } from "@/contexts/OfflineContext";
import { SyncQueueProvider } from "@/contexts/SyncQueueContext";
import { CinematicModeProvider } from "@/components/showcase/effects/CinematicModeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppSplashScreen } from "@/components/brand/AppSplashScreen";
import { LazyLoadOverlay } from "@/components/ui/lazy-load-overlay";
import { usePWA } from "@/hooks/usePWA";

// Layouts - keep these eager as they're needed immediately
import { PublicLayout } from "@/layouts/PublicLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

// Public Pages - Eager load landing for performance
import Landing from "@/pages/Landing";

// Auth pages - Lazy load
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const PublicPortfolio = lazy(() => import("@/pages/PublicPortfolio"));
const ShowcasePreview = lazy(() => import("@/pages/ShowcasePreview"));
const RefundPolicy = lazy(() => import("@/pages/RefundPolicy"));
const About = lazy(() => import("@/pages/About"));

// App Pages - Lazy load all dashboard pages
const Dashboard = lazy(() => import("@/pages/app/Dashboard"));
const Portfolio = lazy(() => import("@/pages/app/Portfolio"));
const Projects = lazy(() => import("@/pages/app/Projects"));
const Experience = lazy(() => import("@/pages/app/Experience"));
const Skills = lazy(() => import("@/pages/app/Skills"));
const Certifications = lazy(() => import("@/pages/app/Certifications"));
const Content = lazy(() => import("@/pages/app/Content"));
const Themes = lazy(() => import("@/pages/app/Themes"));
const Settings = lazy(() => import("@/pages/app/Settings"));
const Preview = lazy(() => import("@/pages/app/Preview"));
const Inbox = lazy(() => import("@/pages/app/Inbox"));
const History = lazy(() => import("@/pages/app/History"));
const Welcome = lazy(() => import("@/pages/app/Welcome"));

// Admin Pages - Lazy load all admin pages
const AdminOverview = lazy(() => import("@/pages/admin/Overview"));
const AdminUsers = lazy(() => import("@/pages/admin/Users"));
const AdminWorkspaces = lazy(() => import("@/pages/admin/Workspaces"));
const AdminPayments = lazy(() => import("@/pages/admin/Payments"));
const AdminCoupons = lazy(() => import("@/pages/admin/Coupons"));
const AdminThemes = lazy(() => import("@/pages/admin/Themes"));
const AdminFeatures = lazy(() => import("@/pages/admin/Features"));
const AdminAnalytics = lazy(() => import("@/pages/admin/Analytics"));
const AdminLogs = lazy(() => import("@/pages/admin/Logs"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Suspense fallback component - shows skeleton overlay during lazy loading
function PageLoader() {
  return <LazyLoadOverlay variant="dashboard" />;
}

// Content-focused loader for auth pages
function ContentLoader() {
  return <LazyLoadOverlay variant="content" />;
}

// Inner component that can access auth context
function AppRoutes() {
  const { loading } = useAuth();

  // Show splash screen while auth is loading
  if (loading) {
    return <AppSplashScreen isLoading={true} />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Showcase Preview (public demo portfolios) */}
        <Route path="/preview/:slug" element={<ShowcasePreview />} />

        {/* Protected App Routes */}
        <Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="projects" element={<Projects />} />
          <Route path="experience" element={<Experience />} />
          <Route path="skills" element={<Skills />} />
          <Route path="certifications" element={<Certifications />} />
          <Route path="content" element={<Content />} />
          <Route path="themes" element={<Themes />} />
          <Route path="settings" element={<Settings />} />
          <Route path="history" element={<History />} />
          <Route path="preview" element={<Preview />} />
        </Route>

        {/* Welcome page for new users (outside dashboard layout) */}
        <Route path="/app/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />

        {/* Platform Admin Routes */}
        <Route path="/platform-admin" element={<ProtectedRoute requireSuperAdmin><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="workspaces" element={<AdminWorkspaces />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="themes" element={<AdminThemes />} />
          <Route path="features" element={<AdminFeatures />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="logs" element={<AdminLogs />} />
        </Route>

        {/* Admin Routes (alias for platform-admin) */}
        <Route path="/admin" element={<ProtectedRoute requireSuperAdmin><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminOverview />} />
          <Route path="dashboard" element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="workspaces" element={<AdminWorkspaces />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="themes" element={<AdminThemes />} />
          <Route path="features" element={<AdminFeatures />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="logs" element={<AdminLogs />} />
        </Route>

        {/* Public Portfolio (must be last before catch-all) */}
        <Route path="/:username" element={<PublicPortfolio />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

// PWA registration component
function PWARegistration() {
  usePWA();
  return null;
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppThemeProvider>
          <CinematicModeProvider>
            <NetworkLoadingProvider>
              <OfflineProvider>
                <SyncQueueProvider>
                  <TooltipProvider>
                    <PWARegistration />
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <AppRoutes />
                    </BrowserRouter>
                  </TooltipProvider>
                </SyncQueueProvider>
              </OfflineProvider>
            </NetworkLoadingProvider>
          </CinematicModeProvider>
        </AppThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
