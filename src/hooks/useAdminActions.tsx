import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ActionLogParams {
  actionType: string;
  targetType: 'user' | 'workspace' | 'portfolio';
  targetId: string;
  details?: Record<string, unknown>;
}

export function useAdminActions() {
  const { user } = useAuth();

  const logAction = async ({ actionType, targetType, targetId, details = {} }: ActionLogParams) => {
    if (!user) return;
    
    // Use type assertion to handle new table not yet in generated types
    await (supabase.from('admin_action_logs') as any).insert({
      admin_user_id: user.id,
      action_type: actionType,
      target_type: targetType,
      target_id: targetId,
      details,
    });
  };

  const suspendUser = async (userId: string, userEmail: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'suspended' })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to suspend user');
      return false;
    }

    await logAction({
      actionType: 'user_suspended',
      targetType: 'user',
      targetId: userId,
      details: { email: userEmail },
    });

    toast.success('User suspended successfully');
    return true;
  };

  const reactivateUser = async (userId: string, userEmail: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to reactivate user');
      return false;
    }

    await logAction({
      actionType: 'user_reactivated',
      targetType: 'user',
      targetId: userId,
      details: { email: userEmail },
    });

    toast.success('User reactivated successfully');
    return true;
  };

  const upgradeWorkspace = async (workspaceId: string, workspaceName: string) => {
    const { error } = await supabase
      .from('workspaces')
      .update({ plan: 'pro' })
      .eq('id', workspaceId);

    if (error) {
      toast.error('Failed to upgrade workspace');
      return false;
    }

    await logAction({
      actionType: 'workspace_upgraded',
      targetType: 'workspace',
      targetId: workspaceId,
      details: { name: workspaceName, new_plan: 'pro' },
    });

    toast.success('Workspace upgraded to Pro');
    return true;
  };

  const downgradeWorkspace = async (workspaceId: string, workspaceName: string) => {
    const { error } = await supabase
      .from('workspaces')
      .update({ plan: 'free' })
      .eq('id', workspaceId);

    if (error) {
      toast.error('Failed to downgrade workspace');
      return false;
    }

    await logAction({
      actionType: 'workspace_downgraded',
      targetType: 'workspace',
      targetId: workspaceId,
      details: { name: workspaceName, new_plan: 'free' },
    });

    toast.success('Workspace downgraded to Free');
    return true;
  };

  const forceUnpublishPortfolio = async (portfolioId: string, portfolioSlug: string) => {
    const { error } = await supabase
      .from('portfolios')
      .update({ published: false })
      .eq('id', portfolioId);

    if (error) {
      toast.error('Failed to unpublish portfolio');
      return false;
    }

    await logAction({
      actionType: 'portfolio_unpublished',
      targetType: 'portfolio',
      targetId: portfolioId,
      details: { slug: portfolioSlug },
    });

    toast.success('Portfolio unpublished');
    return true;
  };

  return {
    logAction,
    suspendUser,
    reactivateUser,
    upgradeWorkspace,
    downgradeWorkspace,
    forceUnpublishPortfolio,
  };
}
