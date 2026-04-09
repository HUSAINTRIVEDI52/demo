import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Upload, Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Project, ProjectUpdate } from '@/hooks/useProjects';
import { PROJECT_TYPES, PROJECT_CATEGORIES, PROJECT_STATUSES, PROJECT_ROLES } from '@/hooks/useProjects';

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSubmit: (data: Omit<Project, 'id' | 'portfolio_id' | 'created_at' | 'updated_at' | 'display_order'>) => Promise<void>;
}

interface FormState {
  title: string;
  short_description: string;
  full_description: string;
  project_type: string;
  image_url: string;
  gallery_images: string[];
  demo_video_url: string;
  project_url: string;
  github_url: string;
  case_study_url: string;
  technologies: string[];
  tools_used: string[];
  category: string;
  role: string;
  team_size: string;
  start_date: string;
  end_date: string;
  status: string;
  problem_statement: string;
  solution_summary: string;
  key_achievements: string[];
  metrics: string;
  published: boolean;
  featured: boolean;
}

const defaultForm: FormState = {
  title: '',
  short_description: '',
  full_description: '',
  project_type: 'Web App',
  image_url: '',
  gallery_images: [],
  demo_video_url: '',
  project_url: '',
  github_url: '',
  case_study_url: '',
  technologies: [],
  tools_used: [],
  category: 'Full-Stack',
  role: '',
  team_size: '',
  start_date: '',
  end_date: '',
  status: 'Completed',
  problem_statement: '',
  solution_summary: '',
  key_achievements: [],
  metrics: '',
  published: true,
  featured: false,
};

export function ProjectFormDialog({ open, onOpenChange, project, onSubmit }: ProjectFormDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');
  
  const [form, setForm] = useState<FormState>(defaultForm);

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title,
        short_description: project.short_description || '',
        full_description: project.full_description || '',
        project_type: project.project_type || 'Web App',
        image_url: project.image_url || '',
        gallery_images: project.gallery_images || [],
        demo_video_url: project.demo_video_url || '',
        project_url: project.project_url || '',
        github_url: project.github_url || '',
        case_study_url: project.case_study_url || '',
        technologies: project.technologies || [],
        tools_used: project.tools_used || [],
        category: project.category || 'Full-Stack',
        role: project.role || '',
        team_size: project.team_size || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        status: project.status || 'Completed',
        problem_statement: project.problem_statement || '',
        solution_summary: project.solution_summary || '',
        key_achievements: project.key_achievements || [],
        metrics: project.metrics || '',
        published: project.published ?? true,
        featured: project.featured || false,
      });
    } else {
      setForm(defaultForm);
    }
    setTechInput('');
    setToolInput('');
    setAchievementInput('');
  }, [project, open]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(fileName, file);

    if (uploadError) {
      toast.error('Failed to upload image');
      console.error(uploadError);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('project-images')
      .getPublicUrl(fileName);

    if (isGallery) {
      setForm(prev => ({ ...prev, gallery_images: [...prev.gallery_images, publicUrl] }));
    } else {
      setForm(prev => ({ ...prev, image_url: publicUrl }));
    }
    setUploading(false);
    toast.success('Image uploaded');
  };

  const removeGalleryImage = (url: string) => {
    setForm(prev => ({ 
      ...prev, 
      gallery_images: prev.gallery_images.filter(img => img !== url) 
    }));
  };

  const addTag = (type: 'technologies' | 'tools_used', value: string, setter: (v: string) => void) => {
    // Split by comma and add each tag separately
    const tags = value.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const newTags = tags.filter(tag => !form[type].includes(tag));
    
    if (newTags.length > 0) {
      setForm(prev => ({ ...prev, [type]: [...prev[type], ...newTags] }));
    }
    setter('');
  };

  const removeTag = (type: 'technologies' | 'tools_used', tag: string) => {
    setForm(prev => ({ 
      ...prev, 
      [type]: prev[type].filter(t => t !== tag) 
    }));
  };

  const addAchievement = () => {
    const achievement = achievementInput.trim();
    if (achievement && !form.key_achievements.includes(achievement)) {
      setForm(prev => ({ ...prev, key_achievements: [...prev.key_achievements, achievement] }));
      setAchievementInput('');
    }
  };

  const removeAchievement = (achievement: string) => {
    setForm(prev => ({ 
      ...prev, 
      key_achievements: prev.key_achievements.filter(a => a !== achievement) 
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Please enter a project title');
      return;
    }

    setLoading(true);
    await onSubmit({
      title: form.title,
      description: form.short_description || null,
      short_description: form.short_description || null,
      full_description: form.full_description || null,
      project_type: form.project_type || null,
      image_url: form.image_url || null,
      gallery_images: form.gallery_images.length > 0 ? form.gallery_images : null,
      demo_video_url: form.demo_video_url || null,
      project_url: form.project_url || null,
      github_url: form.github_url || null,
      case_study_url: form.case_study_url || null,
      technologies: form.technologies.length > 0 ? form.technologies : null,
      tools_used: form.tools_used.length > 0 ? form.tools_used : null,
      category: form.category || null,
      role: form.role || null,
      team_size: form.team_size || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      status: form.status || null,
      problem_statement: form.problem_statement || null,
      solution_summary: form.solution_summary || null,
      key_achievements: form.key_achievements.length > 0 ? form.key_achievements : null,
      metrics: form.metrics || null,
      published: form.published,
      featured: form.featured,
    });
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Add Project'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-4">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="tech">Tech</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="impact">Impact</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="My Awesome Project"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Input
                  id="short_description"
                  value={form.short_description}
                  onChange={(e) => setForm(prev => ({ ...prev, short_description: e.target.value }))}
                  placeholder="A brief one-liner about your project"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_description">Full Description</Label>
                <Textarea
                  id="full_description"
                  value={form.full_description}
                  onChange={(e) => setForm(prev => ({ ...prev, full_description: e.target.value }))}
                  placeholder="Detailed description of your project..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Type</Label>
                  <Select value={form.project_type} onValueChange={(v) => setForm(prev => ({ ...prev, project_type: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm(prev => ({ ...prev, status: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="published"
                      checked={form.published}
                      onCheckedChange={(checked) => setForm(prev => ({ ...prev, published: checked }))}
                    />
                    <Label htmlFor="published">Published</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="featured"
                      checked={form.featured}
                      onCheckedChange={(checked) => setForm(prev => ({ ...prev, featured: checked }))}
                    />
                    <Label htmlFor="featured">Featured</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-4">
              <div className="space-y-2">
                <Label>Cover Image</Label>
                {form.image_url ? (
                  <div className="relative">
                    <img 
                      src={form.image_url} 
                      alt="Project preview" 
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setForm(prev => ({ ...prev, image_url: '' }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploading ? (
                        <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload cover image</p>
                        </>
                      )}
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>

              <div className="space-y-2">
                <Label>Gallery Images</Label>
                <div className="grid grid-cols-3 gap-2">
                  {form.gallery_images.map((img, idx) => (
                    <div key={idx} className="relative aspect-video">
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeGalleryImage(img)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <label className="aspect-video flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    {uploading ? (
                      <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                    ) : (
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="demo_video_url">Demo Video URL</Label>
                <Input
                  id="demo_video_url"
                  value={form.demo_video_url}
                  onChange={(e) => setForm(prev => ({ ...prev, demo_video_url: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=... or https://loom.com/..."
                />
              </div>
            </TabsContent>

            {/* Tech & Stack Tab */}
            <TabsContent value="tech" className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tech Stack</Label>
                <div className="flex gap-2">
                  <Input
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, () => addTag('technologies', techInput, setTechInput))}
                    placeholder="React, Node.js, PostgreSQL..."
                  />
                  <Button type="button" variant="outline" onClick={() => addTag('technologies', techInput, setTechInput)}>
                    Add
                  </Button>
                </div>
                {form.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="gap-1">
                        {tech}
                        <button type="button" onClick={() => removeTag('technologies', tech)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tools Used</Label>
                <div className="flex gap-2">
                  <Input
                    value={toolInput}
                    onChange={(e) => setToolInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, () => addTag('tools_used', toolInput, setToolInput))}
                    placeholder="VS Code, Figma, Jira..."
                  />
                  <Button type="button" variant="outline" onClick={() => addTag('tools_used', toolInput, setToolInput)}>
                    Add
                  </Button>
                </div>
                {form.tools_used.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.tools_used.map((tool) => (
                      <Badge key={tool} variant="outline" className="gap-1">
                        {tool}
                        <button type="button" onClick={() => removeTag('tools_used', tool)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project_url">Live Demo URL</Label>
                  <Input
                    id="project_url"
                    value={form.project_url}
                    onChange={(e) => setForm(prev => ({ ...prev, project_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github_url">Repository URL</Label>
                  <Input
                    id="github_url"
                    value={form.github_url}
                    onChange={(e) => setForm(prev => ({ ...prev, github_url: e.target.value }))}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="case_study_url">Case Study URL</Label>
                <Input
                  id="case_study_url"
                  value={form.case_study_url}
                  onChange={(e) => setForm(prev => ({ ...prev, case_study_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(v) => setForm(prev => ({ ...prev, role: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_ROLES.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team_size">Team Size</Label>
                  <Input
                    id="team_size"
                    value={form.team_size}
                    onChange={(e) => setForm(prev => ({ ...prev, team_size: e.target.value }))}
                    placeholder="e.g., 5 or Solo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Impact Tab */}
            <TabsContent value="impact" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="problem_statement">Problem Statement</Label>
                <Textarea
                  id="problem_statement"
                  value={form.problem_statement}
                  onChange={(e) => setForm(prev => ({ ...prev, problem_statement: e.target.value }))}
                  placeholder="What problem does this project solve?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="solution_summary">Solution Summary</Label>
                <Textarea
                  id="solution_summary"
                  value={form.solution_summary}
                  onChange={(e) => setForm(prev => ({ ...prev, solution_summary: e.target.value }))}
                  placeholder="How did you solve the problem?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Key Achievements</Label>
                <div className="flex gap-2">
                  <Input
                    value={achievementInput}
                    onChange={(e) => setAchievementInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, addAchievement)}
                    placeholder="Reduced load time by 50%..."
                  />
                  <Button type="button" variant="outline" onClick={addAchievement}>
                    Add
                  </Button>
                </div>
                {form.key_achievements.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {form.key_achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                        <span>• {achievement}</span>
                        <button type="button" onClick={() => removeAchievement(achievement)} className="text-destructive hover:text-destructive/80">
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="metrics">Metrics / Results</Label>
                <Textarea
                  id="metrics"
                  value={form.metrics}
                  onChange={(e) => setForm(prev => ({ ...prev, metrics: e.target.value }))}
                  placeholder="10,000+ users, 99.9% uptime, $50K revenue..."
                  rows={2}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {project ? 'Save Changes' : 'Add Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
