/**
 * Sync official brand icons into App Router + public paths.
 * Source of truth: public/stitch/brand/*
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const brandDir = path.join(root, "public", "stitch", "brand");
const publicDir = path.join(root, "public");
const appDir = path.join(root, "src", "app");

const required = [
  "favicon.ico",
  "apple-touch-icon.png",
  "icon-192.png",
  "icon-512.png",
];

for (const name of required) {
  const p = path.join(brandDir, name);
  if (!fs.existsSync(p)) {
    console.error("Missing brand icon:", p);
    process.exit(1);
  }
}

fs.mkdirSync(publicDir, { recursive: true });
fs.mkdirSync(appDir, { recursive: true });

const copies = [
  ["favicon.ico", path.join(appDir, "favicon.ico")],
  ["icon-512.png", path.join(appDir, "icon.png")],
  ["apple-touch-icon.png", path.join(appDir, "apple-icon.png")],
  ["favicon.ico", path.join(publicDir, "favicon.ico")],
  ["apple-touch-icon.png", path.join(publicDir, "apple-touch-icon.png")],
  ["icon-192.png", path.join(publicDir, "icon-192.png")],
  ["icon-512.png", path.join(publicDir, "icon-512.png")],
];

// Optional smaller PNG for legacy public refs
const favicon32 = path.join(brandDir, "favicon-32.png");
if (fs.existsSync(favicon32)) {
  copies.push(["favicon-32.png", path.join(publicDir, "favicon-32x32.png")]);
}

for (const [srcName, dest] of copies) {
  fs.copyFileSync(path.join(brandDir, srcName), dest);
  console.log("Synced", path.relative(root, dest));
}

const obsolete = [path.join(publicDir, "favicon-48x48.png")];
for (const file of obsolete) {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log("Removed", path.relative(root, file));
  }
}

console.log("Done.");
