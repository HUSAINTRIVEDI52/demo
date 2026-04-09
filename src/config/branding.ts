/**
 * Make Portfolio Branding Configuration
 * 
 * Centralized branding constants for consistent application-wide usage.
 * Update these values to change branding across the entire application.
 */

export const BRAND = {
  // Core Brand Identity
  name: 'Make Portfolio',
  shortName: 'Make Portfolio',
  tagline: 'Build portfolios that get you noticed',
  description: 'Create stunning professional portfolios in minutes. Showcase your projects, experience, and skills with beautiful themes designed to impress.',
  
  // Domain & URLs
  domain: 'makeportfolios.com',
  url: 'https://makeportfolios.com',
  
  // Contact & Support
  supportEmail: 'support@makeportfolios.com',
  salesEmail: 'sales@makeportfolios.com',
  
  // Legal
  copyright: `© ${new Date().getFullYear()} Make Portfolio. All rights reserved.`,
  footerTagline: 'Build stunning portfolios.',
  
  // SEO Defaults
  seo: {
    defaultTitle: 'Make Portfolio - Professional Portfolio Builder',
    defaultDescription: 'Build and showcase your professional portfolio with Make Portfolio. Create stunning portfolios in minutes with beautiful themes.',
    defaultKeywords: 'portfolio builder, professional portfolio, online portfolio, showcase work, career portfolio',
  },
  
  // Payment Gateway
  payment: {
    merchantName: 'Make Portfolio',
    productDescription: 'Pro Plan Upgrade',
  },
  
  // PDF Export Watermark
  watermark: 'Made with Make Portfolio',
} as const;

/**
 * Get the canonical URL for a portfolio
 * Uses the configured domain in production, falls back to window.location.origin
 */
export function getCanonicalUrl(path: string = ''): string {
  // In production, always use the configured domain
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // Check if we're on the production domain
    if (origin.includes(BRAND.domain)) {
      return `${BRAND.url}${path}`;
    }
    // For preview/development, use the current origin
    return `${origin}${path}`;
  }
  // SSR fallback
  return `${BRAND.url}${path}`;
}

/**
 * Get portfolio URL with proper domain
 */
export function getPortfolioUrl(slug: string): string {
  return getCanonicalUrl(`/${slug}`);
}
