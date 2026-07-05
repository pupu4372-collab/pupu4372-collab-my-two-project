import fs from "node:fs/promises";
import path from "node:path";

const JIGWANJAE_COVER_LOGO_PATH = path.join(
  process.cwd(),
  "public",
  "stitch",
  "jigwanjae",
  "jigwanjae-cover-logo.png"
);

let coverLogoDataUrl: string | null | undefined;

/** Base64 data URL for pdfmake `{ image: ... }`. Returns null if asset missing. */
export async function loadJigwanjaeCoverLogoDataUrl(): Promise<string | null> {
  if (coverLogoDataUrl !== undefined) return coverLogoDataUrl;

  try {
    const buffer = await fs.readFile(JIGWANJAE_COVER_LOGO_PATH);
    coverLogoDataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
  } catch {
    coverLogoDataUrl = null;
  }

  return coverLogoDataUrl;
}
