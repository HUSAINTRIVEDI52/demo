import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, FileText, Eye, BarChart3 } from 'lucide-react';
import { SectionLoader } from '@/components/brand/LogoSpinner';

export default function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, workspaces: 0, portfolios: 0, published: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [users, workspaces, portfolios, published, views] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('workspaces').select('id', { count: 'exact', head: true }),
      supabase.from('portfolios').select('id', { count: 'exact', head: true }),
      supabase.from('portfolios').select('id', { count: 'exact', head: true }).eq('published', true),
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('event_type', 'portfolio_view'),
    ]);
    setStats({
      users: users.count || 0,
      workspaces: workspaces.count || 0,
      portfolios: portfolios.count || 0,
      published: published.count || 0,
      totalViews: views.count || 0,
    });
    setLoading(false);
  };

  if (loading) {
    return <SectionLoader />;
  }

  const cards = [
    { title: 'Total Users', value: stats.users, icon: Users },
    { title: 'Workspaces', value: stats.workspaces, icon: Building2 },
    { title: 'Portfolios', value: stats.portfolios, icon: FileText },
    { title: 'Published', value: stats.published, icon: Eye },
    { title: 'Total Views', value: stats.totalViews, icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Platform Overview</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <card.icon className="h-5 w-5 text-accent" />
                <span className="text-3xl font-bold">{card.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
