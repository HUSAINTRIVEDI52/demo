-- Create portfolio_versions table
CREATE TABLE public.portfolio_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  snapshot_data JSONB NOT NULL,
  action_type TEXT NOT NULL DEFAULT 'manual_save',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view their workspace versions
CREATE POLICY "Members can view workspace versions"
ON public.portfolio_versions
FOR SELECT
USING (is_workspace_member(auth.uid(), workspace_id));

-- Policy: Members can create versions for their portfolios
CREATE POLICY "Members can create versions"
ON public.portfolio_versions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.portfolios p
    WHERE p.id = portfolio_versions.portfolio_id
    AND is_workspace_member(auth.uid(), p.workspace_id)
  )
);

-- Policy: Members can delete their workspace versions
CREATE POLICY "Members can delete versions"
ON public.portfolio_versions
FOR DELETE
USING (is_workspace_member(auth.uid(), workspace_id));

-- Create index for faster queries
CREATE INDEX idx_portfolio_versions_portfolio_id ON public.portfolio_versions(portfolio_id);
CREATE INDEX idx_portfolio_versions_created_at ON public.portfolio_versions(created_at DESC);

-- Function to limit versions to 10 per portfolio
CREATE OR REPLACE FUNCTION public.cleanup_old_portfolio_versions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete versions beyond the 10 most recent for this portfolio
  DELETE FROM public.portfolio_versions
  WHERE id IN (
    SELECT id FROM public.portfolio_versions
    WHERE portfolio_id = NEW.portfolio_id
    ORDER BY created_at DESC
    OFFSET 10
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-cleanup after insert
CREATE TRIGGER cleanup_portfolio_versions_trigger
AFTER INSERT ON public.portfolio_versions
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_old_portfolio_versions();