import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getSupabaseServer } from '../../shared/supabaseServer.ts';

// One-time migration: copies all invoices from Base44 entities to Supabase.
// Admin only. Safe to re-run (uses upsert on id).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    // Read all invoices from Base44 (service role bypasses RLS)
    const base44Invoices = await base44.asServiceRole.entities.Invoice.list('-created_date', 500);

    if (!base44Invoices.length) {
      return Response.json({ migrated: 0, message: 'No invoices in Base44 to migrate' });
    }

    const supabase = getSupabaseServer();

    // Upsert into Supabase (preserves IDs so existing QR codes / links still work)
    const { data, error } = await supabase
      .from('invoices')
      .upsert(base44Invoices, { onConflict: 'id' })
      .select('id');

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({
      migrated: data.length,
      total: base44Invoices.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}