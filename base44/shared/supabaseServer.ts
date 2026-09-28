import { createClient } from 'npm:@supabase/supabase-js@2.45.0';
import { secrets } from 'base44:runtime';

// Shared Supabase server client using service_role key.
// Used by backend functions only — never import this from frontend code.
export function getSupabaseServer() {
  const url = secrets.get('SUPABASE_URL');
  const key = secrets.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Supabase secrets not configured');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}