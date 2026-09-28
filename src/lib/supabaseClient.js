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
      // Local dev: read from Vite env vars if provided (no backend function needed).
      let url = import.meta.env.VITE_SUPABASE_URL;
      let anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!url || !anonKey) {
        const res = await base44.functions.invoke('supabaseConfig', {});
        url = res.data.url;
        anonKey = res.data.anonKey;
      }
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