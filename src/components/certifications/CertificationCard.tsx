import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Pencil, Trash2, ExternalLink, Calendar, Hash } from 'lucide-react';
import { format, isPast } from 'date-fns';
import type { Certification } from '@/hooks/useCertifications';

interface CertificationCardProps {
  certification: Certification;
  onEdit: (certification: Certification) => void;
  onDelete: (id: string) => void;
}

export function CertificationCard({ certification, onEdit, onDelete }: CertificationCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: certification.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isExpired = certification.expiry_date && isPast(new Date(certification.expiry_date));

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`group transition-all ${isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}
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
                  <h3 className="font-semibold">{certification.name}</h3>
                  {isExpired && (
                    <Badge variant="destructive" className="text-xs">Expired</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{certification.issuer}</p>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                  {certification.issue_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Issued {format(new Date(certification.issue_date), 'MMM yyyy')}
                    </span>
                  )}
                  {certification.expiry_date && (
                    <span className="flex items-center gap-1">
                      {isExpired ? 'Expired' : 'Expires'} {format(new Date(certification.expiry_date), 'MMM yyyy')}
                    </span>
                  )}
                  {certification.credential_id && (
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {certification.credential_id}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {certification.credential_url && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={certification.credential_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => onEdit(certification)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(certification.id)}
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
