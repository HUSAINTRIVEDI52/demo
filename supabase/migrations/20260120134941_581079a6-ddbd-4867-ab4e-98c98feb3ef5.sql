-- Add SEO fields to portfolios table
ALTER TABLE public.portfolios
ADD COLUMN seo_title text,
ADD COLUMN seo_description text,
ADD COLUMN seo_keywords text,
ADD COLUMN og_image text;