import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const mapPath = path.join(root, "stitch-export", "assets", "asset-map.tsv");
const exportDir = path.join(root, "stitch-export");

const urlToLocal = new Map();
for (const line of fs.readFileSync(mapPath, "utf8").split(/\r?\n/)) {
  const match = line.match(/^(asset-\d+\.jpg)\t(.+)$/);
  if (!match) continue;
  const url = match[2].trim();
  if (!url.startsWith("https://lh3.googleusercontent.com/")) continue;
  urlToLocal.set(url, `/stitch/${match[1]}`);
}

let filesUpdated = 0;
let replacements = 0;

for (const file of fs.readdirSync(exportDir).filter((name) => name.endsWith(".html"))) {
  const filePath = path.join(exportDir, file);
  let content = fs.readFileSync(filePath, "utf8");
  const before = content;
  for (const [url, local] of urlToLocal) {
    if (content.includes(url)) {
      content = content.split(url).join(local);
      replacements += (before.match(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
    }
  }
  if (content !== before) {
    fs.writeFileSync(filePath, content);
    filesUpdated += 1;
  }
}

const remaining = [...fs.readdirSync(exportDir).filter((name) => name.endsWith(".html"))].reduce(
  (sum, name) => sum + (fs.readFileSync(path.join(exportDir, name), "utf8").match(/lh3\.googleusercontent/g)?.length ?? 0),
  0
);

console.log(JSON.stringify({ mapped: urlToLocal.size, filesUpdated, replacements, remaining }));
