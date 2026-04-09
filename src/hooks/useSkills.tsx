import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useEventTracking } from '@/hooks/useEventTracking';
import { useOffline } from '@/contexts/OfflineContext';
import { useSyncQueueContext } from '@/contexts/SyncQueueContext';
import { toast } from 'sonner';
import { useMemo } from 'react';

export interface Skill {
  id: string;
  portfolio_id: string;
  name: string;
  category: string | null;
  proficiency: number | null;
  published: boolean | null;
  display_order: number | null;
  created_at: string;
  updated_at: string | null;
}

export type SkillInsert = Omit<Skill, 'id' | 'created_at' | 'updated_at'>;
export type SkillUpdate = Partial<Omit<Skill, 'id' | 'portfolio_id' | 'created_at' | 'updated_at'>>;

const QUERY_KEY = 'skills';

export function useSkills() {
  const { portfolio } = useWorkspace();
  const { trackEvent } = useEventTracking();
  const queryClient = useQueryClient();
  const portfolioId = portfolio?.id;
  const { isOffline } = useOffline();
  const { queueOperation } = useSyncQueueContext();

  // Query for fetching skills
  const { data: skills = [], isLoading: loading } = useQuery({
    queryKey: [QUERY_KEY, portfolioId],
    queryFn: async () => {
      if (!portfolioId) return [];
      
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('display_order', { ascending: true });

      if (error) {
        toast.error('Unable to load skills. Please try again.');
        console.error(error);
        return [];
      }
      return data as Skill[];
    },
    enabled: !!portfolioId,
  });

  // Create mutation with optimistic update
  const createMutation = useMutation({
    mutationFn: async (skill: Omit<SkillInsert, 'portfolio_id' | 'display_order'>) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const maxOrder = skills.length > 0 
        ? Math.max(...skills.map(s => s.display_order ?? 0)) 
        : -1;

      const { data, error } = await supabase
        .from('skills')
        .insert({
          ...skill,
          portfolio_id: portfolioId,
          display_order: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Skill;
    },
    onMutate: async (newSkill) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousSkills = queryClient.getQueryData<Skill[]>([QUERY_KEY, portfolioId]);
      
      const optimisticSkill: Skill = {
        ...newSkill,
        id: `temp-${Date.now()}`,
        portfolio_id: portfolioId!,
        display_order: skills.length,
        created_at: new Date().toISOString(),
        updated_at: null,
      } as Skill;

      queryClient.setQueryData<Skill[]>([QUERY_KEY, portfolioId], (old) => 
        [...(old || []), optimisticSkill]
      );

      return { previousSkills };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, portfolioId] });
      trackEvent('skill_create', { skill_id: data.id, name: data.name });
      toast.success(`Skill "${data.name}" added successfully`);
    },
    onError: (error, _, context) => {
      if (context?.previousSkills) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousSkills);
      }
      toast.error('Could not add skill. Please check your input and try again.');
      console.error(error);
    },
  });

  // Update mutation with optimistic update
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: SkillUpdate }) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const { data, error } = await supabase
        .from('skills')
        .update(updates)
        .eq('id', id)
        .eq('portfolio_id', portfolioId)
        .select()
        .single();

      if (error) throw error;
      return data as Skill;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousSkills = queryClient.getQueryData<Skill[]>([QUERY_KEY, portfolioId]);

      queryClient.setQueryData<Skill[]>([QUERY_KEY, portfolioId], (old) =>
        old?.map(s => s.id === id ? { ...s, ...updates } : s) || []
      );

      return { previousSkills };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, portfolioId] });
      trackEvent('skill_update', { skill_id: data.id });
      toast.success('Skill saved successfully');
    },
    onError: (error, _, context) => {
      if (context?.previousSkills) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousSkills);
      }
      toast.error('Could not save skill changes. Please try again.');
      console.error(error);
    },
  });

  // Delete mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id)
        .eq('portfolio_id', portfolioId);

      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousSkills = queryClient.getQueryData<Skill[]>([QUERY_KEY, portfolioId]);

      queryClient.setQueryData<Skill[]>([QUERY_KEY, portfolioId], (old) =>
        old?.filter(s => s.id !== id) || []
      );

      return { previousSkills };
    },
    onSuccess: (id) => {
      trackEvent('skill_delete', { skill_id: id });
      toast.success('Skill deleted successfully');
    },
    onError: (error, _, context) => {
      if (context?.previousSkills) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousSkills);
      }
      toast.error('Could not delete skill. Please try again.');
      console.error(error);
    },
  });

  // Reorder mutation with optimistic update
  const reorderMutation = useMutation({
    mutationFn: async (reorderedSkills: Skill[]) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const updates = reorderedSkills.map((skill, index) => ({
        id: skill.id,
        display_order: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('skills')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
          .eq('portfolio_id', portfolioId);

        if (error) throw error;
      }
    },
    onMutate: async (reorderedSkills) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousSkills = queryClient.getQueryData<Skill[]>([QUERY_KEY, portfolioId]);

      queryClient.setQueryData<Skill[]>([QUERY_KEY, portfolioId], reorderedSkills);

      return { previousSkills };
    },
    onError: (error, _, context) => {
      if (context?.previousSkills) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousSkills);
      }
      toast.error('Could not save new order. Reverting changes.');
      console.error(error);
    },
  });

  // Offline-aware wrapper functions
  const createSkill = async (skill: Omit<SkillInsert, 'portfolio_id' | 'display_order'>) => {
    if (isOffline) {
      const maxOrder = skills.length > 0 
        ? Math.max(...skills.map(s => s.display_order ?? 0)) 
        : -1;
      
      const tempId = `temp-${Date.now()}`;
      const optimisticSkill: Skill = {
        ...skill,
        id: tempId,
        portfolio_id: portfolioId!,
        display_order: maxOrder + 1,
        created_at: new Date().toISOString(),
        updated_at: null,
      } as Skill;

      queryClient.setQueryData<Skill[]>([QUERY_KEY, portfolioId], (old) => 
        [...(old || []), optimisticSkill]
      );

      queueOperation('insert', 'skills', {
        ...skill,
        portfolio_id: portfolioId,
        display_order: maxOrder + 1,
      });

      toast.info('Skill saved offline', {
        description: 'Will sync when you\'re back online.',
      });

      return { data: optimisticSkill, queued: true };
    }

    try {
      const data = await createMutation.mutateAsync(skill);
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const updateSkill = async (id: string, updates: SkillUpdate) => {
    if (isOffline) {
      queryClient.setQueryData<Skill[]>([QUERY_KEY, portfolioId], (old) =>
        old?.map(s => s.id === id ? { ...s, ...updates } : s) || []
      );

      queueOperation('update', 'skills', { id, ...updates }, 'id');

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

  const deleteSkill = async (id: string) => {
    if (isOffline) {
      queryClient.setQueryData<Skill[]>([QUERY_KEY, portfolioId], (old) =>
        old?.filter(s => s.id !== id) || []
      );

      queueOperation('delete', 'skills', { id }, 'id');

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
    return updateSkill(id, { published });
  };

  const reorderSkills = async (reorderedSkills: Skill[]) => {
    if (isOffline) {
      queryClient.setQueryData<Skill[]>([QUERY_KEY, portfolioId], reorderedSkills);

      reorderedSkills.forEach((skill, index) => {
        queueOperation('update', 'skills', { id: skill.id, display_order: index }, 'id');
      });

      toast.info('Order saved offline', {
        description: 'Will sync when you\'re back online.',
      });

      return;
    }

    await reorderMutation.mutateAsync(reorderedSkills);
  };

  // Memoized derived state
  const groupedSkills = useMemo(() => {
    return skills.reduce((acc, skill) => {
      const category = skill.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    }, {} as Record<string, Skill[]>);
  }, [skills]);

  const categories = useMemo(() => {
    return [...new Set(skills.map(s => s.category).filter(Boolean))] as string[];
  }, [skills]);

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY, portfolioId] });
  };

  return {
    skills,
    groupedSkills,
    categories,
    loading,
    createSkill,
    updateSkill,
    deleteSkill,
    togglePublished,
    reorderSkills,
    refetch,
  };
}
