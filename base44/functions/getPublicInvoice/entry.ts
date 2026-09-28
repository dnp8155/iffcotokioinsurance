import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    let body = {};
    try {
      body = await req.json();
    } catch {
      // no JSON body
    }
    const id = body.id;
    if (!id) return Response.json({ error: 'Missing invoice id' }, { status: 400 });
    const invoice = await base44.asServiceRole.entities.Invoice.get(id);
    if (!invoice) return Response.json({ error: 'Invoice not found' }, { status: 404 });
    return Response.json({ invoice });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}