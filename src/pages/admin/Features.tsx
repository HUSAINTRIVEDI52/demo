import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Settings, 
  FileText, 
  BarChart3, 
  Mail, 
  LayoutGrid, 
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { usePlatformFeatures, PlatformFeature } from '@/hooks/usePlatformSettings';
import { useAdminLogger, actionDescriptions } from '@/hooks/useAdminLogger';
import { ConfirmDestructiveAction } from '@/components/admin/ConfirmDestructiveAction';
import { toast } from 'sonner';

const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  resume_export: FileText,
  analytics: BarChart3,
  contact_inbox: Mail,
  custom_sections: LayoutGrid,
  preview_mode: Eye,
};

export default function AdminFeatures() {
  const { features, isLoading, updateFeature, isUpdating } = usePlatformFeatures();
  const { logAction } = useAdminLogger();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    feature: PlatformFeature | null;
  }>({ open: false, feature: null });

  const handleToggleFeature = async (feature: PlatformFeature) => {
    if (feature.enabled) {
      setConfirmDialog({ open: true, feature });
    } else {
      try {
        await updateFeature({ featureKey: feature.feature_key, enabled: true });
        logAction({
          actionType: 'feature_enable',
          targetType: 'feature',
          targetId: feature.id,
          description: actionDescriptions.feature_enable(feature.name),
          metadata: { feature_key: feature.feature_key },
        });
        toast.success(`"${feature.name}" feature enabled`);
      } catch (error) {
        toast.error('Failed to enable feature');
      }
    }
  };

  const handleConfirmDisable = async () => {
    if (!confirmDialog.feature) return;
    
    try {
      await updateFeature({ 
        featureKey: confirmDialog.feature.feature_key, 
        enabled: false 
      });
      logAction({
        actionType: 'feature_disable',
        targetType: 'feature',
        targetId: confirmDialog.feature.id,
        description: actionDescriptions.feature_disable(confirmDialog.feature.name),
        metadata: { feature_key: confirmDialog.feature.feature_key },
      });
      toast.success(`"${confirmDialog.feature.name}" feature disabled globally`);
    } catch (error) {
      toast.error('Failed to disable feature');
    } finally {
      setConfirmDialog({ open: false, feature: null });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  const enabledCount = features.filter(f => f.enabled).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-amber-900 mb-2">Feature Flags</h1>
        <p className="text-muted-foreground">
          Enable or disable platform features globally. Disabled features are hidden from users.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">{features.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{enabledCount}</span>
              <span className="text-sm text-muted-foreground">of {features.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Disabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">{features.length - enabledCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature List */}
      <Card>
        <CardHeader>
          <CardTitle>All Features</CardTitle>
          <CardDescription>
            Disabled features are completely hidden from user interfaces and blocked server-side.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {features.map((feature) => {
              const IconComponent = featureIcons[feature.feature_key] || Settings;
              
              return (
                <div
                  key={feature.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    feature.enabled ? 'bg-background' : 'bg-muted/50 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      feature.enabled ? 'bg-amber-100' : 'bg-muted'
                    }`}>
                      <IconComponent className={`h-5 w-5 ${feature.enabled ? 'text-amber-600' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{feature.name}</span>
                        {feature.enabled ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Disabled
                          </Badge>
                        )}
                      </div>
                      {feature.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <Switch
                    checked={feature.enabled}
                    onCheckedChange={() => handleToggleFeature(feature)}
                    disabled={isUpdating}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-amber-50/50 border-amber-200">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <Settings className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">How Feature Flags Work</h4>
              <p className="text-sm text-amber-700 mt-1">
                When a feature is disabled, it is immediately hidden from all user dashboards and 
                blocked at the server level. Changes take effect instantly across the platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDestructiveAction
        open={confirmDialog.open}
        onOpenChange={(open) => !open && setConfirmDialog({ open: false, feature: null })}
        onConfirm={handleConfirmDisable}
        title={`Disable "${confirmDialog.feature?.name}"?`}
        description="This feature will be hidden from all users immediately. Any user interface elements related to this feature will be removed."
        confirmText="DISABLE"
        actionLabel="Disable Feature"
        isLoading={isUpdating}
        variant="warning"
      />
    </div>
  );
}
