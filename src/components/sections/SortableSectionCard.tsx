import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Layout, FolderOpen, Briefcase, Award, Code, Mail, User, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { SectionItem, CoreSectionType } from '@/hooks/useSectionOrder';

interface SortableSectionCardProps {
  section: SectionItem;
  onToggleVisibility?: (sectionType: CoreSectionType, visible: boolean) => void;
}

const SECTION_ICONS: Record<string, React.ElementType> = {
  hero: Layout,
  about: User,
  projects: FolderOpen,
  experience: Briefcase,
  skills: Code,
  certifications: Award,
  custom_sections: Sparkles,
  contact: Mail,
};

const SECTION_DESCRIPTIONS: Record<string, string> = {
  hero: 'Main header with your name and tagline',
  about: 'Bio and introduction section',
  projects: 'Showcase your work and portfolio pieces',
  experience: 'Work history and professional experience',
  skills: 'Technical skills and expertise',
  certifications: 'Professional certifications and credentials',
  custom_sections: 'Your custom content sections',
  contact: 'Contact form and information',
};

// Sections that cannot have visibility toggled
const ALWAYS_VISIBLE_SECTIONS = ['hero', 'about', 'custom_sections'];

export function SortableSectionCard({ section, onToggleVisibility }: SortableSectionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const Icon = SECTION_ICONS[section.type] || Layout;
  const description = SECTION_DESCRIPTIONS[section.type] || '';
  const canToggleVisibility = !ALWAYS_VISIBLE_SECTIONS.includes(section.type);

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`transition-all ${isDragging ? 'shadow-lg ring-2 ring-accent/50' : ''} ${!section.visible && canToggleVisibility ? 'opacity-60' : ''}`}>
        <div className="flex items-center gap-4 p-4">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
            aria-label={`Drag to reorder ${section.name}`}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-accent" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">{section.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{description}</p>
          </div>

          {canToggleVisibility && onToggleVisibility && (
            <div className="flex items-center gap-2">
              {section.visible ? (
                <Eye className="h-4 w-4 text-muted-foreground" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <Switch
                checked={section.visible}
                onCheckedChange={(checked) => onToggleVisibility(section.type as CoreSectionType, checked)}
                aria-label={`Toggle ${section.name} visibility`}
              />
            </div>
          )}

          {!canToggleVisibility && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Always visible
            </span>
          )}
        </div>
      </Card>
    </div>
  );
}