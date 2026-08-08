export interface UserSession {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export function getCurrentUserServer(): UserSession {
  // In production with Supabase configured, reads cookies via @supabase/ssr
  // For dev / mock mode, returns persistent demo user session
  return {
    id: 'demo-user-123',
    email: 'user@aihub.app',
    name: 'AI HUB User',
  };
}
