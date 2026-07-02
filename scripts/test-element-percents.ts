import { buildElementBreakdown } from "../src/lib/saju/elements";

function assertSum100(label: string, chars: string[]) {
  const breakdown = buildElementBreakdown(chars);
  const sum = breakdown.reduce((total, item) => total + item.percent, 0);
  const counts = breakdown.map((item) => `${item.key}:${item.count}=${item.percent}%`).join(", ");

  if (sum !== 100) {
    throw new Error(`${label}: expected sum 100, got ${sum} (${counts})`);
  }

  for (const item of breakdown) {
    if (item.count === 0 && item.percent !== 0) {
      throw new Error(`${label}: ${item.key} count 0 but percent ${item.percent}`);
    }
  }

  console.log(`OK ${label}: sum=${sum} [${counts}]`);
}

// 8 chars: wood 3, fire 2, earth/metal/water 1 each (old Math.round could sum to 102)
assertSum100("8-char skewed", ["甲", "寅", "乙", "丙", "午", "戊", "庚", "壬"]);

// 6 chars: wood 2, others 1 each
assertSum100("6-char skewed", ["甲", "乙", "丙", "戊", "庚", "壬"]);

// 8 chars: wood/fire/earth/metal 2 each, water 0
assertSum100("8-char with zero element", ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛"]);

console.log("All element percent tests passed.");
