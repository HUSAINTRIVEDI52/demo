import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Skill } from '@/hooks/useSkills';

interface SkillFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill?: Skill | null;
  categories: string[];
  onSubmit: (data: Omit<Skill, 'id' | 'portfolio_id' | 'created_at' | 'updated_at' | 'display_order'>) => Promise<void>;
}

const COMMON_CATEGORIES = [
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'Mobile',
  'Design',
  'Tools',
  'Languages',
  'Frameworks',
  'Cloud',
];

export function SkillFormDialog({ open, onOpenChange, skill, categories, onSubmit }: SkillFormDialogProps) {
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    category: '',
    proficiency: 80,
    published: true,
  });

  const allCategories = [...new Set([...COMMON_CATEGORIES, ...categories])].sort();

  useEffect(() => {
    if (skill) {
      setForm({
        name: skill.name,
        category: skill.category || '',
        proficiency: skill.proficiency ?? 80,
        published: skill.published ?? true,
      });
    } else {
      setForm({
        name: '',
        category: '',
        proficiency: 80,
        published: true,
      });
    }
  }, [skill, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Please enter a skill name');
      return;
    }

    setLoading(true);
    await onSubmit({
      name: form.name,
      category: form.category || null,
      proficiency: form.proficiency,
      published: form.published,
    });
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{skill ? 'Edit Skill' : 'Add Skill'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Skill Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="React, Python, Figma..."
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={form.category}
              onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Frontend, Backend, Design..."
              list="category-suggestions"
            />
            <datalist id="category-suggestions">
              {allCategories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
            <p className="text-xs text-muted-foreground">
              Type or select a category to group related skills
            </p>
          </div>

          {/* Proficiency */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Proficiency Level</Label>
              <span className="text-sm font-medium">{form.proficiency}%</span>
            </div>
            <Slider
              value={[form.proficiency]}
              onValueChange={(value) => setForm(prev => ({ ...prev, proficiency: value[0] }))}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Beginner</span>
              <span>Intermediate</span>
              <span>Expert</span>
            </div>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Visibility</Label>
              <p className="text-xs text-muted-foreground">
                Show this skill on your public portfolio
              </p>
            </div>
            <Switch
              checked={form.published}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, published: checked }))}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? 'Saving...' : (skill ? 'Save Changes' : 'Add Skill')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
