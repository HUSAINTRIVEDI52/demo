import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';

export function useUnreadMessages() {
  const { portfolio } = useWorkspace();
  const portfolioId = portfolio?.id;

  const { data: unreadCount = 0, refetch } = useQuery({
    queryKey: ['unread-messages', portfolioId],
    enabled: !!portfolioId,
    // Cache for 2 minutes - don't refetch on every navigation
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!portfolioId) return 0;

      const { count, error } = await supabase
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })
        .eq('portfolio_id', portfolioId)
        .eq('read', false);

      if (error) {
        console.error('Error fetching unread count:', error);
        return 0;
      }

      return count ?? 0;
    },
  });

  return { unreadCount, refetch };
}
