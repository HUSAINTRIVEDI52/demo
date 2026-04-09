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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Briefcase, Lock } from 'lucide-react';
import { useExperiences, type Experience as ExperienceType } from '@/hooks/useExperiences';
import { ExperienceCard } from '@/components/experiences/ExperienceCard';
import { ExperienceFormDialog } from '@/components/experiences/ExperienceFormDialog';
import { DeleteExperienceDialog } from '@/components/experiences/DeleteExperienceDialog';
import { useWorkspace } from '@/hooks/useWorkspace';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { UsageCounter } from '@/components/plan/UsageCounter';
import { UpgradeBanner } from '@/components/plan/UpgradeBanner';
import { UpgradeModal } from '@/components/plan/UpgradeModal';
import { ListSkeleton } from '@/components/ui/premium-skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function Experience() {
  const { loading: workspaceLoading } = useWorkspace();
  const { experiences, loading, createExperience, updateExperience, deleteExperience, reorderExperiences, togglePublished } = useExperiences();
  const { canAddExperience, getExperienceUsage, refetchUsage } = usePlanLimits();
  
  const experienceUsage = getExperienceUsage();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<ExperienceType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingExperience, setDeletingExperience] = useState<ExperienceType | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = experiences.findIndex((e) => e.id === active.id);
      const newIndex = experiences.findIndex((e) => e.id === over.id);
      const reordered = arrayMove(experiences, oldIndex, newIndex);
      reorderExperiences(reordered);
    }
  };

  const handleEdit = (experience: ExperienceType) => {
    setEditingExperience(experience);
    setFormOpen(true);
  };

  const handleDelete = (experience: ExperienceType) => {
    setDeletingExperience(experience);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingExperience) {
      await deleteExperience(deletingExperience.id);
      setDeleteDialogOpen(false);
      setDeletingExperience(null);
    }
  };

  const handleFormSubmit = async (data: Omit<ExperienceType, 'id' | 'portfolio_id' | 'created_at' | 'updated_at' | 'display_order'>) => {
    if (editingExperience) {
      await updateExperience(editingExperience.id, data);
    } else {
      await createExperience(data);
    }
    setEditingExperience(null);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingExperience(null);
    }
  };

  const handleAddExperience = () => {
    if (experienceUsage.isAtLimit) {
      setUpgradeModalOpen(true);
    } else {
      setFormOpen(true);
    }
  };

  if (workspaceLoading || loading) {
    return <ListSkeleton count={3} showHeader itemHeight="h-28" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold mb-2">Experience</h1>
          <p className="text-muted-foreground">
            Showcase your work history. Drag to reorder.
          </p>
          <UsageCounter 
            current={experienceUsage.current} 
            max={experienceUsage.max} 
            label="Experiences" 
            className="mt-2"
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button onClick={handleAddExperience}>
                  {experienceUsage.isAtLimit ? (
                    <Lock className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Experience
                </Button>
              </span>
            </TooltipTrigger>
            {experienceUsage.isAtLimit && (
              <TooltipContent>
                <p>Upgrade to Pro to add more experiences</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {experienceUsage.isAtLimit && (
        <UpgradeBanner message="You've reached the experience limit on the Free plan. Upgrade to Pro for unlimited experiences." trigger="experiences" />
      )}

      {experiences.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          headline="No experience yet"
          description="Add your professional experience to build credibility and show your career journey."
          actionLabel="Add Your First Experience"
          onAction={handleAddExperience}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={experiences.map(e => e.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {experiences.map((experience) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  onEdit={handleEdit}
                  onDelete={() => handleDelete(experience)}
                  onTogglePublished={togglePublished}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ExperienceFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        experience={editingExperience}
        onSubmit={handleFormSubmit}
      />

      <DeleteExperienceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        experienceTitle={deletingExperience ? `${deletingExperience.position} at ${deletingExperience.company}` : ''}
      />

      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} trigger="experiences" />
    </div>
  );
}
