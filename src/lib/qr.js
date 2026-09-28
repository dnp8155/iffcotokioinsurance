import QRCode from "qrcode";

// Generate a self-contained QR code as a PNG data URL for the given text.
// No external service — always renders, even offline and in print.
export async function generateQrDataUrl(text) {
  try {
    return await QRCode.toDataURL(text, {
      width: 240,
      margin: 0,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    });
  } catch {
    return null;
  }
}