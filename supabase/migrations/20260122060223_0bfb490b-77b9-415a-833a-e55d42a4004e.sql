-- Add IP address and device info tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_ip_address text,
ADD COLUMN IF NOT EXISTS last_device_os text,
ADD COLUMN IF NOT EXISTS last_user_agent text;