import { useEffect, useState } from 'react';
import { usePortfolioVersions, PortfolioVersion } from '@/hooks/usePortfolioVersions';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ListSkeleton } from '@/components/ui/premium-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { History, RotateCcw, Loader2, Clock, FileText, Palette, Eye, Settings, Archive } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const actionIcons: Record<string, React.ReactNode> = {
  content_save: <FileText className="h-4 w-4" />,
  theme_change: <Palette className="h-4 w-4" />,
  publish_change: <Eye className="h-4 w-4" />,
  settings_save: <Settings className="h-4 w-4" />,
  restore: <RotateCcw className="h-4 w-4" />,
  manual_save: <Archive className="h-4 w-4" />,
};

export default function HistoryPage() {
  const { loading: workspaceLoading } = useWorkspace();
  const { versions, loading, restoring, fetchVersions, restoreVersion, getActionLabel } = usePortfolioVersions();
  const [selectedVersion, setSelectedVersion] = useState<PortfolioVersion | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleRestoreClick = (version: PortfolioVersion) => {
    setSelectedVersion(version);
    setConfirmDialogOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (selectedVersion) {
      await restoreVersion(selectedVersion);
      setConfirmDialogOpen(false);
      setSelectedVersion(null);
      fetchVersions();
    }
  };

  if (workspaceLoading || loading) {
    return <ListSkeleton count={3} />;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold mb-2 flex items-center gap-2">
          <History className="h-6 w-6" />
          Version History
        </h1>
        <p className="text-muted-foreground">
          View and restore previous versions of your portfolio. Up to 10 versions are stored.
        </p>
      </div>

      {versions.length === 0 ? (
        <EmptyState
          icon={Clock}
          headline="No versions yet"
          description="Versions are automatically saved when you update your portfolio, change themes, or toggle publish settings."
          actionLabel="Edit Your Portfolio"
          actionHref="/app/portfolio"
        />
      ) : (
        <div className="space-y-4">
          {versions.map((version, index) => {
            const isLatest = index === 0;
            const createdAt = new Date(version.created_at);
            const snapshot = version.snapshot_data;
            
            return (
              <Card key={version.id} className={isLatest ? 'border-accent' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-muted">
                        {actionIcons[version.action_type] || <Archive className="h-4 w-4" />}
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {getActionLabel(version.action_type)}
                          {isLatest && (
                            <Badge variant="secondary" className="text-xs">Latest</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {format(createdAt, 'MMM d, yyyy')} at {format(createdAt, 'h:mm a')}
                          <span className="text-muted-foreground/60 ml-2">
                            ({formatDistanceToNow(createdAt, { addSuffix: true })})
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    {!isLatest && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreClick(version)}
                        disabled={restoring}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="font-normal">
                      Theme: {snapshot.portfolio.theme}
                    </Badge>
                    <Badge variant="outline" className="font-normal">
                      {snapshot.portfolio.published ? 'Published' : 'Draft'}
                    </Badge>
                    <Badge variant="outline" className="font-normal">
                      {snapshot.skills.length} skills
                    </Badge>
                    <Badge variant="outline" className="font-normal">
                      {snapshot.projects.length} projects
                    </Badge>
                    <Badge variant="outline" className="font-normal">
                      {snapshot.experiences.length} experiences
                    </Badge>
                    {snapshot.customSections.length > 0 && (
                      <Badge variant="outline" className="font-normal">
                        {snapshot.customSections.length} custom sections
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this version?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current portfolio content with the selected version. 
              A backup of your current version will be created automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedVersion && (
            <div className="py-4">
              <div className="p-3 rounded-lg bg-muted text-sm">
                <p className="font-medium mb-1">
                  {getActionLabel(selectedVersion.action_type)}
                </p>
                <p className="text-muted-foreground">
                  {format(new Date(selectedVersion.created_at), 'MMMM d, yyyy')} at{' '}
                  {format(new Date(selectedVersion.created_at), 'h:mm a')}
                </p>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRestore}
              disabled={restoring}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {restoring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restore Version
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
