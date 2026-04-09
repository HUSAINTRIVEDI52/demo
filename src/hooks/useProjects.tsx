import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useEventTracking } from '@/hooks/useEventTracking';
import { useOffline } from '@/contexts/OfflineContext';
import { useSyncQueueContext } from '@/contexts/SyncQueueContext';
import { toast } from 'sonner';

export interface Project {
  id: string;
  portfolio_id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  full_description: string | null;
  project_type: string | null;
  image_url: string | null;
  gallery_images: string[] | null;
  demo_video_url: string | null;
  project_url: string | null;
  github_url: string | null;
  case_study_url: string | null;
  technologies: string[] | null;
  tools_used: string[] | null;
  category: string | null;
  role: string | null;
  team_size: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  problem_statement: string | null;
  solution_summary: string | null;
  key_achievements: string[] | null;
  metrics: string | null;
  published: boolean | null;
  featured: boolean | null;
  display_order: number | null;
  created_at: string;
  updated_at: string | null;
}

export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type ProjectUpdate = Partial<Omit<Project, 'id' | 'portfolio_id' | 'created_at' | 'updated_at'>>;

export const PROJECT_TYPES = [
  'Web App',
  'Mobile App',
  'SaaS',
  'Open Source',
  'Freelance',
  'Academic',
] as const;

export const PROJECT_CATEGORIES = [
  'Frontend',
  'Backend',
  'Full-Stack',
  'AI',
  'DevOps',
  'Mobile',
] as const;

export const PROJECT_STATUSES = [
  'Completed',
  'Ongoing',
  'Archived',
] as const;

export const PROJECT_ROLES = [
  'Solo Developer',
  'Team Lead',
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'Contributor',
] as const;

const QUERY_KEY = 'projects';

export function useProjects() {
  const { portfolio } = useWorkspace();
  const { trackEvent } = useEventTracking();
  const queryClient = useQueryClient();
  const portfolioId = portfolio?.id;
  const { isOffline } = useOffline();
  const { queueOperation } = useSyncQueueContext();

  // Query for fetching projects
  const { data: projects = [], isLoading: loading } = useQuery({
    queryKey: [QUERY_KEY, portfolioId],
    queryFn: async () => {
      if (!portfolioId) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('display_order', { ascending: true });

      if (error) {
        toast.error('Unable to load projects. Please try again.');
        console.error(error);
        return [];
      }
      return data as Project[];
    },
    enabled: !!portfolioId,
  });

  // Create mutation with optimistic update
  const createMutation = useMutation({
    mutationFn: async (project: Omit<ProjectInsert, 'portfolio_id' | 'display_order'>) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const maxOrder = projects.length > 0 
        ? Math.max(...projects.map(p => p.display_order ?? 0)) 
        : -1;

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...project,
          portfolio_id: portfolioId,
          display_order: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousProjects = queryClient.getQueryData<Project[]>([QUERY_KEY, portfolioId]);
      
      // Optimistic update with temporary ID
      const optimisticProject: Project = {
        ...newProject,
        id: `temp-${Date.now()}`,
        portfolio_id: portfolioId!,
        display_order: projects.length,
        created_at: new Date().toISOString(),
        updated_at: null,
      } as Project;

      queryClient.setQueryData<Project[]>([QUERY_KEY, portfolioId], (old) => 
        [...(old || []), optimisticProject]
      );

      return { previousProjects };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, portfolioId] });
      trackEvent('project_create', { project_id: data.id, title: data.title });
      toast.success(`Project "${data.title}" created successfully`);
    },
    onError: (error, _, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousProjects);
      }
      toast.error('Could not create project. Please check your input and try again.');
      console.error(error);
    },
  });

  // Update mutation with optimistic update
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ProjectUpdate }) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .eq('portfolio_id', portfolioId)
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousProjects = queryClient.getQueryData<Project[]>([QUERY_KEY, portfolioId]);

      queryClient.setQueryData<Project[]>([QUERY_KEY, portfolioId], (old) =>
        old?.map(p => p.id === id ? { ...p, ...updates } : p) || []
      );

      return { previousProjects };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, portfolioId] });
      trackEvent('project_update', { project_id: data.id });
      toast.success('Project saved successfully');
    },
    onError: (error, _, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousProjects);
      }
      toast.error('Could not save project changes. Please try again.');
      console.error(error);
    },
  });

  // Delete mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('portfolio_id', portfolioId);

      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousProjects = queryClient.getQueryData<Project[]>([QUERY_KEY, portfolioId]);

      queryClient.setQueryData<Project[]>([QUERY_KEY, portfolioId], (old) =>
        old?.filter(p => p.id !== id) || []
      );

      return { previousProjects };
    },
    onSuccess: (id) => {
      trackEvent('project_delete', { project_id: id });
      toast.success('Project deleted successfully');
    },
    onError: (error, _, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousProjects);
      }
      toast.error('Could not delete project. Please try again.');
      console.error(error);
    },
  });

  // Reorder mutation with optimistic update
  const reorderMutation = useMutation({
    mutationFn: async (reorderedProjects: Project[]) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const updates = reorderedProjects.map((project, index) => ({
        id: project.id,
        display_order: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('projects')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
          .eq('portfolio_id', portfolioId);

        if (error) throw error;
      }
    },
    onMutate: async (reorderedProjects) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousProjects = queryClient.getQueryData<Project[]>([QUERY_KEY, portfolioId]);

      queryClient.setQueryData<Project[]>([QUERY_KEY, portfolioId], reorderedProjects);

      return { previousProjects };
    },
    onError: (error, _, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousProjects);
      }
      toast.error('Could not save new order. Reverting changes.');
      console.error(error);
    },
  });

  // Offline-aware wrapper functions
  const createProject = async (project: Omit<ProjectInsert, 'portfolio_id' | 'display_order'>) => {
    if (isOffline) {
      // Queue for later and apply optimistic update
      const maxOrder = projects.length > 0 
        ? Math.max(...projects.map(p => p.display_order ?? 0)) 
        : -1;
      
      const tempId = `temp-${Date.now()}`;
      const optimisticProject: Project = {
        ...project,
        id: tempId,
        portfolio_id: portfolioId!,
        display_order: maxOrder + 1,
        created_at: new Date().toISOString(),
        updated_at: null,
      } as Project;

      queryClient.setQueryData<Project[]>([QUERY_KEY, portfolioId], (old) => 
        [...(old || []), optimisticProject]
      );

      queueOperation('insert', 'projects', {
        ...project,
        portfolio_id: portfolioId,
        display_order: maxOrder + 1,
      });

      toast.info('Project saved offline', {
        description: 'Will sync when you\'re back online.',
      });

      return { data: optimisticProject, queued: true };
    }

    try {
      const data = await createMutation.mutateAsync(project);
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const updateProject = async (id: string, updates: ProjectUpdate) => {
    if (isOffline) {
      // Apply optimistic update
      queryClient.setQueryData<Project[]>([QUERY_KEY, portfolioId], (old) =>
        old?.map(p => p.id === id ? { ...p, ...updates } : p) || []
      );

      queueOperation('update', 'projects', { id, ...updates }, 'id');

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

  const deleteProject = async (id: string) => {
    if (isOffline) {
      // Apply optimistic update
      queryClient.setQueryData<Project[]>([QUERY_KEY, portfolioId], (old) =>
        old?.filter(p => p.id !== id) || []
      );

      queueOperation('delete', 'projects', { id }, 'id');

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
    return updateProject(id, { published });
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    return updateProject(id, { featured });
  };

  const reorderProjects = async (reorderedProjects: Project[]) => {
    if (isOffline) {
      // Apply optimistic update
      queryClient.setQueryData<Project[]>([QUERY_KEY, portfolioId], reorderedProjects);

      // Queue each update
      reorderedProjects.forEach((project, index) => {
        queueOperation('update', 'projects', { id: project.id, display_order: index }, 'id');
      });

      toast.info('Order saved offline', {
        description: 'Will sync when you\'re back online.',
      });

      return;
    }

    await reorderMutation.mutateAsync(reorderedProjects);
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY, portfolioId] });
  };

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    togglePublished,
    toggleFeatured,
    reorderProjects,
    refetch,
  };
}
