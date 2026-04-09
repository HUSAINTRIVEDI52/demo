import { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useEventTracking } from '@/hooks/useEventTracking';
import { usePortfolioVersions } from '@/hooks/usePortfolioVersions';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Save, Camera, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ImageCropperDialog } from '@/components/portfolio/ImageCropperDialog';

export default function Portfolio() {
  const { portfolio, loading, updatePortfolio } = useWorkspace();
  const { user } = useAuth();
  const { trackEvent } = useEventTracking();
  const { createSnapshot } = usePortfolioVersions();
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Cropping state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    title: '',
    tagline: '',
    bio: '',
    location: '',
    contact_email: '',
    contact_phone: '',
    website_url: '',
    linkedin_url: '',
    github_url: '',
    twitter_url: '',
    instagram_url: '',
    youtube_url: '',
    dribbble_url: '',
    behance_url: '',
    medium_url: '',
    custom_social_label: '',
    custom_social_url: '',
  });

  useEffect(() => {
    if (portfolio) {
      setForm({
        title: portfolio.title || '',
        tagline: portfolio.tagline || '',
        bio: portfolio.bio || '',
        location: portfolio.location || '',
        contact_email: portfolio.contact_email || '',
        contact_phone: portfolio.contact_phone || '',
        website_url: portfolio.website_url || '',
        linkedin_url: portfolio.linkedin_url || '',
        github_url: portfolio.github_url || '',
        twitter_url: portfolio.twitter_url || '',
        instagram_url: portfolio.instagram_url || '',
        youtube_url: portfolio.youtube_url || '',
        dribbble_url: portfolio.dribbble_url || '',
        behance_url: portfolio.behance_url || '',
        medium_url: portfolio.medium_url || '',
        custom_social_label: portfolio.custom_social_label || '',
        custom_social_url: portfolio.custom_social_url || '',
      });
      setAvatarUrl(portfolio.avatar_url || null);
    }
  }, [portfolio]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Create a URL for the image and open the cropper
    const imageUrl = URL.createObjectURL(file);
    setImageToCrop(imageUrl);
    setCropperOpen(true);
    
    // Reset the file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCroppedImage = async (croppedBlob: Blob) => {
    if (!user) return;

    setUploadingAvatar(true);
    try {
      const fileName = `${user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedBlob, { upsert: true, contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const newAvatarUrl = publicUrl + '?t=' + Date.now();
      setAvatarUrl(newAvatarUrl);
      
      // Save to database immediately
      await updatePortfolio({ avatar_url: newAvatarUrl });
      toast.success('Profile picture uploaded!');
      trackEvent('avatar_upload', {});
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploadingAvatar(false);
      // Clean up the object URL
      if (imageToCrop) {
        URL.revokeObjectURL(imageToCrop);
        setImageToCrop(null);
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    
    try {
      // Remove from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.webp`, `${user.id}/avatar.jpeg`]);
      
      if (deleteError) console.warn('Could not delete avatar file:', deleteError);
      
      // Update database
      await updatePortfolio({ avatar_url: null });
      setAvatarUrl(null);
      toast.success('Profile picture removed');
    } catch (err) {
      console.error('Avatar removal error:', err);
      toast.error('Failed to remove profile picture');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updatePortfolio(form);
    if (error) {
      toast.error('Could not save portfolio. Please try again.');
    } else {
      await createSnapshot('content_save');
      toast.success('Portfolio saved successfully');
      trackEvent('profile_update', { fields: Object.keys(form) });
    }
    setSaving(false);
  };

  const userInitials = form.title?.charAt(0)?.toUpperCase() || 'U';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold mb-2">Portfolio</h1>
        <p className="text-muted-foreground">Edit your profile and hero section.</p>
      </div>

      {/* Profile Picture Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-border">
                <AvatarImage src={avatarUrl || undefined} alt={form.title} />
                <AvatarFallback className="text-2xl font-semibold bg-accent/10 text-accent">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              
              {/* Upload overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className={cn(
                  "absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity",
                  "flex items-center justify-center cursor-pointer",
                  uploadingAvatar && "opacity-100"
                )}
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Image Cropper Dialog */}
            {imageToCrop && (
              <ImageCropperDialog
                open={cropperOpen}
                onOpenChange={(open) => {
                  setCropperOpen(open);
                  if (!open && imageToCrop) {
                    URL.revokeObjectURL(imageToCrop);
                    setImageToCrop(null);
                  }
                }}
                imageSrc={imageToCrop}
                onCropComplete={handleCroppedImage}
              />
            )}
            
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
                {avatarUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended: Square image, at least 400x400px. Max 5MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Name / Title</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" placeholder="Full Stack Developer" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={4} placeholder="Tell your story..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="San Francisco, CA" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact_email">Email Address</Label>
            <Input id="contact_email" type="email" placeholder="hello@yoursite.com" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_phone">Phone Number</Label>
            <Input id="contact_phone" type="tel" placeholder="+1 (555) 123-4567" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" placeholder="https://yoursite.com" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input id="linkedin" type="url" placeholder="https://linkedin.com/in/..." value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input id="github" type="url" placeholder="https://github.com/..." value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter / X</Label>
              <Input id="twitter" type="url" placeholder="https://twitter.com/..." value={form.twitter_url} onChange={(e) => setForm({ ...form, twitter_url: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" type="url" placeholder="https://instagram.com/..." value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input id="youtube" type="url" placeholder="https://youtube.com/@..." value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dribbble">Dribbble</Label>
              <Input id="dribbble" type="url" placeholder="https://dribbble.com/..." value={form.dribbble_url} onChange={(e) => setForm({ ...form, dribbble_url: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="behance">Behance</Label>
              <Input id="behance" type="url" placeholder="https://behance.net/..." value={form.behance_url} onChange={(e) => setForm({ ...form, behance_url: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medium">Medium</Label>
              <Input id="medium" type="url" placeholder="https://medium.com/@..." value={form.medium_url} onChange={(e) => setForm({ ...form, medium_url: e.target.value })} />
            </div>
          </div>
          
          {/* Custom Social Link */}
          <div className="pt-4 border-t border-border">
            <Label className="text-sm font-medium mb-3 block">Custom Social Link</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="custom_social_label" className="text-xs text-muted-foreground">Label</Label>
                <Input id="custom_social_label" placeholder="Discord, Slack, etc." value={form.custom_social_label} onChange={(e) => setForm({ ...form, custom_social_label: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom_social_url" className="text-xs text-muted-foreground">URL</Label>
                <Input id="custom_social_url" type="url" placeholder="https://..." value={form.custom_social_url} onChange={(e) => setForm({ ...form, custom_social_url: e.target.value })} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent/90 text-accent-foreground">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
