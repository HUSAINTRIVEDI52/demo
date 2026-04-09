import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GripVertical, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import type { Skill } from '@/hooks/useSkills';

interface SkillCardProps {
  skill: Skill;
  onEdit: (skill: Skill) => void;
  onDelete: (id: string) => void;
  onTogglePublished?: (id: string, published: boolean) => void;
}

export function SkillCard({ skill, onEdit, onDelete, onTogglePublished }: SkillCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skill.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const proficiency = skill.proficiency ?? 80;
  const isPublished = skill.published ?? true;

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`group transition-all ${isDragging ? 'shadow-lg ring-2 ring-primary' : ''} ${!isPublished ? 'opacity-60' : ''}`}
    >
      <CardContent className="p-0">
        <div className="flex items-center">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-center justify-center w-10 h-full min-h-[60px] bg-muted/50 cursor-grab active:cursor-grabbing hover:bg-muted transition-colors"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Content */}
          <div className="flex-1 p-4 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium truncate">{skill.name}</h3>
                  {skill.category && (
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {skill.category}
                    </Badge>
                  )}
                  {!isPublished && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Draft
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={proficiency} className="flex-1 h-2" />
                  <span className="text-sm text-muted-foreground w-10 text-right">
                    {proficiency}%
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {onTogglePublished && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onTogglePublished(skill.id, !isPublished)}
                    title={isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => onEdit(skill)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(skill.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}