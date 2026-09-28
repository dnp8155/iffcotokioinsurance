import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getSupabaseServer } from '../../shared/supabaseServer.ts';

// CRUD API for invoices stored in Supabase.
// All operations require an authenticated Base44 user.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch {}
    const { operation, id, data } = body;
    const supabase = getSupabaseServer();

    if (operation === 'list') {
      const { data: rows, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_date', { ascending: false })
        .limit(200);
      if (error) return Response.json({ error: error.message }, { status: 500 });
      return Response.json({ invoices: rows });
    }

    if (operation === 'get') {
      if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
      const { data: row, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return Response.json({ error: 'Invoice not found' }, { status: 404 });
      return Response.json({ invoice: row });
    }

    if (operation === 'create') {
      const payload = { ...data, id: crypto.randomUUID(), created_by_id: user.id };
      const { data: row, error } = await supabase
        .from('invoices')
        .insert(payload)
        .select('*')
        .single();
      if (error) return Response.json({ error: error.message }, { status: 500 });
      return Response.json({ invoice: row });
    }

    if (operation === 'update') {
      if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
      const { data: row, error } = await supabase
        .from('invoices')
        .update(data)
        .eq('id', id)
        .select('*')
        .single();
      if (error) return Response.json({ error: error.message }, { status: 500 });
      return Response.json({ invoice: row });
    }

    if (operation === 'delete') {
      if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      if (error) return Response.json({ error: error.message }, { status: 500 });
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid operation' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}