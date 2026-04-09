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