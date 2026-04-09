-- Create a function to check plan limits before inserts
-- This prevents bypassing limits via direct API calls

CREATE OR REPLACE FUNCTION public.check_plan_limit_projects()
RETURNS TRIGGER AS $$
DECLARE
  workspace_plan plan_type;
  current_count INTEGER;
  max_allowed INTEGER;
  portfolio_workspace_id UUID;
BEGIN
  -- Get the workspace_id from the portfolio
  SELECT p.workspace_id INTO portfolio_workspace_id
  FROM public.portfolios p
  WHERE p.id = NEW.portfolio_id;
  
  -- Get the workspace plan
  SELECT w.plan INTO workspace_plan
  FROM public.workspaces w
  WHERE w.id = portfolio_workspace_id;
  
  -- Define limits based on plan
  CASE workspace_plan
    WHEN 'free' THEN max_allowed := 3;
    WHEN 'pro' THEN max_allowed := 1000; -- effectively unlimited
    WHEN 'enterprise' THEN max_allowed := 1000;
    ELSE max_allowed := 3;
  END CASE;
  
  -- Count existing projects for this portfolio
  SELECT COUNT(*) INTO current_count
  FROM public.projects
  WHERE portfolio_id = NEW.portfolio_id;
  
  -- Check limit
  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Plan limit reached: Maximum % projects allowed on % plan', max_allowed, workspace_plan;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_plan_limit_skills()
RETURNS TRIGGER AS $$
DECLARE
  workspace_plan plan_type;
  current_count INTEGER;
  max_allowed INTEGER;
  portfolio_workspace_id UUID;
BEGIN
  SELECT p.workspace_id INTO portfolio_workspace_id
  FROM public.portfolios p
  WHERE p.id = NEW.portfolio_id;
  
  SELECT w.plan INTO workspace_plan
  FROM public.workspaces w
  WHERE w.id = portfolio_workspace_id;
  
  CASE workspace_plan
    WHEN 'free' THEN max_allowed := 10;
    WHEN 'pro' THEN max_allowed := 1000;
    WHEN 'enterprise' THEN max_allowed := 1000;
    ELSE max_allowed := 10;
  END CASE;
  
  SELECT COUNT(*) INTO current_count
  FROM public.skills
  WHERE portfolio_id = NEW.portfolio_id;
  
  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Plan limit reached: Maximum % skills allowed on % plan', max_allowed, workspace_plan;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_plan_limit_experiences()
RETURNS TRIGGER AS $$
DECLARE
  workspace_plan plan_type;
  current_count INTEGER;
  max_allowed INTEGER;
  portfolio_workspace_id UUID;
BEGIN
  SELECT p.workspace_id INTO portfolio_workspace_id
  FROM public.portfolios p
  WHERE p.id = NEW.portfolio_id;
  
  SELECT w.plan INTO workspace_plan
  FROM public.workspaces w
  WHERE w.id = portfolio_workspace_id;
  
  CASE workspace_plan
    WHEN 'free' THEN max_allowed := 3;
    WHEN 'pro' THEN max_allowed := 1000;
    WHEN 'enterprise' THEN max_allowed := 1000;
    ELSE max_allowed := 3;
  END CASE;
  
  SELECT COUNT(*) INTO current_count
  FROM public.experiences
  WHERE portfolio_id = NEW.portfolio_id;
  
  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Plan limit reached: Maximum % experiences allowed on % plan', max_allowed, workspace_plan;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for limit enforcement
CREATE TRIGGER enforce_project_limit
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.check_plan_limit_projects();

CREATE TRIGGER enforce_skill_limit
  BEFORE INSERT ON public.skills
  FOR EACH ROW
  EXECUTE FUNCTION public.check_plan_limit_skills();

CREATE TRIGGER enforce_experience_limit
  BEFORE INSERT ON public.experiences
  FOR EACH ROW
  EXECUTE FUNCTION public.check_plan_limit_experiences();