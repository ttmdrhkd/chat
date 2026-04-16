import { supabase } from '@/integrations/supabase/client';

let cachedUserId: string | null = null;

/**
 * Ensures the user is signed in anonymously.
 * Returns the stable auth.uid() which is used as device_id everywhere.
 */
export async function ensureAnonymousAuth(): Promise<string> {
  if (cachedUserId) return cachedUserId;

  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user?.id) {
    cachedUserId = session.user.id;
    return cachedUserId;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error('Anonymous sign-in failed:', error);
    throw error;
  }

  cachedUserId = data.user!.id;
  return cachedUserId;
}

/**
 * Get cached user ID (synchronous). Returns null if not yet authenticated.
 */
export function getCachedUserId(): string | null {
  return cachedUserId;
}

// Listen for auth changes to keep cache in sync
supabase.auth.onAuthStateChange((_event, session) => {
  cachedUserId = session?.user?.id ?? null;
});
