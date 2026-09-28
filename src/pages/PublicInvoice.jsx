import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { generateInvoiceHTML } from "@/components/invoice/invoiceTemplate";
import { generateQrSvg } from "@/lib/qr";

// Public invoice view — accessible without login. Reached by scanning the QR
// code printed on the invoice. Renders the invoice and lets the viewer print
// or save it as a PDF.
export default function PublicInvoice() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke("getPublicInvoice", { id });
        if (res?.data?.invoice) {
          setInvoice(res.data.invoice);
        } else {
          setError("Invoice not found");
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
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#5c5c5c]">
      <div className="max-w-[700px] mx-auto px-4 py-6">
        <div className="flex justify-end mb-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            Print / Save PDF
          </button>
        </div>
        <iframe
          id="public-invoice-frame"
          title="Invoice"
          srcDoc={html}
          className="w-full bg-[#5c5c5c] rounded-md"
          style={{ height: "85vh", border: "none" }}
        />
      </div>
    </div>
  );
}