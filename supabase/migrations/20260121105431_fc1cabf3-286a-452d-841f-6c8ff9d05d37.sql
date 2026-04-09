
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
