import fs from "node:fs/promises";
import path from "node:path";

/** Square calligraphy cover logo (知觀齋 + seal) — `jigwanjae-cover-logo`. */
const JIGWANJAE_COVER_LOGO_PATH = path.join(
  process.cwd(),
  "public",
  "stitch",
  "jigwanjae",
  "jigwanjae-cover-logo.png"
);

/** Legacy landscape asset (kept as fallback only). */
const JIGWANJAE_COVER_LOGO_FALLBACK_PATH = path.join(
  process.cwd(),
  "public",
  "stitch",
  "jigwanjae",
  "jigwanjae-cover-logo-wide.png"
);

let coverLogoDataUrl: string | null | undefined;

/** Clear in-memory logo cache (e.g. after asset replace). */
export function clearJigwanjaeCoverLogoCache(): void {
  coverLogoDataUrl = undefined;
}

function mimeFromBuffer(buffer: Buffer): string {
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50) {
    return "image/png";
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    return "image/jpeg";
  }
  return "image/png";
}

/** Base64 data URL for pdfmake `{ image: ... }`. Returns null if asset missing. */
export async function loadJigwanjaeCoverLogoDataUrl(): Promise<string | null> {
  if (coverLogoDataUrl !== undefined) return coverLogoDataUrl;

  for (const filePath of [JIGWANJAE_COVER_LOGO_PATH, JIGWANJAE_COVER_LOGO_FALLBACK_PATH]) {
    try {
      const buffer = await fs.readFile(filePath);
      const mime = mimeFromBuffer(buffer);
      coverLogoDataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
      return coverLogoDataUrl;
    } catch {
      // try next
    }
  }

  coverLogoDataUrl = null;
  return coverLogoDataUrl;
}
