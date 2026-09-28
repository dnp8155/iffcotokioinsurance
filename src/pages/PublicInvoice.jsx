import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getSupabase } from "@/lib/supabaseClient";
import { generateInvoiceHTML } from "@/components/invoice/invoiceTemplate";
import { generateQrSvg } from "@/lib/qr";

// Public invoice view — accessible without login. Reached by scanning the QR
// code printed on the invoice. Shows only the A4 document, nothing extra.
export default function PublicInvoice() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const supabase = await getSupabase();
        const { data: invoice, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("id", id)
          .single();
        if (error || !invoice) {
          setError("Invoice not found");
        } else {
          setInvoice(invoice);
        }
      } catch (e) {
        setError(e?.message || "Failed to load invoice");
      }
      setLoading(false);
    })();
  }, [id]);

  const [qrSvg, setQrSvg] = useState(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    const publicUrl = `https://iffcotokioinsurance.vercel.app/public/invoice/${id}`;
    generateQrSvg(publicUrl).then((svg) => {
      if (active) setQrSvg(svg);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const html = useMemo(() => {
    if (!invoice) return "";
    return generateInvoiceHTML(invoice, { qrSvg });
  }, [invoice, qrSvg]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-9 h-9 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex justify-center py-6">
      <iframe
        id="public-invoice-frame"
        title="Insurance Policy Document"
        srcDoc={html}
        className="bg-white shadow-lg"
        style={{ width: "793px", maxWidth: "100%", height: "calc(100vh - 48px)", border: "none" }}
      />
    </div>
  );
}