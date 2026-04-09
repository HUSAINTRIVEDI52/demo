import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Experience, ExperienceUpdate } from '@/hooks/useExperiences';
import { EMPLOYMENT_TYPES } from '@/hooks/useExperiences';

interface ExperienceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experience?: Experience | null;
  onSubmit: (data: Omit<Experience, 'id' | 'portfolio_id' | 'created_at' | 'updated_at' | 'display_order'>) => Promise<void>;
}

interface FormState {
  company: string;
  position: string;
  employment_type: string;
  location: string;
  role_summary: string;
  responsibilities: string[];
  achievements: string[];
  technologies_used: string[];
  start_date: Date | undefined;
  end_date: Date | undefined;
  is_current: boolean;
  published: boolean;
}

const defaultForm: FormState = {
  company: '',
  position: '',
  employment_type: 'Full-time',
  location: '',
  role_summary: '',
  responsibilities: [],
  achievements: [],
  technologies_used: [],
  start_date: undefined,
  end_date: undefined,
  is_current: false,
  published: true,
};

export function ExperienceFormDialog({ open, onOpenChange, experience, onSubmit }: ExperienceFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [responsibilityInput, setResponsibilityInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');
  const [techInput, setTechInput] = useState('');
  
  const [form, setForm] = useState<FormState>(defaultForm);

  useEffect(() => {
    if (experience) {
      setForm({
        company: experience.company,
        position: experience.position,
        employment_type: experience.employment_type || 'Full-time',
        location: experience.location || '',
        role_summary: experience.role_summary || '',
        responsibilities: experience.responsibilities || [],
        achievements: experience.achievements || [],
        technologies_used: experience.technologies_used || [],
        start_date: experience.start_date ? new Date(experience.start_date) : undefined,
        end_date: experience.end_date ? new Date(experience.end_date) : undefined,
        is_current: experience.is_current || false,
        published: experience.published ?? true,
      });
    } else {
      setForm(defaultForm);
    }
    setResponsibilityInput('');
    setAchievementInput('');
    setTechInput('');
  }, [experience, open]);

  const addItem = (type: 'responsibilities' | 'achievements' | 'technologies_used', value: string, setter: (v: string) => void) => {
    const item = value.trim();
    if (item && !form[type].includes(item)) {
      setForm(prev => ({ ...prev, [type]: [...prev[type], item] }));
      setter('');
    }
  };

  const removeItem = (type: 'responsibilities' | 'achievements' | 'technologies_used', item: string) => {
    setForm(prev => ({ 
      ...prev, 
      [type]: prev[type].filter(i => i !== item) 
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
    if (!form.company.trim() || !form.position.trim()) {
      toast.error('Please enter both company name and position');
      return;
    }
    if (!form.start_date) {
      toast.error('Please select a start date');
      return;
    }

    setLoading(true);
    await onSubmit({
      company: form.company,
      position: form.position,
      employment_type: form.employment_type || null,
      location: form.location || null,
      description: form.role_summary || null,
      role_summary: form.role_summary || null,
      responsibilities: form.responsibilities.length > 0 ? form.responsibilities : null,
      achievements: form.achievements.length > 0 ? form.achievements : null,
      technologies_used: form.technologies_used.length > 0 ? form.technologies_used : null,
      start_date: format(form.start_date, 'yyyy-MM-dd'),
      end_date: form.is_current ? null : (form.end_date ? format(form.end_date, 'yyyy-MM-dd') : null),
      is_current: form.is_current,
      published: form.published,
    });
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{experience ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="tech">Tech & Skills</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position / Role *</Label>
                  <Input
                    id="position"
                    value={form.position}
                    onChange={(e) => setForm(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={form.company}
                    onChange={(e) => setForm(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Acme Inc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Employment Type</Label>
                  <Select value={form.employment_type} onValueChange={(v) => setForm(prev => ({ ...prev, employment_type: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="San Francisco, CA or Remote"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_current">I currently work here</Label>
                <Switch
                  id="is_current"
                  checked={form.is_current}
                  onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_current: checked }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.start_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.start_date ? format(form.start_date, "MMM yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.start_date}
                        onSelect={(date) => setForm(prev => ({ ...prev, start_date: date }))}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date {form.is_current ? '(N/A)' : ''}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={form.is_current}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.end_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.is_current 
                          ? "Present" 
                          : form.end_date 
                            ? format(form.end_date, "MMM yyyy") 
                            : "Pick a date"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.end_date}
                        onSelect={(date) => setForm(prev => ({ ...prev, end_date: date }))}
                        disabled={(date) => 
                          date > new Date() || 
                          (form.start_date ? date < form.start_date : false)
                        }
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="published"
                    checked={form.published}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, published: checked }))}
                  />
                  <Label htmlFor="published">Published</Label>
                </div>
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role_summary">Role Summary</Label>
                <Textarea
                  id="role_summary"
                  value={form.role_summary}
                  onChange={(e) => setForm(prev => ({ ...prev, role_summary: e.target.value }))}
                  placeholder="Brief overview of your role and contributions..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Responsibilities</Label>
                <div className="flex gap-2">
                  <Input
                    value={responsibilityInput}
                    onChange={(e) => setResponsibilityInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, () => addItem('responsibilities', responsibilityInput, setResponsibilityInput))}
                    placeholder="Led development of..."
                  />
                  <Button type="button" variant="outline" onClick={() => addItem('responsibilities', responsibilityInput, setResponsibilityInput)}>
                    Add
                  </Button>
                </div>
                {form.responsibilities.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {form.responsibilities.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                        <span>• {item}</span>
                        <button type="button" onClick={() => removeItem('responsibilities', item)} className="text-destructive hover:text-destructive/80">
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <Label>Achievements</Label>
                <div className="flex gap-2">
                  <Input
                    value={achievementInput}
                    onChange={(e) => setAchievementInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, () => addItem('achievements', achievementInput, setAchievementInput))}
                    placeholder="Increased performance by 40%..."
                  />
                  <Button type="button" variant="outline" onClick={() => addItem('achievements', achievementInput, setAchievementInput)}>
                    Add
                  </Button>
                </div>
                {form.achievements.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {form.achievements.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                        <span>• {item}</span>
                        <button type="button" onClick={() => removeItem('achievements', item)} className="text-destructive hover:text-destructive/80">
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </TabsContent>

            {/* Tech Tab */}
            <TabsContent value="tech" className="space-y-4">
              <div className="space-y-2">
                <Label>Technologies Used</Label>
                <div className="flex gap-2">
                  <Input
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, () => addItem('technologies_used', techInput, setTechInput))}
                    placeholder="React, TypeScript, AWS..."
                  />
                  <Button type="button" variant="outline" onClick={() => addItem('technologies_used', techInput, setTechInput)}>
                    Add
                  </Button>
                </div>
                {form.technologies_used.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.technologies_used.map((tech) => (
                      <Badge key={tech} variant="secondary" className="gap-1">
                        {tech}
                        <button type="button" onClick={() => removeItem('technologies_used', tech)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? 'Saving...' : (experience ? 'Save Changes' : 'Add Experience')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
