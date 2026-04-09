-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'member');

-- Create plan enum for workspaces
CREATE TYPE public.plan_type AS ENUM ('free', 'pro', 'enterprise');

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