-- Add background_style column to portfolios table
-- Values: 'animated' (default), 'static', 'none'
ALTER TABLE public.portfolios 
ADD COLUMN background_style TEXT NOT NULL DEFAULT 'animated' 
CHECK (background_style IN ('animated', 'static', 'none'));