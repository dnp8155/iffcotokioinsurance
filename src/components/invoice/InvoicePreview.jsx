import React, { useEffect, useMemo, useRef, useState } from "react";
import { generateInvoiceHTML } from "./invoiceTemplate";
import { generateQrSvg } from "@/lib/qr";

// A4 page in pixels (1pt = 1/72in, 96px/in => 1pt = 4/3px)
const PT_TO_PX = 96 / 72;
const PAGE_WIDTH_PX = 595 * PT_TO_PX;   // ~793px
const PAGE_HEIGHT_PX = 842 * PT_TO_PX;  // ~1123px
// Two pages + small gaps between them
const FALLBACK_DOC_HEIGHT_PX = PAGE_HEIGHT_PX * 2 + 60;

// Renders the invoice using the exact IFFCO-TOKIO template inside an iframe,
// scaled down to fit the available width (so it looks right on mobile too).
export default function InvoicePreview({ invoice, showPrintButton = true }) {
  const [qrSvg, setQrSvg] = useState(null);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [docHeight, setDocHeight] = useState(FALLBACK_DOC_HEIGHT_PX);

  useEffect(() => {
    const publicUrl = invoice?.id
      ? `https://iffcotokioinsurance.vercel.app/public/invoice/${invoice.id}`
      : `https://iffcotokioinsurance.vercel.app/public/invoice`;
    let active = true;
    generateQrSvg(publicUrl).then((svg) => {
      if (active) setQrSvg(svg);
    });
    return () => {
      active = false;
    };
  }, [invoice?.id]);

  // Fit-to-width scaling: measure the container and scale the fixed-width page down.
  useEffect(() => {
    const updateScale = () => {
      const w = containerRef.current?.clientWidth ?? 0;
      if (w > 0) setScale(Math.min(1, w / PAGE_WIDTH_PX));
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // After the iframe loads, read its real content height so the wrapper sizes correctly.
  const handleLoad = () => {
    try {
      const doc = iframeRef.current?.contentDocument;
      const h = doc?.body?.scrollHeight;
      if (h && h > 0) setDocHeight(h);
    } catch {
      // ignore — fallback height stays
    }
  };

  const html = useMemo(
    () => generateInvoiceHTML(invoice, { qrSvg }),
    [invoice, qrSvg]
  );

  const handlePrint = () => {
    const iframe = iframeRef.current || document.getElementById("invoice-preview-frame");
    if (!iframe) return;
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  };

  return (
    <div className="w-full">
      {showPrintButton && (
        <div className="flex justify-end mb-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            Print / Save PDF
          </button>
        </div>
      )}
      <div ref={containerRef} className="w-full overflow-hidden">
        <div
          style={{
            width: PAGE_WIDTH_PX,
            height: docHeight,
            transformOrigin: "top left",
            transform: `scale(${scale})`,
          }}
        >
          <iframe
            ref={iframeRef}
            id="invoice-preview-frame"
            title="Invoice Preview"
            srcDoc={html}
            onLoad={handleLoad}
            className="bg-white"
            style={{ width: PAGE_WIDTH_PX, height: docHeight, border: "none" }}
          />
        </div>
      </div>
    </div>
  );
}