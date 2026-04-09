-- Allow anonymous portfolio view events
CREATE POLICY "Allow anonymous portfolio view events"
ON public.events
FOR INSERT
WITH CHECK (
  event_type = 'portfolio_view' 
  AND user_id IS NULL
  AND workspace_id IS NOT NULL
);

-- Allow workspace members to view their own workspace events
CREATE POLICY "Members can view workspace events"
ON public.events
FOR SELECT
USING (
  workspace_id IN (SELECT public.get_user_workspace_ids(auth.uid()))
);