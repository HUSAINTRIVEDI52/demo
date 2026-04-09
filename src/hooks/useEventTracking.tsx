import { useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/hooks/useWorkspace';

type EventType = 
  | 'user_login'
  | 'portfolio_publish'
  | 'portfolio_view'
  | 'project_view'
  | 'theme_change'
  | 'project_create'
  | 'project_update'
  | 'project_delete'
  | 'experience_create'
  | 'experience_update'
  | 'experience_delete'
  | 'certification_create'
  | 'certification_update'
  | 'certification_delete'
  | 'skill_create'
  | 'skill_update'
  | 'skill_delete'
  | 'custom_section_create'
  | 'custom_section_update'
  | 'custom_section_delete'
  | 'section_toggle'
  | 'profile_update'
  | 'avatar_upload'
  | 'contact_submit';

// Deduplication window in milliseconds
const DEDUP_WINDOW_MS = 2000;

// Session-based deduplication for anonymous tracking (portfolio views)
const sessionViewsTracked = new Set<string>();

// Allowed source values - unknown sources become 'other'
const ALLOWED_SOURCES = ['linkedin', 'whatsapp', 'email', 'twitter', 'facebook', 'github', 'direct'] as const;
type TrafficSource = typeof ALLOWED_SOURCES[number] | 'other' | null;

// Sanitize and validate source parameter
function sanitizeSource(source: string | null | undefined): TrafficSource {
  if (!source) return null;
  
  // Basic sanitization - lowercase, trim, remove any non-alphanumeric chars
  const cleaned = source.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
  
  // Check against allowed list
  if (ALLOWED_SOURCES.includes(cleaned as any)) {
    return cleaned as TrafficSource;
  }
  
  // Unknown sources become 'other'
  return cleaned.length > 0 ? 'other' : null;
}

// Track portfolio view for public pages (no auth required) - non-blocking
export function trackPortfolioView(portfolioId: string, workspaceId: string, source?: string | null) {
  // Deduplicate per session - only count once per portfolio per page session
  const viewKey = `view:${portfolioId}`;
  if (sessionViewsTracked.has(viewKey)) {
    return;
  }
  sessionViewsTracked.add(viewKey);

  // Sanitize source to prevent injection
  const sanitizedSource = sanitizeSource(source);

  // Fire and forget - don't await, don't block rendering
  Promise.resolve(
    supabase.from('events').insert({
      user_id: null, // Anonymous view
      workspace_id: workspaceId,
      event_type: 'portfolio_view',
      metadata: { 
        portfolio_id: portfolioId,
        ...(sanitizedSource && { source: sanitizedSource }),
      },
    })
  ).catch((error) => {
    // Silently fail - don't affect UX
    console.error('Portfolio view tracking error:', error);
  });
}

// Track project view for public pages (no auth required) - non-blocking
export function trackProjectView(projectId: string, workspaceId: string) {
  // Deduplicate per session - only count once per project per page session
  const viewKey = `project:${projectId}`;
  if (sessionViewsTracked.has(viewKey)) {
    return;
  }
  sessionViewsTracked.add(viewKey);

  // Fire and forget - don't await, don't block rendering
  Promise.resolve(
    supabase.from('events').insert({
      user_id: null, // Anonymous view
      workspace_id: workspaceId,
      event_type: 'project_view',
      metadata: { project_id: projectId },
    })
  ).catch((error) => {
    // Silently fail - don't affect UX
    console.error('Project view tracking error:', error);
  });
}

export function useEventTracking() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  
  // Track recent events to prevent duplicates
  const recentEventsRef = useRef<Map<string, number>>(new Map());

  const trackEvent = async (eventType: EventType, metadata: Record<string, any> = {}) => {
    // Require both user and workspace for proper scoping
    if (!user || !workspace?.id) return;

    // Create a unique key for deduplication
    const dedupKey = `${eventType}:${JSON.stringify(metadata)}`;
    const now = Date.now();
    const lastTracked = recentEventsRef.current.get(dedupKey);

    // Skip if this exact event was tracked recently
    if (lastTracked && now - lastTracked < DEDUP_WINDOW_MS) {
      return;
    }

    // Mark this event as tracked
    recentEventsRef.current.set(dedupKey, now);

    // Clean up old entries periodically
    if (recentEventsRef.current.size > 50) {
      const cutoff = now - DEDUP_WINDOW_MS;
      for (const [key, timestamp] of recentEventsRef.current.entries()) {
        if (timestamp < cutoff) {
          recentEventsRef.current.delete(key);
        }
      }
    }

    try {
      await supabase.from('events').insert({
        user_id: user.id,
        workspace_id: workspace.id,
        event_type: eventType,
        metadata,
      });
    } catch (error) {
      // Silently fail - don't affect UX
      console.error('Event tracking error:', error);
    }
  };

  return { trackEvent };
}
