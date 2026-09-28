import { secrets } from 'base44:runtime';

// Returns Supabase public config (URL + anon key) to the frontend.
// The anon key is safe to expose — it only works with RLS policies.
export default async function() {
  return Response.json({
    url: secrets.get('SUPABASE_URL'),
    anonKey: secrets.get('SUPABASE_ANON_KEY'),
  });
}