import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { toast } from 'sonner';
import { useMemo } from 'react';

export type CoreSectionType = 
  | 'hero' 
  | 'about' 
  | 'projects' 
  | 'experience' 
  | 'skills' 
  | 'certifications' 
  | 'custom_sections' 
  | 'contact';

export interface SectionItem {
  id: string;
  type: CoreSectionType | 'custom';
  name: string;
  visible: boolean;
  order: number;
  isCore: boolean;
  customSectionId?: string;
}

export interface SectionOrderData {
  hero_order: number;
  about_order: number;
  projects_order: number;
  experience_order: number;
  skills_order: number;
  certifications_order: number;
  custom_sections_order: number;
  contact_order: number;
}

interface SectionRawData extends SectionOrderData {
  show_projects: boolean | null;
  show_experience: boolean | null;
  show_skills: boolean | null;
  show_certifications: boolean | null;
  show_contact: boolean | null;
}

const CORE_SECTIONS: { type: CoreSectionType; name: string; visibilityKey?: keyof SectionRawData }[] = [
  { type: 'hero', name: 'Hero' },
  { type: 'about', name: 'About' },
  { type: 'projects', name: 'Projects', visibilityKey: 'show_projects' },
  { type: 'experience', name: 'Experience', visibilityKey: 'show_experience' },
  { type: 'skills', name: 'Skills', visibilityKey: 'show_skills' },
  { type: 'certifications', name: 'Certifications', visibilityKey: 'show_certifications' },
  { type: 'custom_sections', name: 'Custom Sections' },
  { type: 'contact', name: 'Contact', visibilityKey: 'show_contact' },
];

const QUERY_KEY = 'section_order';

export function useSectionOrder() {
  const { portfolio } = useWorkspace();
  const queryClient = useQueryClient();
  const portfolioId = portfolio?.id;

  // Query for fetching section order
  const { data: rawData, isLoading: loading } = useQuery({
    queryKey: [QUERY_KEY, portfolioId],
    queryFn: async () => {
      if (!portfolioId) return null;

      const { data, error } = await supabase
        .from('portfolio_sections')
        .select('hero_order, about_order, projects_order, experience_order, skills_order, certifications_order, custom_sections_order, contact_order, show_projects, show_experience, show_skills, show_certifications, show_contact')
        .eq('portfolio_id', portfolioId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching section order:', error);
        toast.error('Could not load section order');
        return null;
      }

      return data as SectionRawData | null;
    },
    enabled: !!portfolioId,
  });

  // Derive section order and ordered sections from raw data
  const { sectionOrder, orderedSections } = useMemo(() => {
    if (!rawData) {
      return { 
        sectionOrder: null, 
        orderedSections: [] 
      };
    }

    const orderData: SectionOrderData = {
      hero_order: rawData.hero_order ?? 0,
      about_order: rawData.about_order ?? 1,
      projects_order: rawData.projects_order ?? 2,
      experience_order: rawData.experience_order ?? 3,
      skills_order: rawData.skills_order ?? 4,
      certifications_order: rawData.certifications_order ?? 5,
      custom_sections_order: rawData.custom_sections_order ?? 6,
      contact_order: rawData.contact_order ?? 7,
    };

    const sectionItems: SectionItem[] = CORE_SECTIONS.map((section) => {
      const orderKey = `${section.type}_order` as keyof SectionOrderData;
      let visible = true;

      if (section.visibilityKey) {
        const visValue = rawData[section.visibilityKey];
        visible = typeof visValue === 'boolean' ? visValue : true;
      }

      return {
        id: section.type,
        type: section.type,
        name: section.name,
        visible,
        order: orderData[orderKey],
        isCore: true,
      };
    });

    sectionItems.sort((a, b) => a.order - b.order);

    return {
      sectionOrder: orderData,
      orderedSections: sectionItems,
    };
  }, [rawData]);

  // Update order mutation with optimistic update
  const updateOrderMutation = useMutation({
    mutationFn: async (reorderedSections: SectionItem[]) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const updates: Record<string, number> = {};
      reorderedSections.forEach((section, index) => {
        if (section.isCore) {
          updates[`${section.type}_order`] = index;
        }
      });

      const { error } = await supabase
        .from('portfolio_sections')
        .update(updates)
        .eq('portfolio_id', portfolioId);

      if (error) throw error;
    },
    onMutate: async (reorderedSections) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousData = queryClient.getQueryData<SectionRawData>([QUERY_KEY, portfolioId]);

      // Build optimistic update
      const newRawData = { ...previousData } as SectionRawData;
      reorderedSections.forEach((section, index) => {
        if (section.isCore) {
          const key = `${section.type}_order` as keyof SectionOrderData;
          (newRawData as any)[key] = index;
        }
      });

      queryClient.setQueryData([QUERY_KEY, portfolioId], newRawData);

      return { previousData };
    },
    onSuccess: () => {
      toast.success('Section order updated');
    },
    onError: (error, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousData);
      }
      toast.error('Could not save section order. Please try again.');
      console.error(error);
    },
  });

  // Toggle visibility mutation with optimistic update
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ sectionType, visible }: { sectionType: CoreSectionType; visible: boolean }) => {
      if (!portfolioId) throw new Error('No portfolio found');

      const section = CORE_SECTIONS.find(s => s.type === sectionType);
      if (!section?.visibilityKey) throw new Error('Section does not support visibility toggle');

      const { error } = await supabase
        .from('portfolio_sections')
        .update({ [section.visibilityKey]: visible })
        .eq('portfolio_id', portfolioId);

      if (error) throw error;
      return { sectionType, visible, sectionName: section.name };
    },
    onMutate: async ({ sectionType, visible }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, portfolioId] });
      const previousData = queryClient.getQueryData<SectionRawData>([QUERY_KEY, portfolioId]);

      const section = CORE_SECTIONS.find(s => s.type === sectionType);
      if (previousData && section?.visibilityKey) {
        const newRawData = { ...previousData, [section.visibilityKey]: visible };
        queryClient.setQueryData([QUERY_KEY, portfolioId], newRawData);
      }

      return { previousData };
    },
    onSuccess: ({ sectionName, visible }) => {
      toast.success(`${sectionName} ${visible ? 'shown' : 'hidden'}`);
    },
    onError: (error, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([QUERY_KEY, portfolioId], context.previousData);
      }
      toast.error('Could not update visibility. Please try again.');
      console.error(error);
    },
  });

  // Wrapper functions for backward compatibility
  const updateSectionOrder = async (reorderedSections: SectionItem[]) => {
    try {
      await updateOrderMutation.mutateAsync(reorderedSections);
      return { success: true };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const toggleSectionVisibility = async (sectionType: CoreSectionType, visible: boolean) => {
    try {
      await toggleVisibilityMutation.mutateAsync({ sectionType, visible });
      return { success: true };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY, portfolioId] });
  };

  return {
    orderedSections,
    sectionOrder,
    loading,
    saving: updateOrderMutation.isPending || toggleVisibilityMutation.isPending,
    updateSectionOrder,
    toggleSectionVisibility,
    refetch,
  };
}

// Helper function to get section order for public rendering
export function getSortedSectionsForRendering(
  sectionOrder: SectionOrderData | null
): CoreSectionType[] {
  if (!sectionOrder) {
    return ['hero', 'about', 'projects', 'experience', 'skills', 'certifications', 'custom_sections', 'contact'];
  }

  const sections: { type: CoreSectionType; order: number }[] = [
    { type: 'hero', order: sectionOrder.hero_order },
    { type: 'about', order: sectionOrder.about_order },
    { type: 'projects', order: sectionOrder.projects_order },
    { type: 'experience', order: sectionOrder.experience_order },
    { type: 'skills', order: sectionOrder.skills_order },
    { type: 'certifications', order: sectionOrder.certifications_order },
    { type: 'custom_sections', order: sectionOrder.custom_sections_order },
    { type: 'contact', order: sectionOrder.contact_order },
  ];

  sections.sort((a, b) => a.order - b.order);
  return sections.map(s => s.type);
}
