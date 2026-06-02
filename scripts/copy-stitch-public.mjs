import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "stitch-export", "assets");
const target = path.join(root, "public", "stitch");

fs.mkdirSync(target, { recursive: true });
let count = 0;
for (const name of fs.readdirSync(source)) {
  if (!/^asset-\d+\.jpg$/.test(name)) continue;
  fs.copyFileSync(path.join(source, name), path.join(target, name));
  count += 1;
}
console.log(`Copied ${count} files to public/stitch`);
