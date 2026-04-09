-- Add ip_address column to admin_action_logs
ALTER TABLE public.admin_action_logs
ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Add description column for better log readability
ALTER TABLE public.admin_action_logs
ADD COLUMN IF NOT EXISTS description TEXT;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_created_at ON public.admin_action_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_action_type ON public.admin_action_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_target_type ON public.admin_action_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_admin_user_id ON public.admin_action_logs(admin_user_id);

-- Ensure the table remains append-only (no update/delete policies exist, which is correct)
-- The existing RLS policies already prevent UPDATE and DELETE