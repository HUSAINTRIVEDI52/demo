import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Plus, Award } from 'lucide-react';
import { useCertifications, type Certification } from '@/hooks/useCertifications';
import { CertificationCard } from '@/components/certifications/CertificationCard';
import { CertificationFormDialog } from '@/components/certifications/CertificationFormDialog';
import { DeleteCertificationDialog } from '@/components/certifications/DeleteCertificationDialog';
import { useWorkspace } from '@/hooks/useWorkspace';
import { ListSkeleton } from '@/components/ui/premium-skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function Certifications() {
  const { loading: workspaceLoading } = useWorkspace();
  const { certifications, loading, createCertification, updateCertification, deleteCertification, reorderCertifications } = useCertifications();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCertification, setDeletingCertification] = useState<Certification | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = certifications.findIndex((c) => c.id === active.id);
      const newIndex = certifications.findIndex((c) => c.id === over.id);
      const reordered = arrayMove(certifications, oldIndex, newIndex);
      reorderCertifications(reordered);
    }
  };

  const handleEdit = (certification: Certification) => {
    setEditingCertification(certification);
    setFormOpen(true);
  };

  const handleDelete = (certification: Certification) => {
    setDeletingCertification(certification);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingCertification) {
      await deleteCertification(deletingCertification.id);
      setDeleteDialogOpen(false);
      setDeletingCertification(null);
    }
  };

  const handleFormSubmit = async (data: Omit<Certification, 'id' | 'portfolio_id' | 'created_at' | 'display_order'>) => {
    if (editingCertification) {
      await updateCertification(editingCertification.id, data);
    } else {
      await createCertification(data);
    }
    setEditingCertification(null);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingCertification(null);
    }
  };

  if (workspaceLoading || loading) {
    return <ListSkeleton count={3} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold mb-2">Certifications</h1>
          <p className="text-muted-foreground">
            Showcase your credentials. Drag to reorder.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Certification
        </Button>
      </div>

      {certifications.length === 0 ? (
        <EmptyState
          icon={Award}
          headline="No certifications yet"
          description="Add professional certifications and credentials to validate your expertise."
          actionLabel="Add Your First Certification"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={certifications.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {certifications.map((certification) => (
                <CertificationCard
                  key={certification.id}
                  certification={certification}
                  onEdit={handleEdit}
                  onDelete={() => handleDelete(certification)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <CertificationFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        certification={editingCertification}
        onSubmit={handleFormSubmit}
      />

      <DeleteCertificationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        certificationName={deletingCertification?.name}
      />
    </div>
  );
}
