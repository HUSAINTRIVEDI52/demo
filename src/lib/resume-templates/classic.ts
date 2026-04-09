import { format } from 'date-fns';
import type { TemplateRenderOptions } from './types';
import { formatDateRange, groupSkillsByCategory, truncateText } from './utils';

export function renderClassicTemplate({ doc, data, showWatermark }: TemplateRenderOptions): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const maxFirstPageY = pageHeight - margin - 8;
  let yPos = margin;
  let isFirstPage = true;

  // Colors
  const primaryColor = '#1a1a1a';
  const secondaryColor = '#555555';
  const accentColor = '#374151';
  const lineColor = '#d1d5db';

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
    if (!checkNewPage(12)) return false;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor);
    doc.text(title.toUpperCase(), margin, yPos);
    yPos += 1.5;
    doc.setDrawColor(lineColor);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 4;
    return true;
  };

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(primaryColor);
  doc.text(data.portfolio.title || 'Resume', margin, yPos);
  yPos += 6;

  if (data.portfolio.tagline) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(accentColor);
    doc.text(data.portfolio.tagline, margin, yPos);
    yPos += 4;
  }

  const contactParts: string[] = [];
  if (data.userEmail) contactParts.push(data.userEmail);
  if (data.portfolio.location) contactParts.push(data.portfolio.location);
  if (data.portfolio.linkedin_url) contactParts.push('LinkedIn');
  if (data.portfolio.github_url) contactParts.push('GitHub');
  if (data.portfolio.website_url) contactParts.push('Portfolio');

  if (contactParts.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor);
    doc.text(contactParts.join('  •  '), margin, yPos);
    yPos += 5;
  }

  yPos += 3;

  // Summary
  if (data.portfolio.bio && getRemainingSpace() > 20) {
    drawSectionHeader('Summary');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(secondaryColor);
    const bioLines = doc.splitTextToSize(data.portfolio.bio, contentWidth);
    const limitedBio = bioLines.slice(0, 3);
    doc.text(limitedBio, margin, yPos);
    yPos += limitedBio.length * 3.5 + 4;
  }

  // Experience
  if (data.experiences.length > 0) {
    drawSectionHeader('Experience');
    const maxExperiences = getRemainingSpace() > 80 ? 4 : getRemainingSpace() > 50 ? 3 : 2;

    for (const exp of data.experiences.slice(0, maxExperiences)) {
      if (!checkNewPage(18)) break;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(primaryColor);
      doc.text(exp.position, margin, yPos);

      const dateRange = formatDateRange(exp.start_date, exp.end_date, exp.is_current);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(secondaryColor);
      const dateWidth = doc.getTextWidth(dateRange);
      doc.text(dateRange, pageWidth - margin - dateWidth, yPos);
      yPos += 3.5;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(accentColor);
      doc.text(exp.company, margin, yPos);
      yPos += 3.5;

      const bullets: string[] = [];
      if (exp.responsibilities) bullets.push(...exp.responsibilities.slice(0, 2));
      if (exp.achievements) bullets.push(...exp.achievements.slice(0, 1));

      if (bullets.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(secondaryColor);

        for (const bullet of bullets.slice(0, 3)) {
          if (!checkNewPage(5)) break;
          const truncated = truncateText(bullet, 100);
          const bulletText = doc.splitTextToSize(`• ${truncated}`, contentWidth - 3);
          doc.text(bulletText[0], margin + 2, yPos);
          yPos += 3.2;
        }
      }

      yPos += 3;
    }
  }

  // Skills
  if (data.skills.length > 0 && getRemainingSpace() > 15) {
    drawSectionHeader('Skills');
    const groupedSkills = groupSkillsByCategory(data.skills);

    doc.setFontSize(8);
    const categories = Object.entries(groupedSkills).slice(0, 4);

    for (const [category, skillNames] of categories) {
      if (!checkNewPage(6)) break;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor);
      doc.text(`${category}: `, margin, yPos);

      const labelWidth = doc.getTextWidth(`${category}: `);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(secondaryColor);
      const limitedSkills = skillNames.slice(0, 8).join(', ');
      const skillsLines = doc.splitTextToSize(limitedSkills, contentWidth - labelWidth);
      doc.text(skillsLines[0], margin + labelWidth, yPos);
      yPos += 4;
    }
    yPos += 2;
  }

  // Projects
  if (data.projects.length > 0 && getRemainingSpace() > 20) {
    drawSectionHeader('Projects');
    const maxProjects = getRemainingSpace() > 40 ? 3 : 2;

    for (const project of data.projects.slice(0, maxProjects)) {
      if (!checkNewPage(12)) break;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(primaryColor);

      let titleLine = project.title;
      if (project.technologies && project.technologies.length > 0) {
        titleLine += ` (${project.technologies.slice(0, 3).join(', ')})`;
      }
      doc.text(titleLine, margin, yPos);
      yPos += 3.5;

      const description = project.short_description || project.description;
      if (description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(secondaryColor);
        const truncatedDesc = truncateText(description, 120);
        doc.text(truncatedDesc, margin, yPos);
        yPos += 3.5;
      }

      yPos += 2;
    }
  }

  // Certifications
  if (data.certifications.length > 0 && getRemainingSpace() > 12) {
    drawSectionHeader('Certifications');

    doc.setFontSize(8);
    const certLines: string[] = [];

    for (const cert of data.certifications.slice(0, 4)) {
      const issueYear = cert.issue_date
        ? ` (${format(new Date(cert.issue_date), 'yyyy')})`
        : '';
      certLines.push(`${cert.name} - ${cert.issuer}${issueYear}`);
    }

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor);

    for (const line of certLines) {
      if (!checkNewPage(4)) break;
      doc.text(`• ${line}`, margin, yPos);
      yPos += 3.5;
    }
  }

  // Watermark
  if (showWatermark) {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor('#aaaaaa');
      const watermarkText = 'Made with MakePortfolios';
      const watermarkWidth = doc.getTextWidth(watermarkText);
      doc.text(watermarkText, pageWidth - margin - watermarkWidth, pageHeight - 8);
    }
  }
}
