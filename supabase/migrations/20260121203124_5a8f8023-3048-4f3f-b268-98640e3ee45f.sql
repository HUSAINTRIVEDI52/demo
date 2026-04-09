-- Add email, phone, and custom social links to portfolios table
ALTER TABLE public.portfolios
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS dribbble_url TEXT,
ADD COLUMN IF NOT EXISTS behance_url TEXT,
ADD COLUMN IF NOT EXISTS medium_url TEXT,
ADD COLUMN IF NOT EXISTS custom_social_label TEXT,
ADD COLUMN IF NOT EXISTS custom_social_url TEXT;