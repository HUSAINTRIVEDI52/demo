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