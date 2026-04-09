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