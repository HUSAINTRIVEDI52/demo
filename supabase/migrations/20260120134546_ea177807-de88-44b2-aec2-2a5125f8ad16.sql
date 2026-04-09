-- Add onboarding_completed flag to workspaces table
ALTER TABLE public.workspaces 
ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;