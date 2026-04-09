import { format } from 'date-fns';
import type { TemplateRenderOptions } from './types';
import { formatDateRange, groupSkillsByCategory, truncateText } from './utils';

export function renderMinimalTemplate({ doc, data, showWatermark }: TemplateRenderOptions): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  const maxFirstPageY = pageHeight - margin - 8;
  let yPos = margin + 5;
  let isFirstPage = true;

  // Minimal grayscale palette
  const textColor = '#1f2937';
  const mutedColor = '#6b7280';

  const getRemainingSpace = () => maxFirstPageY - yPos;

  const checkNewPage = (requiredSpace: number): boolean => {
    if (yPos + requiredSpace > maxFirstPageY) {
      if (isFirstPage) {
        doc.addPage();
        yPos = margin;
        isFirstPage = false;
        return true;
      }
      return false;
    }
    return true;
  };

  const drawSectionHeader = (title: string): boolean => {
    if (!checkNewPage(10)) return false;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(mutedColor);
    doc.text(title.toLowerCase(), margin, yPos);
    yPos += 5;
    return true;
  };

  // Centered header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(textColor);
  const nameWidth = doc.getTextWidth(data.portfolio.title || 'Resume');
  doc.text(data.portfolio.title || 'Resume', (pageWidth - nameWidth) / 2, yPos);
  yPos += 5;

  if (data.portfolio.tagline) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(mutedColor);
    const tagWidth = doc.getTextWidth(data.portfolio.tagline);
    doc.text(data.portfolio.tagline, (pageWidth - tagWidth) / 2, yPos);
    yPos += 4;
  }

  // Contact as centered single line
  const contactParts: string[] = [];
  if (data.userEmail) contactParts.push(data.userEmail);
  if (data.portfolio.location) contactParts.push(data.portfolio.location);

  if (contactParts.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(mutedColor);
    const contactText = contactParts.join('  ·  ');
    const contactWidth = doc.getTextWidth(contactText);
    doc.text(contactText, (pageWidth - contactWidth) / 2, yPos);
    yPos += 8;
  }

  // Thin divider
  doc.setDrawColor(mutedColor);
  doc.setLineWidth(0.2);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Summary
  if (data.portfolio.bio && getRemainingSpace() > 20) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(textColor);
    const bioLines = doc.splitTextToSize(data.portfolio.bio, contentWidth);
    const limitedBio = bioLines.slice(0, 2);
    doc.text(limitedBio, margin, yPos);
    yPos += limitedBio.length * 4 + 6;
  }

  // Experience
  if (data.experiences.length > 0) {
    drawSectionHeader('experience');
    const maxExperiences = getRemainingSpace() > 70 ? 4 : getRemainingSpace() > 45 ? 3 : 2;

    for (const exp of data.experiences.slice(0, maxExperiences)) {
      if (!checkNewPage(16)) break;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(textColor);
      doc.text(exp.position, margin, yPos);

      const dateRange = formatDateRange(exp.start_date, exp.end_date, exp.is_current);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(mutedColor);
      const dateWidth = doc.getTextWidth(dateRange);
      doc.text(dateRange, pageWidth - margin - dateWidth, yPos);
      yPos += 3.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(mutedColor);
      doc.text(exp.company, margin, yPos);
      yPos += 4;

      const bullets: string[] = [];
      if (exp.responsibilities) bullets.push(...exp.responsibilities.slice(0, 2));

      if (bullets.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(textColor);

        for (const bullet of bullets.slice(0, 2)) {
          if (!checkNewPage(4)) break;
          const truncated = truncateText(bullet, 95);
          doc.text(`– ${truncated}`, margin, yPos);
          yPos += 3.2;
        }
      }

      yPos += 3;
    }
  }

  // Skills - single line per category
  if (data.skills.length > 0 && getRemainingSpace() > 12) {
    drawSectionHeader('skills');
    const groupedSkills = groupSkillsByCategory(data.skills);

    doc.setFontSize(8);
    const categories = Object.entries(groupedSkills).slice(0, 3);

    for (const [category, skillNames] of categories) {
      if (!checkNewPage(5)) break;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor);
      const limitedSkills = skillNames.slice(0, 8).join(', ');
      doc.text(`${category}: ${limitedSkills}`, margin, yPos);
      yPos += 4;
    }
    yPos += 2;
  }

  // Projects - ultra compact
  if (data.projects.length > 0 && getRemainingSpace() > 16) {
    drawSectionHeader('projects');
    const maxProjects = getRemainingSpace() > 35 ? 3 : 2;

    for (const project of data.projects.slice(0, maxProjects)) {
      if (!checkNewPage(10)) break;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(textColor);
      doc.text(project.title, margin, yPos);
      yPos += 3.5;

      const description = project.short_description || project.description;
      if (description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(mutedColor);
        const truncatedDesc = truncateText(description, 100);
        doc.text(truncatedDesc, margin, yPos);
        yPos += 3.5;
      }

      yPos += 2;
    }
  }

  // Certifications
  if (data.certifications.length > 0 && getRemainingSpace() > 10) {
    drawSectionHeader('certifications');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textColor);

    const certNames = data.certifications
      .slice(0, 3)
      .map((c) => c.name)
      .join('  ·  ');
    doc.text(certNames, margin, yPos);
    yPos += 4;
  }

  // Watermark
  if (showWatermark) {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor('#9ca3af');
      const watermarkText = 'Made with MakePortfolios';
      const watermarkWidth = doc.getTextWidth(watermarkText);
      doc.text(watermarkText, pageWidth - margin - watermarkWidth, pageHeight - 8);
    }
  }
}
