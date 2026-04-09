import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Palette, Crown, Users } from 'lucide-react';
import { usePlatformThemes, PlatformTheme } from '@/hooks/usePlatformSettings';
import { useAdminLogger, actionDescriptions } from '@/hooks/useAdminLogger';
import { ConfirmDestructiveAction } from '@/components/admin/ConfirmDestructiveAction';
import { toast } from 'sonner';

export default function AdminThemes() {
  const { themes, isLoading, updateTheme, isUpdating } = usePlatformThemes();
  const { logAction } = useAdminLogger();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    theme: PlatformTheme | null;
  }>({ open: false, theme: null });

  const handleToggleEnabled = async (theme: PlatformTheme) => {
    if (theme.enabled) {
      // Show confirmation before disabling
      setConfirmDialog({ open: true, theme });
    } else {
      // Enable directly
      try {
        await updateTheme({ themeId: theme.theme_id, updates: { enabled: true } });
        logAction({
          actionType: 'theme_enable',
          targetType: 'theme',
          targetId: theme.id,
          description: actionDescriptions.theme_enable(theme.name),
          metadata: { theme_id: theme.theme_id },
        });
        toast.success(`"${theme.name}" theme enabled`);
      } catch (error) {
        toast.error('Failed to enable theme');
      }
    }
  };

  const handleConfirmDisable = async () => {
    if (!confirmDialog.theme) return;
    
    try {
      await updateTheme({ 
        themeId: confirmDialog.theme.theme_id, 
        updates: { enabled: false } 
      });
      logAction({
        actionType: 'theme_disable',
        targetType: 'theme',
        targetId: confirmDialog.theme.id,
        description: actionDescriptions.theme_disable(confirmDialog.theme.name),
        metadata: { theme_id: confirmDialog.theme.theme_id },
      });
      toast.success(`"${confirmDialog.theme.name}" theme disabled. Users using this theme will fall back to default.`);
    } catch (error) {
      toast.error('Failed to disable theme');
    } finally {
      setConfirmDialog({ open: false, theme: null });
    }
  };

  const handleAccessLevelChange = async (theme: PlatformTheme, accessLevel: 'free' | 'pro') => {
    try {
      await updateTheme({ themeId: theme.theme_id, updates: { access_level: accessLevel } });
      logAction({
        actionType: 'theme_access_change',
        targetType: 'theme',
        targetId: theme.id,
        description: actionDescriptions.theme_access_change(theme.name, accessLevel),
        metadata: { theme_id: theme.theme_id, old_level: theme.access_level, new_level: accessLevel },
      });
      toast.success(`"${theme.name}" is now ${accessLevel === 'pro' ? 'Pro-only' : 'available to all users'}`);
    } catch (error) {
      toast.error('Failed to update access level');
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
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  const enabledCount = themes.filter(t => t.enabled).length;
  const freeCount = themes.filter(t => t.access_level === 'free').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-amber-900 mb-2">Theme Management</h1>
        <p className="text-muted-foreground">
          Control which themes are available to users and their access levels.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">{themes.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-2xl font-bold">{enabledCount}</span>
              <span className="text-sm text-muted-foreground">of {themes.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Free Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{freeCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Theme List */}
      <Card>
        <CardHeader>
          <CardTitle>All Themes</CardTitle>
          <CardDescription>
            Disabled themes won't appear in user dashboards. Users with disabled themes will fall back to "Minimal".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  theme.enabled ? 'bg-background' : 'bg-muted/50 opacity-75'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    theme.enabled ? 'bg-amber-100' : 'bg-muted'
                  }`}>
                    <Palette className={`h-5 w-5 ${theme.enabled ? 'text-amber-600' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{theme.name}</span>
                      {theme.access_level === 'pro' && (
                        <Badge variant="secondary" className="gap-1">
                          <Crown className="h-3 w-3" /> Pro
                        </Badge>
                      )}
                      {!theme.enabled && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Disabled
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ID: {theme.theme_id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Select
                    value={theme.access_level}
                    onValueChange={(value: 'free' | 'pro') => handleAccessLevelChange(theme, value)}
                    disabled={isUpdating || !theme.enabled}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Free
                        </div>
                      </SelectItem>
                      <SelectItem value="pro">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Pro
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Switch
                    checked={theme.enabled}
                    onCheckedChange={() => handleToggleEnabled(theme)}
                    disabled={isUpdating}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDestructiveAction
        open={confirmDialog.open}
        onOpenChange={(open) => !open && setConfirmDialog({ open: false, theme: null })}
        onConfirm={handleConfirmDisable}
        title={`Disable "${confirmDialog.theme?.name}" Theme?`}
        description="This theme will be hidden from all users. Users currently using this theme will be switched to the default 'Minimal' theme."
        confirmText="DISABLE"
        actionLabel="Disable Theme"
        isLoading={isUpdating}
        variant="warning"
      />
    </div>
  );
}
