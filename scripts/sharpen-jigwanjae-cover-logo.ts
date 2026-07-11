/**
 * Crop soft DOF edges from jigwanjae cover photo and sharpen calligraphy.
 * Run: npx tsx scripts/sharpen-jigwanjae-cover-logo.ts
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = path.join(
  process.cwd(),
  "public",
  "stitch",
  "jigwanjae",
  "jigwanjae-cover-logo-wide.png"
);
const OUT = path.join(
  process.cwd(),
  "public",
  "stitch",
  "jigwanjae",
  "jigwanjae-cover-logo-wide.png"
);
const BACKUP = path.join(
  process.cwd(),
  "public",
  "stitch",
  "jigwanjae",
  "jigwanjae-cover-logo-wide.orig.png"
);

async function main() {
  const meta = await sharp(SRC).metadata();
  const w = meta.width ?? 900;
  const h = meta.height ?? 600;
  console.log("src", w, h, meta.format);

  // Keep calligraphy + seal; drop soft DOF bottom and margins.
  const left = Math.round(w * 0.08);
  const top = Math.round(h * 0.1);
  const cropW = Math.round(w * 0.84);
  const cropH = Math.round(h * 0.48);

  if (!fs.existsSync(BACKUP)) {
    fs.copyFileSync(SRC, BACKUP);
    console.log("backup", BACKUP);
  }

  await sharp(SRC)
    .extract({ left, top, width: cropW, height: cropH })
    .resize({
      width: cropW * 2,
      height: cropH * 2,
      kernel: sharp.kernel.lanczos3,
    })
    .modulate({ brightness: 1.03, saturation: 1.08 })
    .sharpen({ sigma: 1.8, m1: 1.3, m2: 0.8 })
    .png({ compressionLevel: 9 })
    .toFile(OUT + ".tmp.png");

  fs.renameSync(OUT + ".tmp.png", OUT);
  const outMeta = await sharp(OUT).metadata();
  console.log("out", outMeta.width, outMeta.height);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
