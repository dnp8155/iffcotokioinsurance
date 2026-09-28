import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getSupabase } from "@/lib/supabaseClient";
import { generateInvoiceHTML } from "@/components/invoice/invoiceTemplate";
import { generateQrSvg } from "@/lib/qr";
import { Printer, FileText, ShieldCheck } from "lucide-react";

// Public invoice view — accessible without login. Reached by scanning the QR
// code printed on the invoice. Renders the invoice as a proper document and
// lets the viewer print or save it as a PDF.
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

  const handlePrint = () => {
    const iframe = document.getElementById("public-invoice-frame");
    if (!iframe) return;
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading document…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <FileText className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-lg font-semibold text-slate-800 mb-1">Document Unavailable</h1>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col">
      {/* Toolbar */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-[820px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {invoice?.p400_policy || "Insurance Policy"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {invoice?.insured_name || "Pashu Dhan Bima Policy"}
              </p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print / Save PDF</span>
            <span className="sm:hidden">Print</span>
          </button>
        </div>
      </header>

      {/* Document */}
      <main className="flex-1 flex justify-center px-4 py-6">
        <iframe
          id="public-invoice-frame"
          title="Insurance Policy Document"
          srcDoc={html}
          className="w-full max-w-[820px] bg-[#5c5c5c] rounded-lg shadow-xl"
          style={{ height: "calc(100vh - 140px)", border: "none" }}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-[820px] mx-auto px-4 py-2.5 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified document · IFFCO-TOKIO General Insurance Co. Ltd.</span>
        </div>
      </footer>
    </div>
  );
}