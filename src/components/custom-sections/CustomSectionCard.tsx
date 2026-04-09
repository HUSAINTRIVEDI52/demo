import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { CustomSection } from '@/hooks/useCustomSections';

interface CustomSectionCardProps {
  section: CustomSection;
  onEdit: (section: CustomSection) => void;
  onDelete: (section: CustomSection) => void;
  onToggleVisibility: (id: string, visibility: boolean) => void;
}

export function CustomSectionCard({ section, onEdit, onDelete, onToggleVisibility }: CustomSectionCardProps) {
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
    opacity: isDragging ? 0.5 : 1,
  };

  // Sanitize content for preview (strip HTML tags)
  const contentPreview = section.content 
    ? section.content.replace(/<[^>]*>/g, '').slice(0, 150) + (section.content.length > 150 ? '...' : '')
    : 'No content yet';

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`${!section.visibility ? 'opacity-60' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between gap-4 py-3 px-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
            >
              <GripVertical className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{section.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{contentPreview}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {section.visibility ? (
                <Eye className="h-4 w-4 text-muted-foreground" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <Switch
                checked={section.visibility}
                onCheckedChange={(checked) => onToggleVisibility(section.id, checked)}
                aria-label="Toggle visibility"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => onEdit(section)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(section)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
