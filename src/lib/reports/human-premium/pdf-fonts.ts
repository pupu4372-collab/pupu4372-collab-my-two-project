import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import pdfMake from "pdfmake";

export const PDF_FONT_FAMILY = "NotoSansKR";

const CACHE_DIR = path.join(os.tmpdir(), "human-premium-fonts");
const LOCAL_FONT_DIR = path.join(process.cwd(), "src/assets/fonts/NotoSansKR-static");

const DEFAULT_FONT_URLS = {
  normal:
    "https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/KR/NotoSansKR-Regular.otf",
  bold:
    "https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/KR/NotoSansKR-Bold.otf",
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadFont(url: string, dest: string): Promise<void> {
  if (await fileExists(dest)) return;

  await fs.mkdir(path.dirname(dest), { recursive: true });
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Font download failed (${response.status}): ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(dest, buffer);
}

let fontsReady: Promise<void> | null = null;

async function loadFonts(): Promise<void> {
  const normalLocal = path.join(LOCAL_FONT_DIR, "NotoSansKR-Regular.otf");
  const boldLocal = path.join(LOCAL_FONT_DIR, "NotoSansKR-Bold.otf");

  if (
    !process.env.HUMAN_PREMIUM_PDF_FONT_REGULAR_URL &&
    (await fileExists(normalLocal)) &&
    (await fileExists(boldLocal))
  ) {
    const fontRoot = path.join(process.cwd(), "src/assets/fonts");
    pdfMake.setUrlAccessPolicy(() => false);
    pdfMake.setLocalAccessPolicy((fontPath) => fontPath.startsWith(fontRoot));
    pdfMake.addFonts({
      [PDF_FONT_FAMILY]: {
        normal: normalLocal,
        bold: boldLocal,
        italics: normalLocal,
        bolditalics: boldLocal,
      },
    });
    return;
  }

  const normalUrl =
    process.env.HUMAN_PREMIUM_PDF_FONT_REGULAR_URL ?? DEFAULT_FONT_URLS.normal;
  const boldUrl =
    process.env.HUMAN_PREMIUM_PDF_FONT_BOLD_URL ?? DEFAULT_FONT_URLS.bold;
  const normalPath = path.join(CACHE_DIR, "NotoSansKR-Regular.otf");
  const boldPath = path.join(CACHE_DIR, "NotoSansKR-Bold.otf");

  await downloadFont(normalUrl, normalPath);
  await downloadFont(boldUrl, boldPath);

  pdfMake.setUrlAccessPolicy(() => false);
  pdfMake.setLocalAccessPolicy((fontPath) => fontPath.startsWith(CACHE_DIR));
  pdfMake.addFonts({
    [PDF_FONT_FAMILY]: {
      normal: normalPath,
      bold: boldPath,
      italics: normalPath,
      bolditalics: boldPath,
    },
  });
}

export async function ensurePdfFontsAsync(): Promise<void> {
  if (!fontsReady) {
    fontsReady = loadFonts();
  }
  await fontsReady;
}
