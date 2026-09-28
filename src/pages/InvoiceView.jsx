import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSupabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Printer } from "lucide-react";
import InvoicePreview from "@/components/invoice/InvoicePreview";

export default function InvoiceView() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = await getSupabase();
      const { data, error } = await supabase.from('invoices').select('*').eq('id', id).single();
      setInvoice(error ? null : data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Invoice not found.</p>
        <Link to="/invoices" className="inline-block mt-3">
          <Button variant="outline">Back to invoices</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Link to="/invoices">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Link to={`/invoices/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="w-4 h-4 mr-1" /> Edit
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => {
              const iframe = document.getElementById("invoice-preview-frame");
              if (iframe) {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
              }
            }}>
              <Printer className="w-4 h-4 mr-1" /> Print
            </Button>
          </div>
        </div>
        <InvoicePreview invoice={invoice} showPrintButton={false} />
      </div>
    </div>
  );
}