import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  GripVertical, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  Github, 
  Star, 
  Eye, 
  EyeOff,
  Calendar,
  Users,
  Briefcase
} from 'lucide-react';
import type { Project } from '@/hooks/useProjects';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onTogglePublished?: (id: string, published: boolean) => void;
  onToggleFeatured?: (id: string, featured: boolean) => void;
}

export function ProjectCard({ project, onEdit, onDelete, onTogglePublished, onToggleFeatured }: ProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const dateRange = project.start_date 
    ? `${formatDate(project.start_date)}${project.end_date ? ` - ${formatDate(project.end_date)}` : ' - Present'}`
    : null;

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`group transition-all ${isDragging ? 'shadow-lg ring-2 ring-primary' : ''} ${!project.published ? 'opacity-60' : ''}`}
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

          {/* Image */}
          <div className="w-36 h-28 bg-muted flex-shrink-0 overflow-hidden relative">
            {project.image_url ? (
              <img 
                src={project.image_url} 
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                No image
              </div>
            )}
            {/* Status Badge */}
            {project.status && (
              <Badge 
                variant={project.status === 'Completed' ? 'default' : project.status === 'Ongoing' ? 'secondary' : 'outline'}
                className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0"
              >
                {project.status}
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-3 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{project.title}</h3>
                  {project.featured && (
                    <Star className="h-4 w-4 text-accent fill-accent flex-shrink-0" />
                  )}
                  {!project.published && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Draft
                    </Badge>
                  )}
                  {project.project_type && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {project.project_type}
                    </Badge>
                  )}
                </div>
                {(project.short_description || project.description) && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                    {project.short_description || project.description}
                  </p>
                )}
                
                {/* Meta info */}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  {project.category && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {project.category}
                    </span>
                  )}
                  {project.role && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {project.role}
                    </span>
                  )}
                  {dateRange && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {dateRange}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {onTogglePublished && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onTogglePublished(project.id, !project.published)}
                    title={project.published ? 'Unpublish' : 'Publish'}
                  >
                    {project.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                )}
                {onToggleFeatured && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onToggleFeatured(project.id, !project.featured)}
                    title={project.featured ? 'Unfeature' : 'Feature'}
                  >
                    <Star className={`h-4 w-4 ${project.featured ? 'text-accent fill-accent' : ''}`} />
                  </Button>
                )}
                {project.project_url && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {project.github_url && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => onEdit(project)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(project.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Technologies */}
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {project.technologies.slice(0, 6).map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {tech}
                  </Badge>
                ))}
                {project.technologies.length > 6 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    +{project.technologies.length - 6}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
