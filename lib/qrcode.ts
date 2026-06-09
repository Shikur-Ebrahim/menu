import QRCode from "qrcode";

/**
 * Generate a QR code data URL for the given text
 */
export async function generateQRDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 400,
    margin: 2,
    color: {
      dark: "#1a1a2e",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
}

/**
 * Download a data URL as a PNG file
 */
export function downloadPNG(dataUrl: string, filename = "qr-code.png"): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

/**
 * Generate the public menu URL for a restaurant slug
 */
export function getMenuUrl(slug: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/menu/${slug}`;
  }
  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://nemu.app";
  return `${domain}/menu/${slug}`;
}
