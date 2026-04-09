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
import { Plus, Zap, Lock } from 'lucide-react';
import { useSkills, type Skill } from '@/hooks/useSkills';
import { SkillCard } from '@/components/skills/SkillCard';
import { SkillFormDialog } from '@/components/skills/SkillFormDialog';
import { DeleteSkillDialog } from '@/components/skills/DeleteSkillDialog';
import { useWorkspace } from '@/hooks/useWorkspace';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { UsageCounter } from '@/components/plan/UsageCounter';
import { UpgradeBanner } from '@/components/plan/UpgradeBanner';
import { UpgradeModal } from '@/components/plan/UpgradeModal';
import { ListSkeleton } from '@/components/ui/premium-skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function Skills() {
  const { loading: workspaceLoading } = useWorkspace();
  const { skills, categories, loading, createSkill, updateSkill, deleteSkill, reorderSkills, togglePublished } = useSkills();
  const { canAddSkill, getSkillUsage, refetchUsage } = usePlanLimits();
  
  const skillUsage = getSkillUsage();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSkill, setDeletingSkill] = useState<Skill | null>(null);
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
      const oldIndex = skills.findIndex((s) => s.id === active.id);
      const newIndex = skills.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(skills, oldIndex, newIndex);
      reorderSkills(reordered);
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormOpen(true);
  };

  const handleDelete = (skill: Skill) => {
    setDeletingSkill(skill);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingSkill) {
      await deleteSkill(deletingSkill.id);
      setDeleteDialogOpen(false);
      setDeletingSkill(null);
    }
  };

  const handleFormSubmit = async (data: Omit<Skill, 'id' | 'portfolio_id' | 'created_at' | 'updated_at' | 'display_order'>) => {
    if (editingSkill) {
      await updateSkill(editingSkill.id, data);
    } else {
      await createSkill(data);
    }
    setEditingSkill(null);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingSkill(null);
    }
  };

  const handleAddSkill = () => {
    if (skillUsage.isAtLimit) {
      setUpgradeModalOpen(true);
    } else {
      setFormOpen(true);
    }
  };

  if (workspaceLoading || loading) {
    return <ListSkeleton count={4} showHeader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold mb-2">Skills</h1>
          <p className="text-muted-foreground">
            Highlight your expertise. Drag to reorder.
          </p>
          <UsageCounter 
            current={skillUsage.current} 
            max={skillUsage.max} 
            label="Skills" 
            className="mt-2"
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button onClick={handleAddSkill}>
                  {skillUsage.isAtLimit ? (
                    <Lock className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Skill
                </Button>
              </span>
            </TooltipTrigger>
            {skillUsage.isAtLimit && (
              <TooltipContent>
                <p>Upgrade to Pro to add more skills</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {skillUsage.isAtLimit && (
        <UpgradeBanner message="You've reached the skill limit on the Free plan. Upgrade to Pro for unlimited skills." trigger="skills" />
      )}

      {skills.length === 0 ? (
        <EmptyState
          icon={Zap}
          headline="No skills yet"
          description="Add your technical and professional skills to help visitors understand your expertise."
          actionLabel="Add Your First Skill"
          onAction={handleAddSkill}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={skills.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {skills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onEdit={handleEdit}
                  onDelete={() => handleDelete(skill)}
                  onTogglePublished={togglePublished}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <SkillFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        skill={editingSkill}
        categories={categories}
        onSubmit={handleFormSubmit}
      />

      <DeleteSkillDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        skillName={deletingSkill?.name}
      />

      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} trigger="skills" />
    </div>
  );
}
