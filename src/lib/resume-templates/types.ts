import { jsPDF } from 'jspdf';

export interface ResumeData {
  portfolio: {
    title: string;
    tagline: string | null;
    bio: string | null;
    location: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    website_url: string | null;
  };
  experiences: Array<{
    company: string;
    position: string;
    start_date: string;
    end_date: string | null;
    is_current: boolean | null;
    description: string | null;
    responsibilities: string[] | null;
    achievements: string[] | null;
  }>;
  skills: Array<{
    name: string;
    category: string | null;
    proficiency: number | null;
  }>;
  projects: Array<{
    title: string;
    short_description: string | null;
    description: string | null;
    technologies: string[] | null;
    project_url: string | null;
    github_url: string | null;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issue_date: string | null;
    credential_id: string | null;
  }>;
  userEmail: string | null;
}

export type ResumeTemplate = 'classic' | 'modern' | 'minimal';

export interface TemplateConfig {
  id: ResumeTemplate;
  name: string;
  description: string;
  preview: string; // emoji or icon representation
}

export interface TemplateRenderOptions {
  doc: jsPDF;
  data: ResumeData;
  showWatermark: boolean;
}

export const RESUME_TEMPLATES: TemplateConfig[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional resume layout with clear sections and professional styling',
    preview: '📄',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with accent colors and clean typography',
    preview: '✨',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple layout focusing on content over decoration',
    preview: '◻️',
  },
];
