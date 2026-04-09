-- Create platform_themes table to track theme availability
CREATE TABLE public.platform_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  access_level TEXT NOT NULL DEFAULT 'free' CHECK (access_level IN ('free', 'pro')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create platform_features table for feature flags
CREATE TABLE public.platform_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_themes
CREATE POLICY "Anyone can read enabled themes"
ON public.platform_themes FOR SELECT
USING (true);

CREATE POLICY "Super admins can manage themes"
ON public.platform_themes FOR ALL
USING (is_super_admin(auth.uid()));

-- RLS Policies for platform_features
CREATE POLICY "Anyone can read features"
ON public.platform_features FOR SELECT
USING (true);

CREATE POLICY "Super admins can manage features"
ON public.platform_features FOR ALL
USING (is_super_admin(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_platform_themes_updated_at
BEFORE UPDATE ON public.platform_themes
FOR EACH ROW
EXECUTE FUNCTION public.update_portfolio_timestamp();

CREATE TRIGGER update_platform_features_updated_at
BEFORE UPDATE ON public.platform_features
FOR EACH ROW
EXECUTE FUNCTION public.update_portfolio_timestamp();

-- Seed default themes (all 8 themes)
INSERT INTO public.platform_themes (theme_id, name, enabled, access_level) VALUES
  ('minimal', 'Minimal', true, 'free'),
  ('modern', 'Modern', true, 'free'),
  ('bold', 'Bold', true, 'pro'),
  ('cyberpunk', 'Cyberpunk Terminal', true, 'pro'),
  ('corporate', 'Corporate Executive', true, 'pro'),
  ('neon-creative', 'Neon Creative', true, 'pro'),
  ('editorial', 'Editorial Minimal', true, 'pro'),
  ('warm-sunset', 'Warm Sunset', true, 'pro');

-- Seed default feature flags
INSERT INTO public.platform_features (feature_key, name, description, enabled) VALUES
  ('resume_export', 'Resume / PDF Export', 'Allow users to export their portfolio as a PDF resume', true),
  ('analytics', 'Analytics', 'Show portfolio analytics and insights to users', true),
  ('contact_inbox', 'Contact Inbox', 'Enable contact form and message inbox for portfolios', true),
  ('custom_sections', 'Custom Sections', 'Allow users to create custom portfolio sections', true),
  ('preview_mode', 'Preview Mode', 'Allow users to preview their portfolio before publishing', true);

-- Create indexes for performance
CREATE INDEX idx_platform_themes_enabled ON public.platform_themes(enabled);
CREATE INDEX idx_platform_themes_theme_id ON public.platform_themes(theme_id);
CREATE INDEX idx_platform_features_enabled ON public.platform_features(enabled);
CREATE INDEX idx_platform_features_feature_key ON public.platform_features(feature_key);