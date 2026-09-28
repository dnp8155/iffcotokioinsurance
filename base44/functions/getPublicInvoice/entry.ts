import { getSupabaseServer } from '../../shared/supabaseServer.ts';

// Public invoice lookup — no auth required (for QR code scanning).
// Reads from Supabase using the service_role key.
export default async function(req) {
  try {
    let body = {};
    try { body = await req.json(); } catch {}
    const id = body.id;
    if (!id) return Response.json({ error: 'Missing invoice id' }, { status: 400 });

    const supabase = getSupabaseServer();
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !invoice) return Response.json({ error: 'Invoice not found' }, { status: 404 });
    return Response.json({ invoice });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}