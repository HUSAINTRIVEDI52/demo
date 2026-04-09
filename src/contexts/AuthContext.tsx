import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false after initial check, not on subsequent auth changes
        if (event === 'INITIAL_SESSION') {
          setLoading(false);
        }

        // Defer super admin check
        if (session?.user) {
          setTimeout(() => {
            if (mounted) checkSuperAdmin(session.user.id);
          }, 0);
        } else {
          setIsSuperAdmin(false);
        }
      }
    );

    // THEN check for existing session with timeout fallback
    const sessionTimeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 3000); // 3 second max wait

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      clearTimeout(sessionTimeout);
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        checkSuperAdmin(session.user.id);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(sessionTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const checkSuperAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('super_admins')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!error && data) {
        setIsSuperAdmin(true);
      } else {
        setIsSuperAdmin(false);
      }
    } catch {
      setIsSuperAdmin(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    if (!error) {
      // Track signup event is handled by database trigger
    }

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user) {
      // Get IP address and user agent for tracking
      let ipAddress: string | null = null;
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json', {
          signal: AbortSignal.timeout(2000),
        });
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip || null;
      } catch {
        // Non-blocking - IP capture is best effort
      }

      const userAgent = navigator.userAgent;
      const deviceOs = parseDeviceOS(userAgent);

      // Update profile with login tracking info
      await supabase
        .from('profiles')
        .update({
          last_login_at: new Date().toISOString(),
          last_ip_address: ipAddress,
          last_device_os: deviceOs,
          last_user_agent: userAgent,
        } as Record<string, unknown>)
        .eq('id', data.user.id);

      // Track login event
      const { data: workspaces } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', data.user.id)
        .limit(1);

      if (workspaces && workspaces.length > 0) {
        await supabase.from('events').insert({
          user_id: data.user.id,
          workspace_id: workspaces[0].workspace_id,
          event_type: 'user_login',
          metadata: { ip_address: ipAddress, device_os: deviceOs },
        });
      }
    }

    return { error: error as Error | null };
  };

  // Parse OS from user agent
  const parseDeviceOS = (userAgent: string): string => {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Unknown';
  };

  const signOut = async () => {
    // Clear local state first
    setIsSuperAdmin(false);
    setUser(null);
    setSession(null);
    
    // Then sign out from Supabase (clears tokens from storage)
    await supabase.auth.signOut({ scope: 'local' });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signUp, 
      signIn, 
      signOut,
      isSuperAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
