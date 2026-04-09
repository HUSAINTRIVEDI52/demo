-- Create contact_messages table to store messages sent through portfolio contact forms
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Portfolio owners can view messages for their portfolios
CREATE POLICY "Members can view their portfolio messages"
ON public.contact_messages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM portfolios p
  WHERE p.id = contact_messages.portfolio_id
  AND is_workspace_member(auth.uid(), p.workspace_id)
));

-- Policy: Anyone can insert messages (public contact form)
CREATE POLICY "Anyone can send contact messages"
ON public.contact_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM portfolios p
    WHERE p.id = contact_messages.portfolio_id
    AND p.published = true
  )
);

-- Policy: Portfolio owners can update messages (mark as read)
CREATE POLICY "Members can update their portfolio messages"
ON public.contact_messages
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM portfolios p
  WHERE p.id = contact_messages.portfolio_id
  AND is_workspace_member(auth.uid(), p.workspace_id)
));

-- Policy: Portfolio owners can delete messages
CREATE POLICY "Members can delete their portfolio messages"
ON public.contact_messages
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM portfolios p
  WHERE p.id = contact_messages.portfolio_id
  AND is_workspace_member(auth.uid(), p.workspace_id)
));

-- Create index for faster queries
CREATE INDEX idx_contact_messages_portfolio_id ON public.contact_messages(portfolio_id);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);