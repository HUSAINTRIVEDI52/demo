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