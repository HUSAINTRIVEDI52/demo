import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, AlertCircle, PartyPopper, User, Palette, 
  FolderPlus, CheckCircle, ArrowRight, ArrowLeft, Upload, MapPin,
  Check, Sparkles, Eye, Crown
} from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { themes } from '@/config/themes';
import { cn } from '@/lib/utils';
import { ThemePreviewCard } from '@/components/onboarding/ThemePreviewCard';
import { PortfolioPreviewModal } from '@/components/onboarding/PortfolioPreviewModal';
import { useAvailableThemes } from '@/hooks/usePlatformSettings';

const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100);

type Step = 'profile' | 'theme' | 'project' | 'complete';

const steps: { id: Step; title: string; icon: React.ReactNode }[] = [
  { id: 'profile', title: 'Profile', icon: <User className="h-4 w-4" /> },
  { id: 'theme', title: 'Theme', icon: <Palette className="h-4 w-4" /> },
  { id: 'project', title: 'Project', icon: <FolderPlus className="h-4 w-4" /> },
  { id: 'complete', title: 'Done', icon: <CheckCircle className="h-4 w-4" /> },
];

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { availableThemes, getThemeAccessLevel, isLoading: themesLoading } = useAvailableThemes();
  
  
  const [currentStep, setCurrentStep] = useState<Step>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Profile fields
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Theme selection
  const [selectedTheme, setSelectedTheme] = useState('minimal');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Filter themes to only show free themes from platform settings
  const freeThemes = useMemo(() => {
    // Get theme configs that are enabled and free
    return themes.filter((theme) => {
      const accessLevel = getThemeAccessLevel(theme.id);
      // Include theme if it's enabled (accessLevel is not null) and free
      return accessLevel === 'free';
    });
  }, [availableThemes, getThemeAccessLevel]);
  
  
  // Project fields
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl + '?t=' + Date.now());
      toast.success('Photo uploaded!');
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error('Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSubmit = async () => {
    setError(null);
    setFieldErrors({});

    const result = nameSchema.safeParse(fullName);
    if (!result.success) {
      setFieldErrors({ fullName: result.error.errors[0].message });
      return false;
    }

    if (!user) {
      setError('You must be logged in');
      return false;
    }

    setLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update portfolio with location and bio
      const { data: workspace } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .single();

      if (workspace) {
        await supabase
          .from('portfolios')
          .update({ 
            title: fullName,
            bio: bio || null,
            location: location || null,
            avatar_url: avatarUrl,
          })
          .eq('workspace_id', workspace.workspace_id);
      }

      // Update user metadata
      await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      return true;
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to save profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSubmit = async () => {
    if (!user) return false;

    setLoading(true);
    try {
      const { data: workspace } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .single();

      if (workspace) {
        await supabase
          .from('portfolios')
          .update({ theme: selectedTheme })
          .eq('workspace_id', workspace.workspace_id);
      }

      return true;
    } catch (err) {
      console.error('Theme update error:', err);
      setError('Failed to save theme');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSubmit = async () => {
    if (!user) return false;
    
    // Skip if no project entered
    if (!projectTitle.trim()) return true;

    setLoading(true);
    try {
      const { data: workspace } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .single();

      if (workspace) {
        const { data: portfolio } = await supabase
          .from('portfolios')
          .select('id')
          .eq('workspace_id', workspace.workspace_id)
          .single();

        if (portfolio) {
          await supabase
            .from('projects')
            .insert({
              portfolio_id: portfolio.id,
              title: projectTitle,
              description: projectDescription || null,
            });
        }
      }

      return true;
    } catch (err) {
      console.error('Project creation error:', err);
      setError('Failed to create project');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    let success = true;
    
    if (currentStep === 'profile') {
      success = await handleProfileSubmit();
      if (success) setCurrentStep('theme');
    } else if (currentStep === 'theme') {
      success = await handleThemeSubmit();
      if (success) setCurrentStep('project');
    } else if (currentStep === 'project') {
      success = await handleProjectSubmit();
      if (success) setCurrentStep('complete');
    }
  };

  const handleBack = () => {
    if (currentStep === 'theme') setCurrentStep('profile');
    else if (currentStep === 'project') setCurrentStep('theme');
    else if (currentStep === 'complete') setCurrentStep('project');
  };

  const handleFinish = async () => {
    // Mark onboarding as complete
    if (user) {
      const { data: workspace } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .single();

      if (workspace) {
        await supabase
          .from('workspaces')
          .update({ onboarding_completed: true })
          .eq('id', workspace.workspace_id);
      }
    }

    toast.success('Welcome aboard! Your portfolio is ready.');
    navigate('/app/dashboard', { replace: true });
  };

  const handleSkip = () => {
    navigate('/app/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                  currentStepIndex > index 
                    ? "bg-accent border-accent text-accent-foreground"
                    : currentStepIndex === index
                    ? "border-accent text-accent"
                    : "border-muted text-muted-foreground"
                )}>
                  {currentStepIndex > index ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-full h-0.5 mx-2 hidden sm:block",
                    currentStepIndex > index ? "bg-accent" : "bg-muted"
                  )} style={{ width: '60px' }} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <span key={step.id} className={cn(
                "text-xs font-medium",
                currentStepIndex >= index ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.title}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 rounded-xl">
          {/* Step 1: Profile */}
          {currentStep === 'profile' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <PartyPopper className="h-12 w-12 mx-auto text-accent mb-4" />
                <h1 className="text-2xl font-display font-bold">Welcome to ShinePort!</h1>
                <p className="text-muted-foreground mt-2">Let's set up your profile</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative w-24 h-24 rounded-full border-2 border-dashed cursor-pointer transition-all hover:border-accent",
                    avatarUrl ? "border-accent" : "border-muted-foreground/30"
                  )}
                >
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground">
                      {uploadingAvatar ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-6 w-6" />
                          <span className="text-xs mt-1">Photo</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">Click to upload (max 5MB)</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    className={fieldErrors.fullName ? 'border-destructive' : ''}
                  />
                  {fieldErrors.fullName && (
                    <p className="text-sm text-destructive">{fieldErrors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={loading}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Theme Selection */}
          {currentStep === 'theme' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Palette className="h-12 w-12 mx-auto text-accent mb-4" />
                <h1 className="text-2xl font-display font-bold">Choose Your Theme</h1>
                <p className="text-muted-foreground mt-2">
                  Select from our free themes to get started
                </p>
              </div>

              {/* Preview Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setPreviewModalOpen(true)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview Full Portfolio
                </Button>
              </div>

              {themesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : freeThemes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No free themes available. Using default theme.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {freeThemes.map((theme) => (
                    <ThemePreviewCard
                      key={theme.id}
                      theme={theme}
                      isSelected={selectedTheme === theme.id}
                      onSelect={() => setSelectedTheme(theme.id)}
                    />
                  ))}
                </div>
              )}

              {/* Pro themes hint */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4">
                <Crown className="h-4 w-4 text-accent" />
                <span>More premium themes available after upgrade</span>
              </div>

              {/* Preview Modal */}
              {user && (
                <PortfolioPreviewModal
                  open={previewModalOpen}
                  onOpenChange={setPreviewModalOpen}
                  userId={user.id}
                  selectedTheme={selectedTheme}
                  profileData={{
                    fullName,
                    bio,
                    location,
                    avatarUrl,
                  }}
                />
              )}
            </div>
          )}

          {/* Step 3: First Project */}
          {currentStep === 'project' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <FolderPlus className="h-12 w-12 mx-auto text-accent mb-4" />
                <h1 className="text-2xl font-display font-bold">Add Your First Project</h1>
                <p className="text-muted-foreground mt-2">Showcase your best work (optional)</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectTitle">Project Title</Label>
                  <Input
                    id="projectTitle"
                    placeholder="My Awesome Project"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectDescription">Description</Label>
                  <Textarea
                    id="projectDescription"
                    placeholder="What did you build? What technologies did you use?"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    disabled={loading}
                    rows={4}
                  />
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  You can add more details and projects later from your dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 'complete' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-accent" />
              </div>
              <h1 className="text-2xl font-display font-bold mb-2">You're All Set!</h1>
              <p className="text-muted-foreground mb-8">
                Your portfolio is ready. Start customizing and sharing it with the world!
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={handleFinish}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep !== 'complete' && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={currentStepIndex > 0 ? handleBack : handleSkip}
                disabled={loading}
              >
                {currentStepIndex > 0 ? (
                  <>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </>
                ) : (
                  'Skip for now'
                )}
              </Button>

              <Button
                onClick={handleNext}
                disabled={loading || (currentStep === 'profile' && !fullName.trim())}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {currentStep === 'project' ? 'Finish' : 'Continue'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          You can always update your profile and settings later.
        </p>
      </div>
    </div>
  );
}
