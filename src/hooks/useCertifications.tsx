import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useEventTracking } from '@/hooks/useEventTracking';
import { useOffline } from '@/contexts/OfflineContext';
import { useSyncQueueContext } from '@/contexts/SyncQueueContext';
import { toast } from 'sonner';

export interface Certification {
  id: string;
  portfolio_id: string;
  name: string;
  issuer: string;
  credential_id: string | null;
  credential_url: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  display_order: number | null;
  created_at: string;
}

export type CertificationInsert = Omit<Certification, 'id' | 'created_at'>;
export type CertificationUpdate = Partial<Omit<Certification, 'id' | 'portfolio_id' | 'created_at'>>;

const QUERY_KEY = 'certifications';

export function useCertifications() {
  const { portfolio } = useWorkspace();
  const { trackEvent } = useEventTracking();
  const queryClient = useQueryClient();
  const portfolioId = portfolio?.id;
  const { isOffline } = useOffline();
  const { queueOperation } = useSyncQueueContext();

  // Query for fetching certifications
  const { data: certifications = [], isLoading: loading } = useQuery({
    queryKey: [QUERY_KEY, portfolioId],
    queryFn: async () => {
      if (!portfolioId) return [];
      
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('display_order', { ascending: true });

      if (error) {
        toast.error('Unable to load certifications. Please try again.');
        console.error(error);
        return [];
      }
      return data as Certification[];
    },
    enabled: !!portfolioId,
  });

  // Create mutation with optimistic update
  const createMutation = useMutation({
    mutationFn: async (certification: Omit<CertificationInsert, 'portfolio_id' | 'display_order'>) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const maxOrder = certifications.length > 0 
        ? Math.max(...certifications.map(c => c.display_order ?? 0)) 
        : -1;

      const { data, error } = await supabase
        .from('certifications')
        .insert({
          ...certification,
          portfolio_id: portfolioId,
          display_order: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Certification;
    },
    onMutate: async (newCertification) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousCertifications = queryClient.getQueryData<Certification[]>([QUERY_KEY, portfolioId]);
      
      const optimisticCertification: Certification = {
        ...newCertification,
        id: `temp-${Date.now()}`,
        portfolio_id: portfolioId!,
        display_order: certifications.length,
        created_at: new Date().toISOString(),
      } as Certification;

      queryClient.setQueryData<Certification[]>([QUERY_KEY, portfolioId], (old) => 
        [...(old || []), optimisticCertification]
      );

      return { previousCertifications };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, portfolioId] });
      trackEvent('certification_create', { certification_id: data.id, name: data.name });
      toast.success(`Certification "${data.name}" added successfully`);
    },
    onError: (error, _, context) => {
      if (context?.previousCertifications) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousCertifications);
      }
      toast.error('Could not add certification. Please check your input and try again.');
      console.error(error);
    },
  });

  // Update mutation with optimistic update
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CertificationUpdate }) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const { data, error } = await supabase
        .from('certifications')
        .update(updates)
        .eq('id', id)
        .eq('portfolio_id', portfolioId)
        .select()
        .single();

      if (error) throw error;
      return data as Certification;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousCertifications = queryClient.getQueryData<Certification[]>([QUERY_KEY, portfolioId]);

      queryClient.setQueryData<Certification[]>([QUERY_KEY, portfolioId], (old) =>
        old?.map(c => c.id === id ? { ...c, ...updates } : c) || []
      );

      return { previousCertifications };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, portfolioId] });
      trackEvent('certification_update', { certification_id: data.id });
      toast.success('Certification saved successfully');
    },
    onError: (error, _, context) => {
      if (context?.previousCertifications) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousCertifications);
      }
      toast.error('Could not save certification changes. Please try again.');
      console.error(error);
    },
  });

  // Delete mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', id)
        .eq('portfolio_id', portfolioId);

      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousCertifications = queryClient.getQueryData<Certification[]>([QUERY_KEY, portfolioId]);

      queryClient.setQueryData<Certification[]>([QUERY_KEY, portfolioId], (old) =>
        old?.filter(c => c.id !== id) || []
      );

      return { previousCertifications };
    },
    onSuccess: (id) => {
      trackEvent('certification_delete', { certification_id: id });
      toast.success('Certification deleted successfully');
    },
    onError: (error, _, context) => {
      if (context?.previousCertifications) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousCertifications);
      }
      toast.error('Could not delete certification. Please try again.');
      console.error(error);
    },
  });

  // Reorder mutation with optimistic update
  const reorderMutation = useMutation({
    mutationFn: async (reorderedCertifications: Certification[]) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const updates = reorderedCertifications.map((certification, index) => ({
        id: certification.id,
        display_order: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('certifications')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
          .eq('portfolio_id', portfolioId);

        if (error) throw error;
      }
    },
    onMutate: async (reorderedCertifications) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousCertifications = queryClient.getQueryData<Certification[]>([QUERY_KEY, portfolioId]);

      queryClient.setQueryData<Certification[]>([QUERY_KEY, portfolioId], reorderedCertifications);

      return { previousCertifications };
    },
    onError: (error, _, context) => {
      if (context?.previousCertifications) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousCertifications);
      }
      toast.error('Could not save new order. Reverting changes.');
      console.error(error);
    },
  });

  // Offline-aware wrapper functions
  const createCertification = async (certification: Omit<CertificationInsert, 'portfolio_id' | 'display_order'>) => {
    if (isOffline) {
      const maxOrder = certifications.length > 0 
        ? Math.max(...certifications.map(c => c.display_order ?? 0)) 
        : -1;
      
      const tempId = `temp-${Date.now()}`;
      const optimisticCertification: Certification = {
        ...certification,
        id: tempId,
        portfolio_id: portfolioId!,
        display_order: maxOrder + 1,
        created_at: new Date().toISOString(),
      } as Certification;

      queryClient.setQueryData<Certification[]>([QUERY_KEY, portfolioId], (old) => 
        [...(old || []), optimisticCertification]
      );

      queueOperation('insert', 'certifications', {
        ...certification,
        portfolio_id: portfolioId,
        display_order: maxOrder + 1,
      });

      toast.info('Certification saved offline', {
        description: 'Will sync when you\'re back online.',
      });

      return { data: optimisticCertification, queued: true };
    }

    try {
      const data = await createMutation.mutateAsync(certification);
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const updateCertification = async (id: string, updates: CertificationUpdate) => {
    if (isOffline) {
      queryClient.setQueryData<Certification[]>([QUERY_KEY, portfolioId], (old) =>
        old?.map(c => c.id === id ? { ...c, ...updates } : c) || []
      );

      queueOperation('update', 'certifications', { id, ...updates }, 'id');

      toast.info('Changes saved offline', {
        description: 'Will sync when you\'re back online.',
      });

      return { queued: true };
    }

    try {
      const data = await updateMutation.mutateAsync({ id, updates });
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const deleteCertification = async (id: string) => {
    if (isOffline) {
      queryClient.setQueryData<Certification[]>([QUERY_KEY, portfolioId], (old) =>
        old?.filter(c => c.id !== id) || []
      );

      queueOperation('delete', 'certifications', { id }, 'id');

      toast.info('Delete saved offline', {
        description: 'Will sync when you\'re back online.',
      });

      return { success: true, queued: true };
    }

    try {
      await deleteMutation.mutateAsync(id);
      return { success: true };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const reorderCertifications = async (reorderedCertifications: Certification[]) => {
    if (isOffline) {
      queryClient.setQueryData<Certification[]>([QUERY_KEY, portfolioId], reorderedCertifications);

      reorderedCertifications.forEach((certification, index) => {
        queueOperation('update', 'certifications', { id: certification.id, display_order: index }, 'id');
      });

      toast.info('Order saved offline', {
        description: 'Will sync when you\'re back online.',
      });

      return;
    }

    await reorderMutation.mutateAsync(reorderedCertifications);
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY, portfolioId] });
  };

  return {
    certifications,
    loading,
    createCertification,
    updateCertification,
    deleteCertification,
    reorderCertifications,
    refetch,
  };
}
