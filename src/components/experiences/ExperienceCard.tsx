import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Pencil, Trash2, MapPin, Calendar, Eye, EyeOff, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import type { Experience } from '@/hooks/useExperiences';

interface ExperienceCardProps {
  experience: Experience;
  onEdit: (experience: Experience) => void;
  onDelete: (id: string) => void;
  onTogglePublished?: (id: string, published: boolean) => void;
}

export function ExperienceCard({ experience, onEdit, onDelete, onTogglePublished }: ExperienceCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: experience.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM yyyy');
  };

  const dateRange = experience.is_current
    ? `${formatDate(experience.start_date)} - Present`
    : experience.end_date
      ? `${formatDate(experience.start_date)} - ${formatDate(experience.end_date)}`
      : formatDate(experience.start_date);

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`group transition-all ${isDragging ? 'shadow-lg ring-2 ring-primary' : ''} ${!experience.published ? 'opacity-60' : ''}`}
    >
      <CardContent className="p-0">
        <div className="flex">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-center justify-center w-10 bg-muted/50 cursor-grab active:cursor-grabbing hover:bg-muted transition-colors"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Content */}
          <div className="flex-1 p-4 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{experience.position}</h3>
                  {experience.is_current && (
                    <Badge variant="default" className="text-xs">Current</Badge>
                  )}
                  {experience.employment_type && (
                    <Badge variant="secondary" className="text-xs">{experience.employment_type}</Badge>
                  )}
                  {!experience.published && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Draft
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{experience.company}</p>
                
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {dateRange}
                  </span>
                  {experience.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {experience.location}
                    </span>
                  )}
                </div>

                {(experience.role_summary || experience.description) && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {experience.role_summary || experience.description}
                  </p>
                )}

                {/* Technologies */}
                {experience.technologies_used && experience.technologies_used.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {experience.technologies_used.slice(0, 5).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-[10px] px-1.5 py-0">
                        {tech}
                      </Badge>
                    ))}
                    {experience.technologies_used.length > 5 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        +{experience.technologies_used.length - 5}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Achievements preview */}
                {experience.achievements && experience.achievements.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    ✓ {experience.achievements.length} achievement{experience.achievements.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {onTogglePublished && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onTogglePublished(experience.id, !experience.published)}
                    title={experience.published ? 'Unpublish' : 'Publish'}
                  >
                    {experience.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => onEdit(experience)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(experience.id)}
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
