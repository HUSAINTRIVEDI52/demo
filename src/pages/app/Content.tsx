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
import { useWorkspace } from '@/hooks/useWorkspace';
import { useCustomSections, CustomSection } from '@/hooks/useCustomSections';
import { useSectionOrder, CoreSectionType, SectionItem } from '@/hooks/useSectionOrder';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Layers } from 'lucide-react';
import { SortableSectionCard } from '@/components/sections/SortableSectionCard';
import { CustomSectionCard } from '@/components/custom-sections/CustomSectionCard';
import { CustomSectionFormDialog } from '@/components/custom-sections/CustomSectionFormDialog';
import { DeleteCustomSectionDialog } from '@/components/custom-sections/DeleteCustomSectionDialog';

export default function Content() {
  const { loading: workspaceLoading } = useWorkspace();
  const { 
    customSections, 
    loading: customSectionsLoading, 
    createCustomSection, 
    updateCustomSection, 
    deleteCustomSection,
    toggleVisibility: toggleCustomVisibility,
    reorderCustomSections 
  } = useCustomSections();
  
  const {
    orderedSections,
    loading: orderLoading,
    saving,
    updateSectionOrder,
    toggleSectionVisibility,
  } = useSectionOrder();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<CustomSection | null>(null);
  const [deletingSection, setDeletingSection] = useState<CustomSection | null>(null);

  const sectionSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const customSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = orderedSections.findIndex((s) => s.id === active.id);
      const newIndex = orderedSections.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(orderedSections, oldIndex, newIndex);
      updateSectionOrder(reordered);
    }
  };

  const handleCustomDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = customSections.findIndex((s) => s.id === active.id);
      const newIndex = customSections.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(customSections, oldIndex, newIndex);
      reorderCustomSections(reordered);
    }
  };

  const handleEdit = (section: CustomSection) => {
    setEditingSection(section);
    setFormOpen(true);
  };

  const handleDelete = (section: CustomSection) => {
    setDeletingSection(section);
  };

  const confirmDelete = async () => {
    if (deletingSection) {
      await deleteCustomSection(deletingSection.id);
      setDeletingSection(null);
    }
  };

  const handleFormSubmit = async (data: Omit<CustomSection, 'id' | 'portfolio_id' | 'created_at' | 'updated_at' | 'display_order'>) => {
    if (editingSection) {
      await updateCustomSection(editingSection.id, data);
    } else {
      await createCustomSection(data);
    }
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditingSection(null);
  };

  const handleToggleSectionVisibility = (sectionType: CoreSectionType, visible: boolean) => {
    toggleSectionVisibility(sectionType, visible);
  };

  const loading = workspaceLoading || customSectionsLoading || orderLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold mb-2">Content Manager</h1>
        <p className="text-muted-foreground">
          Organize your portfolio sections and customize their order and visibility.
        </p>
      </div>

      <Tabs defaultValue="order" className="w-full">
        <TabsList>
          <TabsTrigger value="order" className="gap-2">
            <Layers className="h-4 w-4" />
            Section Order
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-2">
            <FileText className="h-4 w-4" />
            Custom Sections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="order" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Drag sections to reorder how they appear on your public portfolio.
              {saving && <span className="ml-2 text-accent">Saving...</span>}
            </p>
          </div>

          <DndContext
            sensors={sectionSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSectionDragEnd}
          >
            <SortableContext
              items={orderedSections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {orderedSections.map((section) => (
                  <SortableSectionCard
                    key={section.id}
                    section={section}
                    onToggleVisibility={handleToggleSectionVisibility}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Create and manage custom content sections for your portfolio.
            </p>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </div>

          {customSections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No custom sections yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Create custom sections to add unique content to your portfolio like awards, publications, or interests.
              </p>
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Section
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={customSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleCustomDragEnd}
            >
              <SortableContext
                items={customSections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {customSections.map((section) => (
                    <CustomSectionCard
                      key={section.id}
                      section={section}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleVisibility={toggleCustomVisibility}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>
      </Tabs>

      <CustomSectionFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleFormSubmit}
        editingSection={editingSection}
      />

      <DeleteCustomSectionDialog
        open={!!deletingSection}
        onOpenChange={(open) => !open && setDeletingSection(null)}
        section={deletingSection}
        onConfirm={confirmDelete}
      />
    </div>
  );
}