import { useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { useWorkspace } from '@/hooks/useWorkspace';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ResumeData,
  ResumeTemplate,
  renderClassicTemplate,
  renderModernTemplate,
  renderMinimalTemplate,
} from '@/lib/resume-templates';

export function useResumeExport() {
  const { portfolio } = useWorkspace();
  const { plan } = usePlanLimits();
  const [exporting, setExporting] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const fetchResumeData = useCallback(async (): Promise<ResumeData | null> => {
    if (!portfolio?.id) return null;

    try {
      const [experiencesRes, skillsRes, projectsRes, certificationsRes, userRes] = await Promise.all([
        supabase
          .from('experiences')
          .select('company, position, start_date, end_date, is_current, description, responsibilities, achievements')
          .eq('portfolio_id', portfolio.id)
          .order('start_date', { ascending: false }),
        supabase
          .from('skills')
          .select('name, category, proficiency')
          .eq('portfolio_id', portfolio.id)
          .order('display_order', { ascending: true }),
        supabase
          .from('projects')
          .select('title, short_description, description, technologies, project_url, github_url')
          .eq('portfolio_id', portfolio.id)
          .order('display_order', { ascending: true }),
        supabase
          .from('certifications')
          .select('name, issuer, issue_date, credential_id')
          .eq('portfolio_id', portfolio.id)
          .order('display_order', { ascending: true }),
        supabase.auth.getUser(),
      ]);

      return {
        portfolio: {
          title: portfolio.title,
          tagline: portfolio.tagline,
          bio: portfolio.bio,
          location: portfolio.location,
          linkedin_url: portfolio.linkedin_url,
          github_url: portfolio.github_url,
          website_url: portfolio.website_url,
        },
        experiences: experiencesRes.data || [],
        skills: skillsRes.data || [],
        projects: projectsRes.data || [],
        certifications: certificationsRes.data || [],
        userEmail: userRes.data?.user?.email || null,
      };
    } catch (error) {
      console.error('Error fetching resume data:', error);
      return null;
    }
  }, [portfolio]);

  const exportResume = useCallback(
    async (template: ResumeTemplate = 'classic') => {
      setExporting(true);

      try {
        const data = await fetchResumeData();
        if (!data) {
          toast.error('Failed to load resume data');
          setExporting(false);
          return;
        }

        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const showWatermark = plan === 'free';

        // Render based on selected template
        switch (template) {
          case 'modern':
            renderModernTemplate({ doc, data, showWatermark });
            break;
          case 'minimal':
            renderMinimalTemplate({ doc, data, showWatermark });
            break;
          case 'classic':
          default:
            renderClassicTemplate({ doc, data, showWatermark });
            break;
        }

        // Generate filename
        const fileName = `${data.portfolio.title.replace(/[^a-zA-Z0-9]/g, '_')}_Resume.pdf`;
        doc.save(fileName);

        toast.success('Resume exported successfully!');
      } catch (error) {
        console.error('Error exporting resume:', error);
        toast.error('Failed to export resume');
      } finally {
        setExporting(false);
      }
    },
    [fetchResumeData, plan]
  );

  const openTemplateSelector = useCallback(() => {
    setTemplateDialogOpen(true);
  }, []);

  return {
    exportResume,
    exporting,
    templateDialogOpen,
    setTemplateDialogOpen,
    openTemplateSelector,
  };
}
