-- Add status column to profiles for suspend/active state
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active' 
CHECK (status IN ('active', 'suspended'));

-- Create admin action logs table for audit trail
CREATE TABLE public.admin_action_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_action_logs
ALTER TABLE public.admin_action_logs ENABLE ROW LEVEL SECURITY;

-- Only super admins can view action logs
CREATE POLICY "Super admins can view action logs"
ON public.admin_action_logs
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Only super admins can insert action logs
CREATE POLICY "Super admins can insert action logs"
ON public.admin_action_logs
FOR INSERT
WITH CHECK (is_super_admin(auth.uid()));

-- Create index for efficient querying
CREATE INDEX idx_admin_action_logs_created_at ON public.admin_action_logs(created_at DESC);
CREATE INDEX idx_admin_action_logs_target ON public.admin_action_logs(target_type, target_id);
CREATE INDEX idx_profiles_status ON public.profiles(status);

-- Add RLS policy for super admins to update profiles (for suspend/reactivate)
CREATE POLICY "Super admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (is_super_admin(auth.uid()));