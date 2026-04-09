import { format } from 'date-fns';
import type { TemplateRenderOptions } from './types';
import { formatDateRange, groupSkillsByCategory, truncateText } from './utils';

export function renderModernTemplate({ doc, data, showWatermark }: TemplateRenderOptions): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const maxFirstPageY = pageHeight - margin - 8;
  let yPos = margin;
  let isFirstPage = true;

  // Modern color scheme with accent
  const primaryColor = '#0f172a';
  const secondaryColor = '#64748b';
  const accentColor = '#3b82f6';
  const lightAccent = '#dbeafe';

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
    if (!checkNewPage(14)) return false;
    
    // Accent bar
    doc.setFillColor(accentColor);
    doc.rect(margin, yPos - 1, 3, 6, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor);
    doc.text(title, margin + 6, yPos + 3);
    yPos += 10;
    return true;
  };

  // Header with accent background
  doc.setFillColor(lightAccent);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(primaryColor);
  doc.text(data.portfolio.title || 'Resume', margin, 18);

  if (data.portfolio.tagline) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(accentColor);
    doc.text(data.portfolio.tagline, margin, 26);
  }

  yPos = 42;

  // Contact info in a row
  const contactParts: string[] = [];
  if (data.userEmail) contactParts.push(data.userEmail);
  if (data.portfolio.location) contactParts.push(data.portfolio.location);
  if (data.portfolio.linkedin_url) contactParts.push('LinkedIn');
  if (data.portfolio.github_url) contactParts.push('GitHub');

  if (contactParts.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor);
    doc.text(contactParts.join('   |   '), margin, yPos);
    yPos += 8;
  }

  // Summary
  if (data.portfolio.bio && getRemainingSpace() > 25) {
    drawSectionHeader('About');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(secondaryColor);
    const bioLines = doc.splitTextToSize(data.portfolio.bio, contentWidth);
    const limitedBio = bioLines.slice(0, 3);
    doc.text(limitedBio, margin, yPos);
    yPos += limitedBio.length * 4 + 6;
  }

  // Experience
  if (data.experiences.length > 0) {
    drawSectionHeader('Experience');
    const maxExperiences = getRemainingSpace() > 80 ? 4 : getRemainingSpace() > 50 ? 3 : 2;

    for (const exp of data.experiences.slice(0, maxExperiences)) {
      if (!checkNewPage(20)) break;

      // Position with colored accent
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(primaryColor);
      doc.text(exp.position, margin, yPos);

      const dateRange = formatDateRange(exp.start_date, exp.end_date, exp.is_current);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(accentColor);
      const dateWidth = doc.getTextWidth(dateRange);
      doc.text(dateRange, pageWidth - margin - dateWidth, yPos);
      yPos += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(secondaryColor);
      doc.text(exp.company, margin, yPos);
      yPos += 4;

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
          doc.text(`→ ${truncated}`, margin + 2, yPos);
          yPos += 3.5;
        }
      }

      yPos += 4;
    }
  }

  // Skills as pills/tags style
  if (data.skills.length > 0 && getRemainingSpace() > 18) {
    drawSectionHeader('Skills');
    const groupedSkills = groupSkillsByCategory(data.skills);

    doc.setFontSize(8);
    const categories = Object.entries(groupedSkills).slice(0, 3);

    for (const [category, skillNames] of categories) {
      if (!checkNewPage(8)) break;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accentColor);
      doc.text(category, margin, yPos);
      yPos += 4;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(secondaryColor);
      const limitedSkills = skillNames.slice(0, 10).join('  •  ');
      const skillsLines = doc.splitTextToSize(limitedSkills, contentWidth);
      doc.text(skillsLines[0], margin, yPos);
      yPos += 5;
    }
    yPos += 2;
  }

  // Projects
  if (data.projects.length > 0 && getRemainingSpace() > 22) {
    drawSectionHeader('Projects');
    const maxProjects = getRemainingSpace() > 45 ? 3 : 2;

    for (const project of data.projects.slice(0, maxProjects)) {
      if (!checkNewPage(14)) break;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(primaryColor);
      doc.text(project.title, margin, yPos);
      yPos += 3.5;

      if (project.technologies && project.technologies.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(accentColor);
        doc.text(project.technologies.slice(0, 4).join(' • '), margin, yPos);
        yPos += 3;
      }

      const description = project.short_description || project.description;
      if (description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(secondaryColor);
        const truncatedDesc = truncateText(description, 110);
        doc.text(truncatedDesc, margin, yPos);
        yPos += 3.5;
      }

      yPos += 3;
    }
  }

  // Certifications
  if (data.certifications.length > 0 && getRemainingSpace() > 14) {
    drawSectionHeader('Certifications');

    for (const cert of data.certifications.slice(0, 3)) {
      if (!checkNewPage(5)) break;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(primaryColor);
      const issueYear = cert.issue_date
        ? ` (${format(new Date(cert.issue_date), 'yyyy')})`
        : '';
      doc.text(`${cert.name} — ${cert.issuer}${issueYear}`, margin, yPos);
      yPos += 4;
    }
  }

  // Watermark
  if (showWatermark) {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor('#94a3b8');
      const watermarkText = 'Made with MakePortfolios';
      const watermarkWidth = doc.getTextWidth(watermarkText);
      doc.text(watermarkText, pageWidth - margin - watermarkWidth, pageHeight - 8);
    }
  }
}
