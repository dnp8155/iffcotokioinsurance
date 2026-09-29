import React, { useEffect, useMemo, useState, useRef } from "react";
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

  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

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

  useEffect(() => {
    const updateScale = () => {
      // Use window.innerWidth (or container clientWidth) with padding to fit screen perfectly
      const screenW = window.innerWidth || document.documentElement.clientWidth || 793;
      const availableW = Math.min(screenW, containerRef.current?.clientWidth || screenW);
      // Fit 793.7px (210mm A4) into available screen width
      if (availableW > 0) {
        setScale(Math.min(1, availableW / 794));
      }
    };
    updateScale();
    // Re-check shortly after mount to ensure mobile browser dimensions are ready
    const t1 = setTimeout(updateScale, 100);
    const t2 = setTimeout(updateScale, 400);
    window.addEventListener("resize", updateScale);
    window.addEventListener("orientationchange", updateScale);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", updateScale);
      window.removeEventListener("orientationchange", updateScale);
    };
  }, []);

  const html = useMemo(() => {
    if (!invoice) return "";
    return generateInvoiceHTML(invoice, { qrSvg });
  }, [invoice, qrSvg]);

  const [docHeight, setDocHeight] = useState(2310);
  const iframeRef = useRef(null);

  const handleLoad = () => {
    const measure = () => {
      try {
        const doc = iframeRef.current?.contentDocument;
        const h = doc?.body?.scrollHeight;
        if (h && h > 1000) {
          setDocHeight(h + 20);
        }
      } catch {
        // fallback
      }
    };
    measure();
    setTimeout(measure, 300);
    setTimeout(measure, 800);
  };

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
    <div className="min-h-screen bg-slate-100 flex justify-center py-0 sm:py-4">
      <div
        ref={containerRef}
        className="w-full max-w-[794px] overflow-hidden bg-white shadow-sm"
        style={{ height: docHeight * scale }}
      >
        <div
          style={{
            width: 793,
            height: docHeight,
            transformOrigin: "top left",
            transform: `scale(${scale})`,
          }}
        >
          <iframe
            ref={iframeRef}
            id="public-invoice-frame"
            title="Insurance Policy Document"
            srcDoc={html}
            onLoad={handleLoad}
            style={{ width: 793, height: docHeight, border: "none" }}
          />
        </div>
      </div>
    </div>
  );
}