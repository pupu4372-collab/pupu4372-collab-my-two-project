import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "public", "stitch", "asset-09.jpg");
const publicDir = path.join(root, "public");
const appDir = path.join(root, "src", "app");

if (!fs.existsSync(source)) {
  console.warn("Logo not found, skipping favicon generation:", source);
  process.exit(0);
}

fs.mkdirSync(publicDir, { recursive: true });
fs.mkdirSync(appDir, { recursive: true });

async function squarePng(size) {
  return sharp(source)
    .resize(size, size, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();
}

const pngSizes = [
  { file: path.join(publicDir, "favicon-32x32.png"), size: 32 },
  { file: path.join(publicDir, "favicon-48x48.png"), size: 48 },
  { file: path.join(publicDir, "apple-touch-icon.png"), size: 180 },
  { file: path.join(publicDir, "icon-192.png"), size: 192 },
  { file: path.join(publicDir, "icon-512.png"), size: 512 },
  { file: path.join(appDir, "icon.png"), size: 32 },
  { file: path.join(appDir, "apple-icon.png"), size: 180 },
];

for (const { file, size } of pngSizes) {
  const buf = await squarePng(size);
  fs.writeFileSync(file, buf);
  console.log("Wrote", path.relative(root, file));
}

const ico16 = await squarePng(16);
const ico32 = await squarePng(32);
const ico48 = await squarePng(48);
const icoBuf = await toIco([ico16, ico32, ico48]);

for (const icoPath of [
  path.join(publicDir, "favicon.ico"),
  path.join(appDir, "favicon.ico"),
]) {
  fs.writeFileSync(icoPath, icoBuf);
  console.log("Wrote", path.relative(root, icoPath));
}

console.log("Done.");
