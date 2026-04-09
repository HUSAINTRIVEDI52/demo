-- Create app_role enum for user roles if not exists
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create plan enum for workspaces if not exists
DO $$ BEGIN
    CREATE TYPE public.plan_type AS ENUM ('free', 'pro', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table for super admin tracking
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create super_admins table for platform admins
CREATE TABLE public.super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  plan plan_type NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspace_members table
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, workspace_id)
);

-- Create portfolios table
CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Portfolio',
  tagline TEXT,
  bio TEXT,
  avatar_url TEXT,
  theme TEXT NOT NULL DEFAULT 'minimal',
  published BOOLEAN NOT NULL DEFAULT false,
  hero_image_url TEXT,
  location TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skills table
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  proficiency INTEGER DEFAULT 80,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  project_url TEXT,
  github_url TEXT,
  technologies TEXT[],
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create experiences table
CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create certifications table
CREATE TABLE public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table for analytics
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio_sections table for visibility toggles
CREATE TABLE public.portfolio_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE NOT NULL UNIQUE,
  show_skills BOOLEAN DEFAULT true,
  show_projects BOOLEAN DEFAULT true,
  show_experience BOOLEAN DEFAULT true,
  show_certifications BOOLEAN DEFAULT true,
  show_contact BOOLEAN DEFAULT true
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_sections ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins WHERE user_id = _user_id
  )
$$;

-- Security definer function to check workspace membership
CREATE OR REPLACE FUNCTION public.is_workspace_member(_user_id UUID, _workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE user_id = _user_id AND workspace_id = _workspace_id
  )
$$;

-- Security definer function to get user's workspace IDs
CREATE OR REPLACE FUNCTION public.get_user_workspace_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT workspace_id FROM public.workspace_members WHERE user_id = _user_id
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_super_admin(auth.uid()));

-- RLS Policies for super_admins
CREATE POLICY "Super admins can view super_admins" ON public.super_admins
  FOR SELECT USING (public.is_super_admin(auth.uid()));

-- RLS Policies for workspaces
CREATE POLICY "Users can view their workspaces" ON public.workspaces
  FOR SELECT USING (public.is_workspace_member(auth.uid(), id) OR owner_id = auth.uid());

CREATE POLICY "Users can create workspaces" ON public.workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their workspaces" ON public.workspaces
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their workspaces" ON public.workspaces
  FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Super admins can view all workspaces" ON public.workspaces
  FOR SELECT USING (public.is_super_admin(auth.uid()));

-- RLS Policies for workspace_members
CREATE POLICY "Members can view workspace members" ON public.workspace_members
  FOR SELECT USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Owners can manage workspace members" ON public.workspace_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid())
  );

CREATE POLICY "Users can insert themselves as members" ON public.workspace_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can view all members" ON public.workspace_members
  FOR SELECT USING (public.is_super_admin(auth.uid()));

-- RLS Policies for portfolios
CREATE POLICY "Members can view workspace portfolios" ON public.portfolios
  FOR SELECT USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can create portfolios" ON public.portfolios
  FOR INSERT WITH CHECK (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can update portfolios" ON public.portfolios
  FOR UPDATE USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can delete portfolios" ON public.portfolios
  FOR DELETE USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Public can view published portfolios" ON public.portfolios
  FOR SELECT USING (published = true);

CREATE POLICY "Super admins can view all portfolios" ON public.portfolios
  FOR SELECT USING (public.is_super_admin(auth.uid()));

-- RLS Policies for skills
CREATE POLICY "Members can manage skills" ON public.skills
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.portfolios p WHERE p.id = portfolio_id AND public.is_workspace_member(auth.uid(), p.workspace_id))
  );

CREATE POLICY "Public can view skills of published portfolios" ON public.skills
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.portfolios p WHERE p.id = portfolio_id AND p.published = true)
  );

-- RLS Policies for projects
CREATE POLICY "Members can manage projects" ON public.projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.portfolios p WHERE p.id = portfolio_id AND public.is_workspace_member(auth.uid(), p.workspace_id))
  );

CREATE POLICY "Public can view projects of published portfolios" ON public.projects
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.portfolios p WHERE p.id = portfolio_id AND p.published = true)
  );

-- RLS Policies for experiences
CREATE POLICY "Members can manage experiences" ON public.experiences
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.portfolios p WHERE p.id = portfolio_id AND public.is_workspace_member(auth.uid(), p.workspace_id))
  );

CREATE POLICY "Public can view experiences of published portfolios" ON public.experiences
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.portfolios p WHERE p.id = portfolio_id AND p.published = true)
  );

-- RLS Policies for certifications
CREATE POLICY "Members can manage certifications" ON public.certifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.portfolios p WHERE p.id = portfolio_id AND public.is_workspace_member(auth.uid(), p.workspace_id))
  );

CREATE POLICY "Public can view certifications of published portfolios" ON public.certifications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.portfolios p WHERE p.id = portfolio_id AND p.published = true)
  );

-- RLS Policies for portfolio_sections
CREATE POLICY "Members can manage portfolio sections" ON public.portfolio_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.portfolios p WHERE p.id = portfolio_id AND public.is_workspace_member(auth.uid(), p.workspace_id))
  );

CREATE POLICY "Public can view sections of published portfolios" ON public.portfolio_sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.portfolios p WHERE p.id = portfolio_id AND p.published = true)
  );

-- RLS Policies for events
CREATE POLICY "Users can insert their own events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can view all events" ON public.events
  FOR SELECT USING (public.is_super_admin(auth.uid()));

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Create default workspace
  INSERT INTO public.workspaces (owner_id, name)
  VALUES (NEW.id, 'My Workspace')
  RETURNING id INTO new_workspace_id;
  
  -- Add user as owner of workspace
  INSERT INTO public.workspace_members (user_id, workspace_id, role)
  VALUES (NEW.id, new_workspace_id, 'owner');
  
  -- Create default portfolio
  INSERT INTO public.portfolios (workspace_id, slug, title)
  VALUES (new_workspace_id, NEW.id::text, 'My Portfolio');
  
  -- Track signup event
  INSERT INTO public.events (user_id, workspace_id, event_type, metadata)
  VALUES (NEW.id, new_workspace_id, 'user_signup', '{}');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update last login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET last_login_at = now() WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- Function to update portfolio updated_at
CREATE OR REPLACE FUNCTION public.update_portfolio_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_portfolio_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE FUNCTION public.update_portfolio_timestamp();

-- Create indexes for performance
CREATE INDEX idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace ON public.workspace_members(workspace_id);
CREATE INDEX idx_portfolios_workspace ON public.portfolios(workspace_id);
CREATE INDEX idx_portfolios_slug ON public.portfolios(slug);
CREATE INDEX idx_portfolios_published ON public.portfolios(published);
CREATE INDEX idx_events_user ON public.events(user_id);
CREATE INDEX idx_events_type ON public.events(event_type);
CREATE INDEX idx_events_created ON public.events(created_at);
CREATE INDEX idx_skills_portfolio ON public.skills(portfolio_id);
CREATE INDEX idx_projects_portfolio ON public.projects(portfolio_id);
CREATE INDEX idx_experiences_portfolio ON public.experiences(portfolio_id);
CREATE INDEX idx_certifications_portfolio ON public.certifications(portfolio_id);
-- Fix function search path for update_portfolio_timestamp
CREATE OR REPLACE FUNCTION public.update_portfolio_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add RLS policy for user_roles table
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_super_admin(auth.uid()));
-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('project-images', 'project-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- Create RLS policies for project-images bucket
CREATE POLICY "Anyone can view project images"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');

CREATE POLICY "Authenticated users can upload project images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own project images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own project images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
-- Create contact_messages table to store messages sent through portfolio contact forms
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Portfolio owners can view messages for their portfolios
CREATE POLICY "Members can view their portfolio messages"
ON public.contact_messages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM portfolios p
  WHERE p.id = contact_messages.portfolio_id
  AND is_workspace_member(auth.uid(), p.workspace_id)
));

-- Policy: Anyone can insert messages (public contact form)
CREATE POLICY "Anyone can send contact messages"
ON public.contact_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM portfolios p
    WHERE p.id = contact_messages.portfolio_id
    AND p.published = true
  )
);

-- Policy: Portfolio owners can update messages (mark as read)
CREATE POLICY "Members can update their portfolio messages"
ON public.contact_messages
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM portfolios p
  WHERE p.id = contact_messages.portfolio_id
  AND is_workspace_member(auth.uid(), p.workspace_id)
));

-- Policy: Portfolio owners can delete messages
CREATE POLICY "Members can delete their portfolio messages"
ON public.contact_messages
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM portfolios p
  WHERE p.id = contact_messages.portfolio_id
  AND is_workspace_member(auth.uid(), p.workspace_id)
));

-- Create index for faster queries
CREATE INDEX idx_contact_messages_portfolio_id ON public.contact_messages(portfolio_id);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
-- Add comprehensive project fields
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS full_description TEXT,
ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'Web App',
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS demo_video_url TEXT,
ADD COLUMN IF NOT EXISTS tools_used TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Full-Stack',
ADD COLUMN IF NOT EXISTS case_study_url TEXT,
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS team_size TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Completed',
ADD COLUMN IF NOT EXISTS problem_statement TEXT,
ADD COLUMN IF NOT EXISTS solution_summary TEXT,
ADD COLUMN IF NOT EXISTS key_achievements TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metrics TEXT,
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create trigger for automatic timestamp updates on projects
CREATE OR REPLACE FUNCTION public.update_project_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_project_timestamp();
-- Add professional experience fields
ALTER TABLE public.experiences
ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'Full-time',
ADD COLUMN IF NOT EXISTS role_summary TEXT,
ADD COLUMN IF NOT EXISTS responsibilities TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS achievements TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS technologies_used TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create trigger for automatic timestamp updates on experiences
CREATE OR REPLACE FUNCTION public.update_experience_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_experiences_updated_at ON public.experiences;

CREATE TRIGGER update_experiences_updated_at
BEFORE UPDATE ON public.experiences
FOR EACH ROW
EXECUTE FUNCTION public.update_experience_timestamp();
-- Add published field to skills table
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS published boolean DEFAULT true;

-- Add updated_at field to skills table  
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_skills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on skills
DROP TRIGGER IF EXISTS update_skills_updated_at ON public.skills;
CREATE TRIGGER update_skills_updated_at
BEFORE UPDATE ON public.skills
FOR EACH ROW
EXECUTE FUNCTION public.update_skills_updated_at();
-- Allow anonymous portfolio view events
CREATE POLICY "Allow anonymous portfolio view events"
ON public.events
FOR INSERT
WITH CHECK (
  event_type = 'portfolio_view' 
  AND user_id IS NULL
  AND workspace_id IS NOT NULL
);

-- Allow workspace members to view their own workspace events
CREATE POLICY "Members can view workspace events"
ON public.events
FOR SELECT
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
);
-- Create trigger on auth.users to handle new user signup
-- This creates workspace, profile, portfolio, and membership automatically
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also create the update_last_login trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.update_last_login();
-- Add onboarding_completed flag to workspaces table
ALTER TABLE public.workspaces 
ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;
-- Add SEO fields to portfolios table
ALTER TABLE public.portfolios
ADD COLUMN seo_title text,
ADD COLUMN seo_description text,
ADD COLUMN seo_keywords text,
ADD COLUMN og_image text;
-- Add subject field to contact_messages table
ALTER TABLE public.contact_messages
ADD COLUMN subject text;
-- Create a function to check plan limits before inserts
-- This prevents bypassing limits via direct API calls

CREATE OR REPLACE FUNCTION public.check_plan_limit_projects()
RETURNS TRIGGER AS $$
DECLARE
  workspace_plan plan_type;
  current_count INTEGER;
  max_allowed INTEGER;
  portfolio_workspace_id UUID;
BEGIN
  -- Get the workspace_id from the portfolio
  SELECT p.workspace_id INTO portfolio_workspace_id
  FROM public.portfolios p
  WHERE p.id = NEW.portfolio_id;
  
  -- Get the workspace plan
  SELECT w.plan INTO workspace_plan
  FROM public.workspaces w
  WHERE w.id = portfolio_workspace_id;
  
  -- Define limits based on plan
  CASE workspace_plan
    WHEN 'free' THEN max_allowed := 3;
    WHEN 'pro' THEN max_allowed := 1000; -- effectively unlimited
    WHEN 'enterprise' THEN max_allowed := 1000;
    ELSE max_allowed := 3;
  END CASE;
  
  -- Count existing projects for this portfolio
  SELECT COUNT(*) INTO current_count
  FROM public.projects
  WHERE portfolio_id = NEW.portfolio_id;
  
  -- Check limit
  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Plan limit reached: Maximum % projects allowed on % plan', max_allowed, workspace_plan;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_plan_limit_skills()
RETURNS TRIGGER AS $$
DECLARE
  workspace_plan plan_type;
  current_count INTEGER;
  max_allowed INTEGER;
  portfolio_workspace_id UUID;
BEGIN
  SELECT p.workspace_id INTO portfolio_workspace_id
  FROM public.portfolios p
  WHERE p.id = NEW.portfolio_id;
  
  SELECT w.plan INTO workspace_plan
  FROM public.workspaces w
  WHERE w.id = portfolio_workspace_id;
  
  CASE workspace_plan
    WHEN 'free' THEN max_allowed := 10;
    WHEN 'pro' THEN max_allowed := 1000;
    WHEN 'enterprise' THEN max_allowed := 1000;
    ELSE max_allowed := 10;
  END CASE;
  
  SELECT COUNT(*) INTO current_count
  FROM public.skills
  WHERE portfolio_id = NEW.portfolio_id;
  
  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Plan limit reached: Maximum % skills allowed on % plan', max_allowed, workspace_plan;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_plan_limit_experiences()
RETURNS TRIGGER AS $$
DECLARE
  workspace_plan plan_type;
  current_count INTEGER;
  max_allowed INTEGER;
  portfolio_workspace_id UUID;
BEGIN
  SELECT p.workspace_id INTO portfolio_workspace_id
  FROM public.portfolios p
  WHERE p.id = NEW.portfolio_id;
  
  SELECT w.plan INTO workspace_plan
  FROM public.workspaces w
  WHERE w.id = portfolio_workspace_id;
  
  CASE workspace_plan
    WHEN 'free' THEN max_allowed := 3;
    WHEN 'pro' THEN max_allowed := 1000;
    WHEN 'enterprise' THEN max_allowed := 1000;
    ELSE max_allowed := 3;
  END CASE;
  
  SELECT COUNT(*) INTO current_count
  FROM public.experiences
  WHERE portfolio_id = NEW.portfolio_id;
  
  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Plan limit reached: Maximum % experiences allowed on % plan', max_allowed, workspace_plan;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for limit enforcement
CREATE TRIGGER enforce_project_limit
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.check_plan_limit_projects();

CREATE TRIGGER enforce_skill_limit
  BEFORE INSERT ON public.skills
  FOR EACH ROW
  EXECUTE FUNCTION public.check_plan_limit_skills();

CREATE TRIGGER enforce_experience_limit
  BEFORE INSERT ON public.experiences
  FOR EACH ROW
  EXECUTE FUNCTION public.check_plan_limit_experiences();
-- Create custom_sections table
CREATE TABLE public.custom_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  visibility BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_sections ENABLE ROW LEVEL SECURITY;

-- Members can manage their custom sections
CREATE POLICY "Members can manage custom sections"
ON public.custom_sections
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM portfolios p
    WHERE p.id = custom_sections.portfolio_id
    AND is_workspace_member(auth.uid(), p.workspace_id)
  )
);

-- Public can view visible custom sections of published portfolios
CREATE POLICY "Public can view visible custom sections of published portfolios"
ON public.custom_sections
FOR SELECT
USING (
  visibility = true AND
  EXISTS (
    SELECT 1 FROM portfolios p
    WHERE p.id = custom_sections.portfolio_id
    AND p.published = true
  )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_custom_section_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_custom_sections_updated_at
  BEFORE UPDATE ON public.custom_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_custom_section_timestamp();

-- Add index for faster queries
CREATE INDEX idx_custom_sections_portfolio_id ON public.custom_sections(portfolio_id);
CREATE INDEX idx_custom_sections_display_order ON public.custom_sections(display_order);
-- Create portfolio_versions table
CREATE TABLE public.portfolio_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  snapshot_data JSONB NOT NULL,
  action_type TEXT NOT NULL DEFAULT 'manual_save',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view their workspace versions
CREATE POLICY "Members can view workspace versions"
ON public.portfolio_versions
FOR SELECT
USING (is_workspace_member(auth.uid(), workspace_id));

-- Policy: Members can create versions for their portfolios
CREATE POLICY "Members can create versions"
ON public.portfolio_versions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.portfolios p
    WHERE p.id = portfolio_versions.portfolio_id
    AND is_workspace_member(auth.uid(), p.workspace_id)
  )
);

-- Policy: Members can delete their workspace versions
CREATE POLICY "Members can delete versions"
ON public.portfolio_versions
FOR DELETE
USING (is_workspace_member(auth.uid(), workspace_id));

-- Create index for faster queries
CREATE INDEX idx_portfolio_versions_portfolio_id ON public.portfolio_versions(portfolio_id);
CREATE INDEX idx_portfolio_versions_created_at ON public.portfolio_versions(created_at DESC);

-- Function to limit versions to 10 per portfolio
CREATE OR REPLACE FUNCTION public.cleanup_old_portfolio_versions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete versions beyond the 10 most recent for this portfolio
  DELETE FROM public.portfolio_versions
  WHERE id IN (
    SELECT id FROM public.portfolio_versions
    WHERE portfolio_id = NEW.portfolio_id
    ORDER BY created_at DESC
    OFFSET 10
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-cleanup after insert
CREATE TRIGGER cleanup_portfolio_versions_trigger
AFTER INSERT ON public.portfolio_versions
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_old_portfolio_versions();
-- Add section order columns to portfolio_sections table
ALTER TABLE public.portfolio_sections
ADD COLUMN IF NOT EXISTS hero_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS about_order INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS projects_order INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS experience_order INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS skills_order INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS certifications_order INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS custom_sections_order INTEGER DEFAULT 6,
ADD COLUMN IF NOT EXISTS contact_order INTEGER DEFAULT 7;

-- Update existing rows to have default order values
UPDATE public.portfolio_sections SET
  hero_order = COALESCE(hero_order, 0),
  about_order = COALESCE(about_order, 1),
  projects_order = COALESCE(projects_order, 2),
  experience_order = COALESCE(experience_order, 3),
  skills_order = COALESCE(skills_order, 4),
  certifications_order = COALESCE(certifications_order, 5),
  custom_sections_order = COALESCE(custom_sections_order, 6),
  contact_order = COALESCE(contact_order, 7)
WHERE hero_order IS NULL OR about_order IS NULL;
-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_payments_workspace_id ON public.payments(workspace_id);
CREATE INDEX idx_payments_razorpay_order_id ON public.payments(razorpay_order_id);
CREATE INDEX idx_payments_razorpay_payment_id ON public.payments(razorpay_payment_id);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own workspace payments
CREATE POLICY "Members can view workspace payments"
ON public.payments
FOR SELECT
USING (is_workspace_member(auth.uid(), workspace_id));

-- Only system (via service role) can insert/update payments
-- This prevents frontend manipulation of payment records
CREATE POLICY "Service role can manage payments"
ON public.payments
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_portfolio_timestamp();
-- Add status column to profiles for suspend/active state
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active' 
CHECK (status IN ('active', 'suspended'));

-- Create admin action logs table for audit trail
CREATE TABLE public.admin_action_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_action_logs
ALTER TABLE public.admin_action_logs ENABLE ROW LEVEL SECURITY;

-- Only super admins can view action logs
CREATE POLICY "Super admins can view action logs"
ON public.admin_action_logs
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Only super admins can insert action logs
CREATE POLICY "Super admins can insert action logs"
ON public.admin_action_logs
FOR INSERT
WITH CHECK (is_super_admin(auth.uid()));

-- Create index for efficient querying
CREATE INDEX idx_admin_action_logs_created_at ON public.admin_action_logs(created_at DESC);
CREATE INDEX idx_admin_action_logs_target ON public.admin_action_logs(target_type, target_id);
CREATE INDEX idx_profiles_status ON public.profiles(status);

-- Add RLS policy for super admins to update profiles (for suspend/reactivate)
CREATE POLICY "Super admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (is_super_admin(auth.uid()));
-- Create coupon status enum
CREATE TYPE public.coupon_status AS ENUM ('active', 'disabled', 'expired');

-- Create coupon discount type enum
CREATE TYPE public.coupon_discount_type AS ENUM ('percentage', 'flat');

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type coupon_discount_type NOT NULL DEFAULT 'percentage',
  discount_value INTEGER NOT NULL,
  max_uses INTEGER DEFAULT NULL,
  per_user_limit INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  status coupon_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  CONSTRAINT discount_value_positive CHECK (discount_value > 0),
  CONSTRAINT percentage_max_100 CHECK (discount_type != 'percentage' OR discount_value <= 100),
  CONSTRAINT max_uses_positive CHECK (max_uses IS NULL OR max_uses > 0),
  CONSTRAINT per_user_limit_positive CHECK (per_user_limit > 0)
);

-- Create coupon usages table
CREATE TABLE public.coupon_usages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  discount_applied INTEGER NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

-- Coupons policies (super admin only for management)
CREATE POLICY "Super admins can manage coupons"
ON public.coupons
FOR ALL
USING (is_super_admin(auth.uid()));

-- Coupon usages policies
CREATE POLICY "Super admins can view all usages"
ON public.coupon_usages
FOR SELECT
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users can view their own usages"
ON public.coupon_usages
FOR SELECT
USING (auth.uid() = user_id);

-- Create indexes for efficient querying
CREATE INDEX idx_coupons_code ON public.coupons(code) WHERE deleted_at IS NULL;
CREATE INDEX idx_coupons_status ON public.coupons(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_coupon_usages_coupon ON public.coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usages_user ON public.coupon_usages(user_id);
CREATE INDEX idx_coupon_usages_workspace ON public.coupon_usages(workspace_id);

-- Auto-update updated_at trigger
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_portfolio_timestamp();

-- Function to validate coupon (used by edge function)
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_code TEXT,
  p_user_id UUID,
  p_workspace_id UUID,
  p_plan_price INTEGER
)
RETURNS TABLE (
  valid BOOLEAN,
  coupon_id UUID,
  discount_type coupon_discount_type,
  discount_value INTEGER,
  discount_amount INTEGER,
  final_amount INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon RECORD;
  v_user_usage_count INTEGER;
  v_discount_amount INTEGER;
  v_final_amount INTEGER;
BEGIN
  -- Find the coupon
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE UPPER(code) = UPPER(p_code)
    AND deleted_at IS NULL
  FOR UPDATE; -- Lock row to prevent race conditions
  
  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::coupon_discount_type, NULL::INTEGER, NULL::INTEGER, NULL::INTEGER, 'Invalid coupon code'::TEXT;
    RETURN;
  END IF;
  
  -- Check if coupon is active
  IF v_coupon.status != 'active' THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::coupon_discount_type, NULL::INTEGER, NULL::INTEGER, NULL::INTEGER, 'This coupon is no longer active'::TEXT;
    RETURN;
  END IF;
  
  -- Check expiration
  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::coupon_discount_type, NULL::INTEGER, NULL::INTEGER, NULL::INTEGER, 'This coupon has expired'::TEXT;
    RETURN;
  END IF;
  
  -- Check global usage limit
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::coupon_discount_type, NULL::INTEGER, NULL::INTEGER, NULL::INTEGER, 'This coupon has reached its usage limit'::TEXT;
    RETURN;
  END IF;
  
  -- Check per-user limit
  SELECT COUNT(*) INTO v_user_usage_count
  FROM public.coupon_usages
  WHERE coupon_id = v_coupon.id AND user_id = p_user_id;
  
  IF v_user_usage_count >= v_coupon.per_user_limit THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::coupon_discount_type, NULL::INTEGER, NULL::INTEGER, NULL::INTEGER, 'You have already used this coupon'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate discount
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount_amount := (p_plan_price * v_coupon.discount_value) / 100;
  ELSE
    v_discount_amount := v_coupon.discount_value;
  END IF;
  
  -- Ensure discount doesn't exceed plan price
  IF v_discount_amount > p_plan_price THEN
    v_discount_amount := p_plan_price;
  END IF;
  
  v_final_amount := p_plan_price - v_discount_amount;
  
  -- Ensure final amount is not negative
  IF v_final_amount < 0 THEN
    v_final_amount := 0;
  END IF;
  
  RETURN QUERY SELECT 
    true, 
    v_coupon.id, 
    v_coupon.discount_type, 
    v_coupon.discount_value, 
    v_discount_amount, 
    v_final_amount, 
    NULL::TEXT;
END;
$$;

-- Function to record coupon usage atomically
CREATE OR REPLACE FUNCTION public.use_coupon(
  p_coupon_id UUID,
  p_user_id UUID,
  p_workspace_id UUID,
  p_payment_id UUID,
  p_discount_applied INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increment used_count atomically
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE id = p_coupon_id;
  
  -- Record usage
  INSERT INTO public.coupon_usages (coupon_id, user_id, workspace_id, payment_id, discount_applied)
  VALUES (p_coupon_id, p_user_id, p_workspace_id, p_payment_id, p_discount_applied);
  
  RETURN true;
END;
$$;
-- Drop and recreate the validate_coupon function with qualified column names
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_code TEXT,
  p_plan_price INTEGER,
  p_user_id UUID,
  p_workspace_id UUID
)
RETURNS TABLE(
  valid BOOLEAN,
  coupon_id UUID,
  discount_type coupon_discount_type,
  discount_value INTEGER,
  discount_amount INTEGER,
  final_amount INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon RECORD;
  v_user_usage_count INTEGER;
  v_discount_amount INTEGER;
  v_final_amount INTEGER;
BEGIN
  -- Find the coupon
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE UPPER(coupons.code) = UPPER(p_code)
    AND coupons.deleted_at IS NULL
  FOR UPDATE; -- Lock row to prevent race conditions
  
  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::coupon_discount_type, NULL::INTEGER, NULL::INTEGER, NULL::INTEGER, 'Invalid coupon code'::TEXT;
    RETURN;
  END IF;
  
  -- Check if coupon is active
  IF v_coupon.status != 'active' THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::coupon_discount_type, NULL::INTEGER, NULL::INTEGER, NULL::INTEGER, 'This coupon is no longer active'::TEXT;
    RETURN;
  END IF;
  
  -- Check expiration
  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < now() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::coupon_discount_type, NULL::INTEGER, NULL::INTEGER, NULL::INTEGER, 'This coupon has expired'::TEXT;
    RETURN;
  END IF;
  
  -- Check global usage limit
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::coupon_discount_type, NULL::INTEGER, NULL::INTEGER, NULL::INTEGER, 'This coupon has reached its usage limit'::TEXT;
    RETURN;
  END IF;
  
  -- Check per-user limit (use table alias to avoid ambiguity)
  SELECT COUNT(*) INTO v_user_usage_count
  FROM public.coupon_usages cu
  WHERE cu.coupon_id = v_coupon.id AND cu.user_id = p_user_id;
  
  IF v_user_usage_count >= v_coupon.per_user_limit THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::coupon_discount_type, NULL::INTEGER, NULL::INTEGER, NULL::INTEGER, 'You have already used this coupon'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate discount
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount_amount := (p_plan_price * v_coupon.discount_value) / 100;
  ELSE
    v_discount_amount := v_coupon.discount_value;
  END IF;
  
  -- Ensure discount doesn't exceed plan price
  IF v_discount_amount > p_plan_price THEN
    v_discount_amount := p_plan_price;
  END IF;
  
  v_final_amount := p_plan_price - v_discount_amount;
  
  -- Ensure final amount is at least 1 (Razorpay minimum)
  IF v_final_amount < 100 THEN
    v_final_amount := 100; -- Minimum â‚¹1 (100 paise)
  END IF;
  
  -- Return valid coupon with the coupon's ID
  RETURN QUERY SELECT 
    true, 
    v_coupon.id, 
    v_coupon.discount_type, 
    v_coupon.discount_value, 
    v_discount_amount, 
    v_final_amount, 
    NULL::TEXT;
END;
$$;
-- Fix coupon validation RPC ambiguity by ensuring only ONE validate_coupon overload exists

-- Drop both existing overloads (they differ only by argument order)
DROP FUNCTION IF EXISTS public.validate_coupon(text, uuid, uuid, integer);
DROP FUNCTION IF EXISTS public.validate_coupon(text, integer, uuid, uuid);

-- Recreate a single canonical function signature
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_code text,
  p_user_id uuid,
  p_workspace_id uuid,
  p_plan_price integer
)
RETURNS TABLE (
  coupon_id uuid,
  discount_amount integer,
  discount_type public.coupon_discount_type,
  discount_value integer,
  error_message text,
  final_amount integer,
  valid boolean
)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_coupon record;
  v_user_usage_count integer := 0;
  v_discount_amount integer := 0;
  v_final_amount integer := p_plan_price;
BEGIN
  -- Normalize
  p_code := upper(trim(p_code));

  -- Lookup coupon (ignore soft-deleted)
  SELECT c.*
    INTO v_coupon
  FROM public.coupons c
  WHERE c.code = p_code
    AND c.deleted_at IS NULL
  LIMIT 1;

  IF v_coupon.id IS NULL THEN
    RETURN QUERY SELECT NULL::uuid, 0, NULL::public.coupon_discount_type, NULL::integer, 'Invalid coupon code', p_plan_price, false;
    RETURN;
  END IF;

  -- Status checks
  IF v_coupon.status <> 'active' THEN
    RETURN QUERY SELECT v_coupon.id, 0, v_coupon.discount_type, v_coupon.discount_value, 'Coupon is not active', p_plan_price, false;
    RETURN;
  END IF;

  IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at <= now() THEN
    RETURN QUERY SELECT v_coupon.id, 0, v_coupon.discount_type, v_coupon.discount_value, 'Coupon has expired', p_plan_price, false;
    RETURN;
  END IF;

  IF v_coupon.max_uses IS NOT NULL AND v_coupon.used_count >= v_coupon.max_uses THEN
    RETURN QUERY SELECT v_coupon.id, 0, v_coupon.discount_type, v_coupon.discount_value, 'Coupon usage limit reached', p_plan_price, false;
    RETURN;
  END IF;

  -- Per-user limit (scoped to this workspace)
  SELECT count(*)
    INTO v_user_usage_count
  FROM public.coupon_usages cu
  WHERE cu.coupon_id = v_coupon.id
    AND cu.user_id = p_user_id
    AND cu.workspace_id = p_workspace_id;

  IF v_user_usage_count >= v_coupon.per_user_limit THEN
    RETURN QUERY SELECT v_coupon.id, 0, v_coupon.discount_type, v_coupon.discount_value, 'You have already used this coupon', p_plan_price, false;
    RETURN;
  END IF;

  -- Compute discount
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount_amount := floor((p_plan_price * v_coupon.discount_value) / 100.0);
  ELSE
    v_discount_amount := least(v_coupon.discount_value, p_plan_price);
  END IF;

  v_final_amount := greatest(p_plan_price - v_discount_amount, 100); -- keep >= â‚¹1 (100 paise)

  RETURN QUERY
  SELECT v_coupon.id,
         v_discount_amount,
         v_coupon.discount_type,
         v_coupon.discount_value,
         NULL::text,
         v_final_amount,
         true;
END;
$$;
-- Add RLS policy for super admins to view all payments
CREATE POLICY "Super admins can view all payments"
ON public.payments
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Create index for faster payment queries
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
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
-- Add ip_address column to admin_action_logs
ALTER TABLE public.admin_action_logs
ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Add description column for better log readability
ALTER TABLE public.admin_action_logs
ADD COLUMN IF NOT EXISTS description TEXT;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_created_at ON public.admin_action_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_action_type ON public.admin_action_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_target_type ON public.admin_action_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_admin_user_id ON public.admin_action_logs(admin_user_id);

-- Ensure the table remains append-only (no update/delete policies exist, which is correct)
-- The existing RLS policies already prevent UPDATE and DELETE
-- Create OTP verification codes table
CREATE TABLE public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email_verification', 'password_reset', 'login')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Allow insert from edge functions (service role)
CREATE POLICY "Service role can manage OTP codes"
ON public.otp_codes
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_otp_codes_email_type ON public.otp_codes (email, type);
CREATE INDEX idx_otp_codes_expires_at ON public.otp_codes (expires_at);

-- Function to cleanup expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.otp_codes WHERE expires_at < now();
END;
$$;

-- Add email_verified column to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
-- Create avatars storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Create a dedicated demo/showcase table for public portfolio previews
-- This avoids foreign key issues with workspaces and auth.users

CREATE TABLE IF NOT EXISTS public.showcase_portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  tagline TEXT,
  bio TEXT,
  theme TEXT NOT NULL DEFAULT 'minimal',
  location TEXT,
  avatar_url TEXT,
  role_label TEXT, -- e.g., "Developer", "Designer", "Product Manager"
  preview_image_url TEXT, -- Screenshot/mockup of the portfolio
  projects JSONB DEFAULT '[]'::jsonb, -- Array of sample projects
  skills JSONB DEFAULT '[]'::jsonb, -- Array of sample skills
  experiences JSONB DEFAULT '[]'::jsonb, -- Array of sample experiences
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.showcase_portfolios ENABLE ROW LEVEL SECURITY;

-- Anyone can view showcase portfolios (they're public examples)
CREATE POLICY "Anyone can view showcase portfolios"
ON public.showcase_portfolios
FOR SELECT
USING (true);

-- Only super admins can manage showcase portfolios
CREATE POLICY "Super admins can manage showcase portfolios"
ON public.showcase_portfolios
FOR ALL
USING (is_super_admin(auth.uid()));

-- Insert demo showcase portfolios
INSERT INTO public.showcase_portfolios (slug, title, tagline, bio, theme, location, avatar_url, role_label, projects, skills, experiences, is_featured, display_order)
VALUES 
  (
    'demo-developer',
    'Alex Chen',
    'Full-Stack Developer | Building scalable web apps',
    'Passionate developer with 5+ years of experience building modern web applications. I love turning complex problems into elegant solutions.',
    'modern',
    'San Francisco, CA',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    'Developer',
    '[
      {"title": "E-Commerce Platform", "description": "Full-stack marketplace with real-time inventory", "technologies": ["React", "Node.js", "PostgreSQL"], "image_url": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"},
      {"title": "AI Chat Assistant", "description": "Conversational AI for customer support", "technologies": ["Python", "TensorFlow", "FastAPI"], "image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop"}
    ]'::jsonb,
    '[{"name": "React", "category": "Frontend", "proficiency": 95}, {"name": "Node.js", "category": "Backend", "proficiency": 90}, {"name": "TypeScript", "category": "Languages", "proficiency": 92}]'::jsonb,
    '[{"position": "Senior Full-Stack Developer", "company": "TechCorp Inc.", "location": "San Francisco, CA", "is_current": true}]'::jsonb,
    true,
    1
  ),
  (
    'demo-designer',
    'Maya Patel',
    'UX/UI Designer | Creating delightful experiences',
    'Design lead with expertise in user research, prototyping, and visual design. I believe great design is invisible.',
    'minimal',
    'New York, NY',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    'Designer',
    '[
      {"title": "Banking App Redesign", "description": "Modern mobile banking experience", "technologies": ["Figma", "Prototyping", "User Research"], "image_url": "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop"},
      {"title": "Design System", "description": "Enterprise component library", "technologies": ["Design Systems", "Storybook", "Tokens"], "image_url": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop"}
    ]'::jsonb,
    '[{"name": "Figma", "category": "Design Tools", "proficiency": 98}, {"name": "User Research", "category": "UX", "proficiency": 95}, {"name": "Prototyping", "category": "Design", "proficiency": 92}]'::jsonb,
    '[{"position": "Lead Product Designer", "company": "DesignHub", "location": "New York, NY", "is_current": true}]'::jsonb,
    true,
    2
  ),
  (
    'demo-pm',
    'Jordan Rivera',
    'Product Manager | Shipping products users love',
    'Product leader focused on data-driven decisions and user-centric development. Previously at startups and Fortune 500.',
    'bold',
    'Austin, TX',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    'Product Manager',
    '[
      {"title": "SaaS Analytics Dashboard", "description": "Data-driven product insights platform", "technologies": ["Product Strategy", "Analytics", "A/B Testing"], "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop"},
      {"title": "Mobile App Launch", "description": "From 0 to 100K users in 6 months", "technologies": ["Go-to-Market", "User Growth", "Roadmapping"], "image_url": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop"}
    ]'::jsonb,
    '[{"name": "Product Strategy", "category": "Product", "proficiency": 95}, {"name": "Data Analysis", "category": "Analytics", "proficiency": 88}, {"name": "Roadmapping", "category": "Product", "proficiency": 92}]'::jsonb,
    '[{"position": "Senior Product Manager", "company": "ScaleUp Tech", "location": "Austin, TX", "is_current": true}]'::jsonb,
    true,
    3
  );
