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