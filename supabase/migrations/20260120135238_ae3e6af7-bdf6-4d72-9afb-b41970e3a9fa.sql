-- Add subject field to contact_messages table
ALTER TABLE public.contact_messages
ADD COLUMN subject text;