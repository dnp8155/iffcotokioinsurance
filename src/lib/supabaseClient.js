import { createClient } from '@supabase/supabase-js';
import { base44 } from '@/api/base44Client';

let client = null;
let initPromise = null;

// Lazy-initialised Supabase browser client.
// Fetches URL + anon key from the supabaseConfig backend function,
// then creates a singleton client with session persistence.
export async function getSupabase() {
  if (client) return client;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const res = await base44.functions.invoke('supabaseConfig', {});
      const { url, anonKey } = res.data;
      if (!url || !anonKey) throw new Error('Supabase config not available');
      client = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return client;
    } catch (err) {
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}