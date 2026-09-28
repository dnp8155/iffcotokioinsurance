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

    // Only include fields that exist in the Supabase table (drop Base44-internal fields like is_sample)
    const fields = [
      'id','created_date','updated_date','created_by_id',
      'tax_invoice_no','p400_policy','issuance_date','period_from','period_to',
      'insured_name','address','place_of_supply','pin_code','ckyc','gstn',
      'sum_insured','premium_taxable_value','gross_premium','hypothecation',
      'purpose_of_animal','policy_excess','number_of_cattle',
      'intermediary_no','intermediary_name','intermediary_phone',
      'cgst_percentage','sgst_percentage','cgst_amount','sgst_amount',
      'co_insurance_percentage','animals','pay_method','receipt_amount',
      'instrument_no','instrument_date','bank',
      'signature_name','signature_date','signature_reason','signature_location'
    ];
    const rows = base44Invoices.map(inv => {
      const out = {};
      for (const f of fields) { if (inv[f] !== undefined) out[f] = inv[f]; }
      return out;
    });

    // Upsert into Supabase (preserves IDs so existing QR codes / links still work)
    const { data, error } = await supabase
      .from('invoices')
      .upsert(rows, { onConflict: 'id' })
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