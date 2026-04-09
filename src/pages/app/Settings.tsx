import { useState, useEffect } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useEventTracking } from '@/hooks/useEventTracking';
import { usePortfolioVersions } from '@/hooks/usePortfolioVersions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Globe, Eye, Briefcase, Code, Award, Mail, Zap, Search, Crown, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { SectionLoader } from '@/components/brand/LogoSpinner';
import { PlanBadge } from '@/components/plan/PlanBadge';
import { UpgradeModal } from '@/components/plan/UpgradeModal';
import { toast } from 'sonner';
import { BRAND } from '@/config/branding';

export default function Settings() {
  const { portfolio, sections, loading, updatePortfolio, updateSections } = useWorkspace();
  const { plan, planFeatures } = usePlanLimits();
  const { trackEvent } = useEventTracking();
  const { createSnapshot } = usePortfolioVersions();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState('');
  const [published, setPublished] = useState(false);
  
  // SEO fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [ogImage, setOgImage] = useState('');
  
  // Section visibility states
  const [showProjects, setShowProjects] = useState(true);
  const [showExperience, setShowExperience] = useState(true);
  const [showSkills, setShowSkills] = useState(true);
  const [showCertifications, setShowCertifications] = useState(true);
  const [showContact, setShowContact] = useState(true);

  useEffect(() => {
    if (portfolio) {
      setSlug(portfolio.slug || '');
      setPublished(portfolio.published || false);
      setSeoTitle(portfolio.seo_title || '');
      setSeoDescription(portfolio.seo_description || '');
      setSeoKeywords(portfolio.seo_keywords || '');
      setOgImage(portfolio.og_image || '');
    }
  }, [portfolio]);

  useEffect(() => {
    if (sections) {
      setShowProjects(sections.show_projects ?? true);
      setShowExperience(sections.show_experience ?? true);
      setShowSkills(sections.show_skills ?? true);
      setShowCertifications(sections.show_certifications ?? true);
      setShowContact(sections.show_contact ?? true);
    }
  }, [sections]);

  // Validate OG image URL format
  const validateOgImageUrl = (url: string): boolean => {
    if (!url) return true; // Empty is valid
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  // Validate slug format
  const validateSlug = (slug: string): boolean => {
    if (!slug) return false;
    return /^[a-z0-9-]+$/.test(slug) && slug.length >= 2 && slug.length <= 50;
  };

  const handleSave = async () => {
    // Prevent double-submit
    if (saving) return;

    // Client-side validation
    if (!validateSlug(slug)) {
      toast.error('Invalid slug. Use only lowercase letters, numbers, and hyphens (2-50 characters).');
      return;
    }

    if (ogImage && !validateOgImageUrl(ogImage)) {
      toast.error('Invalid OG image URL. Please use a valid https:// URL.');
      return;
    }

    if (seoTitle && seoTitle.length > 60) {
      toast.error('SEO title should be 60 characters or less.');
      return;
    }

    if (seoDescription && seoDescription.length > 160) {
      toast.error('Meta description should be 160 characters or less.');
      return;
    }

    setSaving(true);
    
    try {
      // Update portfolio settings including SEO
      const { error: portfolioError, data: portfolioData } = await updatePortfolio({ 
        slug, 
        published,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        seo_keywords: seoKeywords || null,
        og_image: ogImage || null,
      });
      
      if (portfolioError) {
        console.error('[Settings] Portfolio update failed:', portfolioError);
        const errorMessage = typeof portfolioError === 'string' 
          ? portfolioError 
          : (portfolioError as any)?.message || 'Unknown error';
        toast.error(`Failed to save portfolio settings: ${errorMessage}`);
        setSaving(false);
        return;
      }

      // Update section visibility
      const { error: sectionsError } = await updateSections({
        show_projects: showProjects,
        show_experience: showExperience,
        show_skills: showSkills,
        show_certifications: showCertifications,
        show_contact: showContact,
      });
      
      if (sectionsError) {
        console.error('[Settings] Sections update failed:', sectionsError);
        const errorMessage = typeof sectionsError === 'string' 
          ? sectionsError 
          : (sectionsError as any)?.message || 'Unknown error';
        toast.error(`Failed to save section settings: ${errorMessage}`);
        setSaving(false);
        return;
      }

      // Create version snapshot on successful save
      const publishChanged = published !== portfolio?.published;
      try {
        await createSnapshot(publishChanged ? 'publish_change' : 'settings_save');
      } catch (snapshotError) {
        // Log but don't fail the save operation
        console.warn('[Settings] Snapshot creation failed:', snapshotError);
      }
      
      toast.success('Settings saved successfully');
      
      // Only track publish event if status actually changed
      if (publishChanged) {
        trackEvent('portfolio_publish', { published });
      }
      
      // Only track section toggle if any section actually changed
      const sectionsChanged = 
        showProjects !== (sections?.show_projects ?? true) ||
        showExperience !== (sections?.show_experience ?? true) ||
        showSkills !== (sections?.show_skills ?? true) ||
        showCertifications !== (sections?.show_certifications ?? true) ||
        showContact !== (sections?.show_contact ?? true);
      
      if (sectionsChanged) {
        trackEvent('section_toggle', {
          show_projects: showProjects,
          show_experience: showExperience,
          show_skills: showSkills,
          show_certifications: showCertifications,
          show_contact: showContact,
        });
      }
    } catch (err: unknown) {
      console.error('[Settings] Unexpected save error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      toast.error(`Save failed: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SectionLoader />;
  }

  const sectionToggles = [
    { key: 'projects', label: 'Projects', description: 'Show your portfolio projects', icon: Code, checked: showProjects, onChange: setShowProjects },
    { key: 'experience', label: 'Experience', description: 'Show your work experience', icon: Briefcase, checked: showExperience, onChange: setShowExperience },
    { key: 'skills', label: 'Skills', description: 'Show your skills and proficiencies', icon: Zap, checked: showSkills, onChange: setShowSkills },
    { key: 'certifications', label: 'Certifications', description: 'Show your certifications and credentials', icon: Award, checked: showCertifications, onChange: setShowCertifications },
    { key: 'contact', label: 'Contact', description: 'Show contact information and form', icon: Mail, checked: showContact, onChange: setShowContact },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Configure your portfolio settings.</p>
      </div>

      {/* Plan & Billing Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Plan & Billing
            </div>
            <PlanBadge plan={plan} />
          </CardTitle>
          <CardDescription>Manage your subscription and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="font-medium mb-1">{planFeatures.displayName} Plan</p>
            <p className="text-sm text-muted-foreground">{planFeatures.description}</p>
          </div>
          
          {plan !== 'pro' && (
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-accent-foreground mb-1">Upgrade to Pro</p>
                  <p className="text-sm text-muted-foreground">
                    Unlock unlimited projects, all themes, advanced SEO, and more.
                  </p>
                </div>
                <Button 
                  onClick={() => setUpgradeModalOpen(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex-shrink-0"
                >
                  Upgrade
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
          
          {plan === 'pro' && (
            <p className="text-sm text-muted-foreground">
              You have full access to all features. Thank you for being a {planFeatures.displayName} member!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Watermark Preview Card - Only show for free users */}
      {plan === 'free' && (
        <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Watermark Preview
            </CardTitle>
            <CardDescription>
              Free portfolios display a "Made with {BRAND.shortName}" badge
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Watermark Preview Box */}
            <div className="relative p-6 rounded-lg bg-card border border-border overflow-hidden min-h-[120px]">
              {/* Mock portfolio content */}
              <div className="space-y-2 opacity-50">
                <div className="h-3 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
              </div>
              
              {/* Watermark Badge Preview */}
              <div className="absolute bottom-3 right-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/90 backdrop-blur-md border border-border/50 shadow-lg">
                  <div className="h-5 w-5 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Made with{' '}
                    <span className="font-semibold text-foreground">{BRAND.shortName}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Info & CTA */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <div className="p-1.5 rounded-full bg-amber-500/10">
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">This badge appears on all free portfolios</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upgrade to remove the watermark and unlock premium features
                </p>
              </div>
            </div>

            {/* Benefits of upgrading */}
            <div className="grid gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Upgrade benefits</p>
              <div className="grid gap-1.5">
                {[
                  'No watermark on your portfolio',
                  'Access to all premium themes',
                  'Advanced SEO controls',
                  'Unlimited projects & skills',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={() => setUpgradeModalOpen(true)}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <Crown className="h-4 w-4 mr-2" />
              Remove Watermark
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Portfolio URL
          </CardTitle>
          <CardDescription>Your unique portfolio address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Username / Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} />
            <p className="text-sm text-muted-foreground">Your portfolio will be at: /{slug}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
          <CardDescription>Control who can see your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Publish Portfolio</p>
              <p className="text-sm text-muted-foreground">Make your portfolio visible to the public</p>
            </div>
            <Switch checked={published} onCheckedChange={setPublished} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Section Visibility
          </CardTitle>
          <CardDescription>Choose which sections appear on your public portfolio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sectionToggles.map((section) => (
            <div key={section.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-muted">
                  <section.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{section.label}</p>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>
              <Switch checked={section.checked} onCheckedChange={section.onChange} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Settings
          </CardTitle>
          <CardDescription>Control how your portfolio appears in search engines and social shares</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seo-title">SEO Title</Label>
            <Input 
              id="seo-title" 
              value={seoTitle} 
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={portfolio?.title || 'Your portfolio title'}
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">{seoTitle.length}/60 characters (recommended)</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="seo-description">Meta Description</Label>
            <Textarea 
              id="seo-description" 
              value={seoDescription} 
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder={portfolio?.tagline || 'A brief description of your portfolio'}
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{seoDescription.length}/160 characters (recommended)</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="seo-keywords">Keywords (optional)</Label>
            <Input 
              id="seo-keywords" 
              value={seoKeywords} 
              onChange={(e) => setSeoKeywords(e.target.value)}
              placeholder="developer, portfolio, react, typescript"
            />
            <p className="text-xs text-muted-foreground">Comma-separated keywords</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="og-image">Social Share Image URL (optional)</Label>
            <Input 
              id="og-image" 
              value={ogImage} 
              onChange={(e) => setOgImage(e.target.value)}
              placeholder="https://yourdomain.com/og-image.jpg"
            />
            <p className="text-xs text-muted-foreground">Recommended size: 1200x630 pixels</p>
          </div>

          {/* Preview Card */}
          <div className="mt-6 p-4 border border-border rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Social Share Preview</p>
            <div className="border border-border rounded-lg overflow-hidden bg-card">
              {(ogImage || portfolio?.hero_image_url) && (
                <div className="h-32 bg-muted flex items-center justify-center overflow-hidden">
                  <img 
                    src={ogImage || portfolio?.hero_image_url || ''} 
                    alt="OG Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="p-3">
                <p className="font-medium text-sm truncate">
                  {seoTitle || portfolio?.title || 'Portfolio Title'}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {seoDescription || portfolio?.tagline || 'Portfolio description will appear here'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {typeof window !== 'undefined' ? window.location.host : ''}/{slug}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent/90 text-accent-foreground">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        {saving ? 'Saving...' : 'Save Settings'}
      </Button>

      <UpgradeModal 
        open={upgradeModalOpen} 
        onOpenChange={setUpgradeModalOpen}
        trigger="general"
      />
    </div>
  );
}
