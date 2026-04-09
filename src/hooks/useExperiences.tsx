import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useEventTracking } from '@/hooks/useEventTracking';
import { useOffline } from '@/contexts/OfflineContext';
import { useSyncQueueContext } from '@/contexts/SyncQueueContext';
import { toast } from 'sonner';

export interface Experience {
  id: string;
  portfolio_id: string;
  company: string;
  position: string;
  employment_type: string | null;
  location: string | null;
  description: string | null;
  role_summary: string | null;
  responsibilities: string[] | null;
  achievements: string[] | null;
  technologies_used: string[] | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean | null;
  published: boolean | null;
  display_order: number | null;
  created_at: string;
  updated_at: string | null;
}

export type ExperienceInsert = Omit<Experience, 'id' | 'created_at' | 'updated_at'>;
export type ExperienceUpdate = Partial<Omit<Experience, 'id' | 'portfolio_id' | 'created_at' | 'updated_at'>>;

export const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Internship',
  'Freelance',
  'Contract',
] as const;

const QUERY_KEY = 'experiences';

export function useExperiences() {
  const { portfolio } = useWorkspace();
  const { trackEvent } = useEventTracking();
  const queryClient = useQueryClient();
  const portfolioId = portfolio?.id;
  const { isOffline } = useOffline();
  const { queueOperation } = useSyncQueueContext();

  // Query for fetching experiences
  const { data: experiences = [], isLoading: loading } = useQuery({
    queryKey: [QUERY_KEY, portfolioId],
    queryFn: async () => {
      if (!portfolioId) return [];
      
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('display_order', { ascending: true });

      if (error) {
        toast.error('Unable to load experiences. Please try again.');
        console.error(error);
        return [];
      }
      return data as Experience[];
    },
    enabled: !!portfolioId,
  });

  // Create mutation with optimistic update
  const createMutation = useMutation({
    mutationFn: async (experience: Omit<ExperienceInsert, 'portfolio_id' | 'display_order'>) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const maxOrder = experiences.length > 0 
        ? Math.max(...experiences.map(e => e.display_order ?? 0)) 
        : -1;

      const { data, error } = await supabase
        .from('experiences')
        .insert({
          ...experience,
          portfolio_id: portfolioId,
          display_order: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Experience;
    },
    onMutate: async (newExperience) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousExperiences = queryClient.getQueryData<Experience[]>([QUERY_KEY, portfolioId]);
      
      const optimisticExperience: Experience = {
        ...newExperience,
        id: `temp-${Date.now()}`,
        portfolio_id: portfolioId!,
        display_order: experiences.length,
        created_at: new Date().toISOString(),
        updated_at: null,
      } as Experience;

      queryClient.setQueryData<Experience[]>([QUERY_KEY, portfolioId], (old) => 
        [...(old || []), optimisticExperience]
      );

      return { previousExperiences };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, portfolioId] });
      trackEvent('experience_create', { experience_id: data.id, company: data.company });
      toast.success(`Experience at "${data.company}" added successfully`);
    },
    onError: (error, _, context) => {
      if (context?.previousExperiences) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousExperiences);
      }
      toast.error('Could not add experience. Please check your input and try again.');
      console.error(error);
    },
  });

  // Update mutation with optimistic update
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ExperienceUpdate }) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const { data, error } = await supabase
        .from('experiences')
        .update(updates)
        .eq('id', id)
        .eq('portfolio_id', portfolioId)
        .select()
        .single();

      if (error) throw error;
      return data as Experience;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousExperiences = queryClient.getQueryData<Experience[]>([QUERY_KEY, portfolioId]);

      queryClient.setQueryData<Experience[]>([QUERY_KEY, portfolioId], (old) =>
        old?.map(e => e.id === id ? { ...e, ...updates } : e) || []
      );

      return { previousExperiences };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, portfolioId] });
      trackEvent('experience_update', { experience_id: data.id });
      toast.success('Experience saved successfully');
    },
    onError: (error, _, context) => {
      if (context?.previousExperiences) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousExperiences);
      }
      toast.error('Could not save experience changes. Please try again.');
      console.error(error);
    },
  });

  // Delete mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id)
        .eq('portfolio_id', portfolioId);

      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousExperiences = queryClient.getQueryData<Experience[]>([QUERY_KEY, portfolioId]);

      queryClient.setQueryData<Experience[]>([QUERY_KEY, portfolioId], (old) =>
        old?.filter(e => e.id !== id) || []
      );

      return { previousExperiences };
    },
    onSuccess: (id) => {
      trackEvent('experience_delete', { experience_id: id });
      toast.success('Experience deleted successfully');
    },
    onError: (error, _, context) => {
      if (context?.previousExperiences) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousExperiences);
      }
      toast.error('Could not delete experience. Please try again.');
      console.error(error);
    },
  });

  // Reorder mutation with optimistic update
  const reorderMutation = useMutation({
    mutationFn: async (reorderedExperiences: Experience[]) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const updates = reorderedExperiences.map((experience, index) => ({
        id: experience.id,
        display_order: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('experiences')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
          .eq('portfolio_id', portfolioId);

        if (error) throw error;
      }
    },
    onMutate: async (reorderedExperiences) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousExperiences = queryClient.getQueryData<Experience[]>([QUERY_KEY, portfolioId]);

      queryClient.setQueryData<Experience[]>([QUERY_KEY, portfolioId], reorderedExperiences);

      return { previousExperiences };
    },
    onError: (error, _, context) => {
      if (context?.previousExperiences) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousExperiences);
      }
      toast.error('Could not save new order. Reverting changes.');
      console.error(error);
    },
  });

  // Offline-aware wrapper functions
  const createExperience = async (experience: Omit<ExperienceInsert, 'portfolio_id' | 'display_order'>) => {
    if (isOffline) {
      const maxOrder = experiences.length > 0 
        ? Math.max(...experiences.map(e => e.display_order ?? 0)) 
        : -1;
      
      const tempId = `temp-${Date.now()}`;
      const optimisticExperience: Experience = {
        ...experience,
        id: tempId,
        portfolio_id: portfolioId!,
        display_order: maxOrder + 1,
        created_at: new Date().toISOString(),
        updated_at: null,
      } as Experience;

      queryClient.setQueryData<Experience[]>([QUERY_KEY, portfolioId], (old) => 
        [...(old || []), optimisticExperience]
      );

      queueOperation('insert', 'experiences', {
        ...experience,
        portfolio_id: portfolioId,
        display_order: maxOrder + 1,
      });

      toast.info('Experience saved offline', {
        description: 'Will sync when you\'re back online.',
      });

      return { data: optimisticExperience, queued: true };
    }

    try {
      const data = await createMutation.mutateAsync(experience);
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const updateExperience = async (id: string, updates: ExperienceUpdate) => {
    if (isOffline) {
      queryClient.setQueryData<Experience[]>([QUERY_KEY, portfolioId], (old) =>
        old?.map(e => e.id === id ? { ...e, ...updates } : e) || []
      );

      queueOperation('update', 'experiences', { id, ...updates }, 'id');

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

  const deleteExperience = async (id: string) => {
    if (isOffline) {
      queryClient.setQueryData<Experience[]>([QUERY_KEY, portfolioId], (old) =>
        old?.filter(e => e.id !== id) || []
      );

      queueOperation('delete', 'experiences', { id }, 'id');

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

  const togglePublished = async (id: string, published: boolean) => {
    return updateExperience(id, { published });
  };

  const reorderExperiences = async (reorderedExperiences: Experience[]) => {
    if (isOffline) {
      queryClient.setQueryData<Experience[]>([QUERY_KEY, portfolioId], reorderedExperiences);

      reorderedExperiences.forEach((experience, index) => {
        queueOperation('update', 'experiences', { id: experience.id, display_order: index }, 'id');
      });

      toast.info('Order saved offline', {
        description: 'Will sync when you\'re back online.',
      });

      return;
    }

    await reorderMutation.mutateAsync(reorderedExperiences);
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY, portfolioId] });
  };

  return {
    experiences,
    loading,
    createExperience,
    updateExperience,
    deleteExperience,
    togglePublished,
    reorderExperiences,
    refetch,
  };
}
