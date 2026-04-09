import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useEventTracking } from '@/hooks/useEventTracking';
import { useOffline } from '@/contexts/OfflineContext';
import { useSyncQueueContext } from '@/contexts/SyncQueueContext';
import { toast } from 'sonner';

export interface CustomSection {
  id: string;
  portfolio_id: string;
  title: string;
  content: string | null;
  visibility: boolean;
  display_order: number | null;
  created_at: string;
  updated_at: string | null;
}

export type CustomSectionInsert = Omit<CustomSection, 'id' | 'created_at' | 'updated_at'>;
export type CustomSectionUpdate = Partial<Omit<CustomSection, 'id' | 'portfolio_id' | 'created_at' | 'updated_at'>>;

const QUERY_KEY = 'custom_sections';

export function useCustomSections() {
  const { portfolio } = useWorkspace();
  const { trackEvent } = useEventTracking();
  const queryClient = useQueryClient();
  const portfolioId = portfolio?.id;
  const { isOffline } = useOffline();
  const { queueOperation } = useSyncQueueContext();

  // Query for fetching custom sections
  const { data: customSections = [], isLoading: loading } = useQuery({
    queryKey: [QUERY_KEY, portfolioId],
    queryFn: async () => {
      if (!portfolioId) return [];
      
      const { data, error } = await supabase
        .from('custom_sections')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('display_order', { ascending: true });

      if (error) {
        toast.error('Unable to load custom sections. Please try again.');
        console.error(error);
        return [];
      }
      return data as CustomSection[];
    },
    enabled: !!portfolioId,
  });

  // Create mutation with optimistic update
  const createMutation = useMutation({
    mutationFn: async (section: Omit<CustomSectionInsert, 'portfolio_id' | 'display_order'>) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const maxOrder = customSections.length > 0 
        ? Math.max(...customSections.map(s => s.display_order ?? 0)) 
        : -1;

      const { data, error } = await supabase
        .from('custom_sections')
        .insert({
          ...section,
          portfolio_id: portfolioId,
          display_order: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data as CustomSection;
    },
    onMutate: async (newSection) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousSections = queryClient.getQueryData<CustomSection[]>([QUERY_KEY, portfolioId]);
      
      const optimisticSection: CustomSection = {
        ...newSection,
        id: `temp-${Date.now()}`,
        portfolio_id: portfolioId!,
        display_order: customSections.length,
        created_at: new Date().toISOString(),
        updated_at: null,
      } as CustomSection;

      queryClient.setQueryData<CustomSection[]>([QUERY_KEY, portfolioId], (old) => 
        [...(old || []), optimisticSection]
      );

      return { previousSections };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, portfolioId] });
      trackEvent('custom_section_create', { section_id: data.id, title: data.title });
      toast.success(`Section "${data.title}" created successfully`);
    },
    onError: (error, _, context) => {
      if (context?.previousSections) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousSections);
      }
      toast.error('Could not create section. Please check your input and try again.');
      console.error(error);
    },
  });

  // Update mutation with optimistic update
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CustomSectionUpdate }) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const { data, error } = await supabase
        .from('custom_sections')
        .update(updates)
        .eq('id', id)
        .eq('portfolio_id', portfolioId)
        .select()
        .single();

      if (error) throw error;
      return data as CustomSection;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousSections = queryClient.getQueryData<CustomSection[]>([QUERY_KEY, portfolioId]);

      queryClient.setQueryData<CustomSection[]>([QUERY_KEY, portfolioId], (old) =>
        old?.map(s => s.id === id ? { ...s, ...updates } : s) || []
      );

      return { previousSections };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, portfolioId] });
      trackEvent('custom_section_update', { section_id: data.id });
      toast.success('Section saved successfully');
    },
    onError: (error, _, context) => {
      if (context?.previousSections) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousSections);
      }
      toast.error('Could not save section changes. Please try again.');
      console.error(error);
    },
  });

  // Delete mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const { error } = await supabase
        .from('custom_sections')
        .delete()
        .eq('id', id)
        .eq('portfolio_id', portfolioId);

      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousSections = queryClient.getQueryData<CustomSection[]>([QUERY_KEY, portfolioId]);

      queryClient.setQueryData<CustomSection[]>([QUERY_KEY, portfolioId], (old) =>
        old?.filter(s => s.id !== id) || []
      );

      return { previousSections };
    },
    onSuccess: (id) => {
      trackEvent('custom_section_delete', { section_id: id });
      toast.success('Section deleted successfully');
    },
    onError: (error, _, context) => {
      if (context?.previousSections) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousSections);
      }
      toast.error('Could not delete section. Please try again.');
      console.error(error);
    },
  });

  // Reorder mutation with optimistic update
  const reorderMutation = useMutation({
    mutationFn: async (reorderedSections: CustomSection[]) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const updates = reorderedSections.map((section, index) => ({
        id: section.id,
        display_order: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('custom_sections')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
          .eq('portfolio_id', portfolioId);

        if (error) throw error;
      }
    },
    onMutate: async (reorderedSections) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousSections = queryClient.getQueryData<CustomSection[]>([QUERY_KEY, portfolioId]);

      queryClient.setQueryData<CustomSection[]>([QUERY_KEY, portfolioId], reorderedSections);

      return { previousSections };
    },
    onError: (error, _, context) => {
      if (context?.previousSections) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousSections);
      }
      toast.error('Could not save new order. Reverting changes.');
      console.error(error);
    },
  });

  // Offline-aware wrapper functions
  const createCustomSection = async (section: Omit<CustomSectionInsert, 'portfolio_id' | 'display_order'>) => {
    if (isOffline) {
      const maxOrder = customSections.length > 0 
        ? Math.max(...customSections.map(s => s.display_order ?? 0)) 
        : -1;
      
      const tempId = `temp-${Date.now()}`;
      const optimisticSection: CustomSection = {
        ...section,
        id: tempId,
        portfolio_id: portfolioId!,
        display_order: maxOrder + 1,
        created_at: new Date().toISOString(),
        updated_at: null,
      } as CustomSection;

      queryClient.setQueryData<CustomSection[]>([QUERY_KEY, portfolioId], (old) => 
        [...(old || []), optimisticSection]
      );

      queueOperation('insert', 'custom_sections', {
        ...section,
        portfolio_id: portfolioId,
        display_order: maxOrder + 1,
      });

      toast.info('Section saved offline', {
        description: 'Will sync when you\'re back online.',
      });

      return { data: optimisticSection, queued: true };
    }

    try {
      const data = await createMutation.mutateAsync(section);
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const updateCustomSection = async (id: string, updates: CustomSectionUpdate) => {
    if (isOffline) {
      queryClient.setQueryData<CustomSection[]>([QUERY_KEY, portfolioId], (old) =>
        old?.map(s => s.id === id ? { ...s, ...updates } : s) || []
      );

      queueOperation('update', 'custom_sections', { id, ...updates }, 'id');

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

  const deleteCustomSection = async (id: string) => {
    if (isOffline) {
      queryClient.setQueryData<CustomSection[]>([QUERY_KEY, portfolioId], (old) =>
        old?.filter(s => s.id !== id) || []
      );

      queueOperation('delete', 'custom_sections', { id }, 'id');

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

  const toggleVisibility = async (id: string, visibility: boolean) => {
    return updateCustomSection(id, { visibility });
  };

  const reorderCustomSections = async (reorderedSections: CustomSection[]) => {
    if (isOffline) {
      queryClient.setQueryData<CustomSection[]>([QUERY_KEY, portfolioId], reorderedSections);

      reorderedSections.forEach((section, index) => {
        queueOperation('update', 'custom_sections', { id: section.id, display_order: index }, 'id');
      });

      toast.info('Order saved offline', {
        description: 'Will sync when you\'re back online.',
      });

      return;
    }

    await reorderMutation.mutateAsync(reorderedSections);
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY, portfolioId] });
  };

  return {
    customSections,
    loading,
    createCustomSection,
    updateCustomSection,
    deleteCustomSection,
    toggleVisibility,
    reorderCustomSections,
    refetch,
  };
}
