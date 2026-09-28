import React, { useMemo } from "react";
import { generateInvoiceHTML } from "./invoiceTemplate";

// Renders the invoice using the exact IFFCO-TOKIO template inside an iframe,
// so it looks identical to the original PDF. Includes a Print button.
export default function InvoicePreview({ invoice }) {
  const html = useMemo(() => {
    const publicUrl = invoice?.id
      ? `${window.location.origin}/public/invoice/${invoice.id}`
      : null;
    const qrSrc = publicUrl
      ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=${encodeURIComponent(publicUrl)}`
      : null;
    return generateInvoiceHTML(invoice, { qrSrc });
  }, [invoice]);

  const handlePrint = () => {
    const iframe = document.getElementById("invoice-preview-frame");
    if (!iframe) return;
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  };

  return (
    <div className="w-full">
      <div className="flex justify-end mb-3">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          Print / Save PDF
        </button>
      </div>
      <iframe
        id="invoice-preview-frame"
        title="Invoice Preview"
        srcDoc={html}
        className="w-full bg-[#5c5c5c] rounded-md"
        style={{ height: "82vh", border: "none" }}
      />
    </div>
  );
}