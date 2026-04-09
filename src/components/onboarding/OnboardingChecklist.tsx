import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, Circle, ArrowRight, Sparkles } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  link: string;
  linkLabel: string;
}

interface OnboardingChecklistProps {
  items: ChecklistItem[];
  onComplete: () => void;
}

export function OnboardingChecklist({ items, onComplete }: OnboardingChecklistProps) {
  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const allCompleted = completedCount === totalCount;

  // Find the first incomplete item for highlighting
  const nextStep = items.find((item) => !item.completed);

  if (allCompleted) {
    return (
      <Card className="border-accent/50 bg-accent/5">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Portfolio Complete!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You've completed all the steps. Your portfolio is ready to shine.
              </p>
              <Button onClick={onComplete}>
                Dismiss Checklist
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Get Started</CardTitle>
          <span className="text-sm font-medium text-muted-foreground">
            {progressPercent}% complete
          </span>
        </div>
        <Progress value={progressPercent} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => {
          const isNext = nextStep?.id === item.id;
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                item.completed
                  ? 'bg-accent/10'
                  : isNext
                  ? 'bg-muted border border-accent/30'
                  : 'bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.completed ? (
                  <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center">
                    <Check className="h-4 w-4 text-accent-foreground" />
                  </div>
                ) : (
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                    isNext ? 'border-accent' : 'border-muted-foreground/30'
                  }`}>
                    <Circle className={`h-3 w-3 ${isNext ? 'text-accent' : 'text-transparent'}`} />
                  </div>
                )}
                <span className={`text-sm font-medium ${item.completed ? 'text-muted-foreground line-through' : ''}`}>
                  {item.label}
                </span>
              </div>
              {!item.completed && (
                <Button variant={isNext ? 'default' : 'ghost'} size="sm" asChild>
                  <Link to={item.link}>
                    {item.linkLabel}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
