import { format } from 'date-fns';
import type { ResumeData } from './types';

export const formatDateRange = (
  startDate: string,
  endDate: string | null,
  isCurrent: boolean | null
): string => {
  const start = format(new Date(startDate), 'MMM yyyy');
  if (isCurrent) return `${start} - Present`;
  if (!endDate) return start;
  return `${start} - ${format(new Date(endDate), 'MMM yyyy')}`;
};

export const groupSkillsByCategory = (
  skills: ResumeData['skills']
): Record<string, string[]> => {
  return skills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill.name);
    return acc;
  }, {} as Record<string, string[]>);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};
