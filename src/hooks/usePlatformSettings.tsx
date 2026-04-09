import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformTheme {
  id: string;
  theme_id: string;
  name: string;
  enabled: boolean;
  access_level: 'free' | 'pro';
  created_at: string;
  updated_at: string;
}

export interface PlatformFeature {
  id: string;
  feature_key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Hook for fetching platform themes (admin use)
export function usePlatformThemes() {
  const queryClient = useQueryClient();

  const { data: themes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['platform-themes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_themes')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as PlatformTheme[];
    },
    staleTime: 30000, // 30 seconds cache
  });

  const updateTheme = useMutation({
    mutationFn: async ({ themeId, updates }: { themeId: string; updates: Partial<Pick<PlatformTheme, 'enabled' | 'access_level'>> }) => {
      const { data, error } = await supabase
        .from('platform_themes')
        .update(updates)
        .eq('theme_id', themeId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-themes'] });
      queryClient.invalidateQueries({ queryKey: ['available-themes'] });
    },
  });

  return {
    themes,
    isLoading,
    error,
    refetch,
    updateTheme: updateTheme.mutateAsync,
    isUpdating: updateTheme.isPending,
  };
}

// Hook for fetching platform features (admin use)
export function usePlatformFeatures() {
  const queryClient = useQueryClient();

  const { data: features = [], isLoading, error, refetch } = useQuery({
    queryKey: ['platform-features'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_features')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as PlatformFeature[];
    },
    staleTime: 30000,
  });

  const updateFeature = useMutation({
    mutationFn: async ({ featureKey, enabled }: { featureKey: string; enabled: boolean }) => {
      const { data, error } = await supabase
        .from('platform_features')
        .update({ enabled })
        .eq('feature_key', featureKey)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-features'] });
      queryClient.invalidateQueries({ queryKey: ['available-features'] });
    },
  });

  return {
    features,
    isLoading,
    error,
    refetch,
    updateFeature: updateFeature.mutateAsync,
    isUpdating: updateFeature.isPending,
  };
}

// Hook for checking available themes (user-facing)
export function useAvailableThemes() {
  const { data: availableThemes = [], isLoading } = useQuery({
    queryKey: ['available-themes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_themes')
        .select('theme_id, name, enabled, access_level')
        .eq('enabled', true)
        .order('name');
      
      if (error) throw error;
      return data as Pick<PlatformTheme, 'theme_id' | 'name' | 'enabled' | 'access_level'>[];
    },
    staleTime: 60000, // 1 minute cache for users
  });

  const isThemeAvailable = (themeId: string): boolean => {
    const theme = availableThemes.find(t => t.theme_id === themeId);
    return theme?.enabled ?? false;
  };

  const getThemeAccessLevel = (themeId: string): 'free' | 'pro' | null => {
    const theme = availableThemes.find(t => t.theme_id === themeId);
    return theme?.access_level ?? null;
  };

  return {
    availableThemes,
    isLoading,
    isThemeAvailable,
    getThemeAccessLevel,
  };
}

// Hook for checking feature availability (user-facing)
export function useFeatureFlags() {
  const { data: features = [], isLoading } = useQuery({
    queryKey: ['available-features'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_features')
        .select('feature_key, name, enabled');
      
      if (error) throw error;
      return data as Pick<PlatformFeature, 'feature_key' | 'name' | 'enabled'>[];
    },
    staleTime: 60000, // 1 minute cache
  });

  const isFeatureEnabled = (featureKey: string): boolean => {
    const feature = features.find(f => f.feature_key === featureKey);
    // Default to true if feature not found (backward compatibility)
    return feature?.enabled ?? true;
  };

  return {
    features,
    isLoading,
    isFeatureEnabled,
  };
}
