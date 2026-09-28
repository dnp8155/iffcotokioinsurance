import QRCode from "qrcode";

// Generate a QR code as an inline SVG string.
// Inline SVG avoids data: URL / CSP issues inside iframes and always renders.
export async function generateQrSvg(text) {
  try {
    return await QRCode.toString(text, {
      type: "svg",
      margin: 0,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    });
  } catch {
    return null;
  }
}