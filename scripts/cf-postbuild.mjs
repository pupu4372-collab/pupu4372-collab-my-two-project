import fs from "node:fs";
import path from "node:path";

const assetsDir = path.join(".open-next", "assets");
const strayNextDir = path.join(assetsDir, ".next");

if (fs.existsSync(strayNextDir)) {
  fs.rmSync(strayNextDir, { recursive: true, force: true });
}
