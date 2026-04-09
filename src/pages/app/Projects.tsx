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
import { Plus, FolderKanban, Lock } from 'lucide-react';
import { useProjects, type Project } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';
import { useWorkspace } from '@/hooks/useWorkspace';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { UsageCounter } from '@/components/plan/UsageCounter';
import { UpgradeBanner } from '@/components/plan/UpgradeBanner';
import { UpgradeModal } from '@/components/plan/UpgradeModal';
import { ListSkeleton } from '@/components/ui/premium-skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function Projects() {
  const { loading: workspaceLoading } = useWorkspace();
  const { projects, loading, createProject, updateProject, deleteProject, reorderProjects, togglePublished, toggleFeatured } = useProjects();
  const { canAddProject, getProjectUsage, refetchUsage } = usePlanLimits();
  
  const projectUsage = getProjectUsage();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
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
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);
      const reordered = arrayMove(projects, oldIndex, newIndex);
      reorderProjects(reordered);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const handleDelete = (project: Project) => {
    setDeletingProject(project);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingProject) {
      await deleteProject(deletingProject.id);
      setDeleteDialogOpen(false);
      setDeletingProject(null);
    }
  };

  const handleFormSubmit = async (data: Omit<Project, 'id' | 'portfolio_id' | 'created_at' | 'updated_at' | 'display_order'>) => {
    if (editingProject) {
      await updateProject(editingProject.id, data);
    } else {
      await createProject(data);
    }
    setEditingProject(null);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingProject(null);
    }
  };

  const handleAddProject = () => {
    if (projectUsage.isAtLimit) {
      setUpgradeModalOpen(true);
    } else {
      setFormOpen(true);
    }
  };

  if (workspaceLoading || loading) {
    return <ListSkeleton count={3} showHeader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">
            Showcase your best work. Drag to reorder.
          </p>
          <UsageCounter 
            current={projectUsage.current} 
            max={projectUsage.max} 
            label="Projects" 
            className="mt-2"
          />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button onClick={handleAddProject}>
                  {projectUsage.isAtLimit ? (
                    <Lock className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Project
                </Button>
              </span>
            </TooltipTrigger>
            {projectUsage.isAtLimit && (
              <TooltipContent>
                <p>Upgrade to Pro to add more projects</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {projectUsage.isAtLimit && (
        <UpgradeBanner message="You've reached the project limit on the Free plan. Upgrade to Pro for unlimited projects." trigger="projects" />
      )}

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          headline="No projects yet"
          description="Showcase your best work by adding projects. Include case studies, demos, and key achievements."
          actionLabel="Add Your First Project"
          onAction={handleAddProject}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEdit}
                  onDelete={() => handleDelete(project)}
                  onTogglePublished={togglePublished}
                  onToggleFeatured={toggleFeatured}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        project={editingProject}
        onSubmit={handleFormSubmit}
      />

      <DeleteProjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        projectTitle={deletingProject?.title}
      />

      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} trigger="projects" />
    </div>
  );
}
