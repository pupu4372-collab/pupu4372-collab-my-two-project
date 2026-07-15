import type { PetDailyFortune, PetFortunePetMeta } from "@/lib/saju/pet-daily-fortune";
import {
  buildInstaSectionBodies,
  formatInstaCardKstDate,
  harmonyScore,
  instaCardStatItems,
  petInstaEmoji,
} from "@/lib/share/daily-fortune-insta-card";
import { getTodayKstDateString } from "@/lib/saju/zodiac/fortunes";
import sharp from "sharp";

const CARD_SIZE = 1080;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapLines(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length >= maxLines) break;
  }
  if (lines.length < maxLines && current) lines.push(current);
  if (lines.length > maxLines) {
    return lines.slice(0, maxLines);
  }
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    const last = lines[maxLines - 1];
    lines[maxLines - 1] = last.length > 3 ? `${last.slice(0, Math.max(0, last.length - 1))}…` : `${last}…`;
  }
  return lines;
}

/** Server-side PNG of the Instagram “오늘의 케어” card (no website URL in footer). */
export async function renderDailyCareCardPng(options: {
  pet: PetFortunePetMeta;
  fortune: PetDailyFortune;
  isKo: boolean;
  dateKst?: string;
}): Promise<Buffer> {
  const { pet, fortune, isKo } = options;
  const dateKst = options.dateKst ?? getTodayKstDateString();
  const harmony = harmonyScore(fortune);
  const stats = instaCardStatItems(fortune, isKo);
  const sections = buildInstaSectionBodies(pet, fortune, isKo);
  const dateLabel = formatInstaCardKstDate(isKo, dateKst);
  const petEmoji = petInstaEmoji(pet.species);
  const title = isKo
    ? `${petEmoji} ${pet.name}의 오늘 케어 가이드`
    : `${petEmoji} ${pet.name}'s care guide today`;
  const footer = isKo ? "내 아이 오늘의 케어법" : "My pet's care guide today";

  const sectionCards = [
    {
      title: isKo ? "오늘의 아이 상태" : "Today's mood",
      body: sections.todayState,
      accent: "#E8C04A",
    },
    {
      title: isKo ? "아이의 본성" : "Innate nature",
      body: sections.nature,
      accent: "#3A362D",
    },
    {
      title: isKo ? "집사를 위한 팁" : "Tip for butler",
      body: sections.tipBody,
      accent: "#E8874A",
    },
  ];

  const statRows = stats
    .map((stat, index) => {
      const y = 320 + index * 72;
      const fillW = Math.max(8, Math.round((stat.score / 100) * 360));
      return `
        <text x="520" y="${y}" fill="#F5EFE4" font-size="22" font-family="Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif" font-weight="700">${escapeXml(stat.label)}</text>
        <text x="1000" y="${y}" text-anchor="end" fill="#C8BBA8" font-size="18" font-family="Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif">${escapeXml(stat.band)}</text>
        <rect x="520" y="${y + 12}" width="480" height="14" rx="7" fill="#2A261F"/>
        <rect x="520" y="${y + 12}" width="${fillW}" height="14" rx="7" fill="${stat.color}"/>
      `;
    })
    .join("");

  let sectionY = 640;
  const sectionBlocks = sectionCards
    .map((section) => {
      const lines = wrapLines(section.body, 48, 3);
      const blockH = 36 + lines.length * 26 + 18;
      const y = sectionY;
      sectionY += blockH + 14;
      const lineSvg = lines
        .map(
          (line, i) =>
            `<text x="72" y="${y + 58 + i * 26}" fill="#D8CFC0" font-size="20" font-family="Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif">${escapeXml(line)}</text>`
        )
        .join("");
      return `
        <rect x="48" y="${y}" width="984" height="${blockH}" rx="20" fill="#241F18" stroke="#3A342B"/>
        <rect x="48" y="${y}" width="984" height="6" rx="3" fill="${section.accent}"/>
        <text x="72" y="${y + 32}" fill="#F5EFE4" font-size="22" font-weight="700" font-family="Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif">${escapeXml(section.title)}</text>
        ${lineSvg}
      `;
    })
    .join("");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_SIZE}" height="${CARD_SIZE}" viewBox="0 0 ${CARD_SIZE} ${CARD_SIZE}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1A1814"/>
      <stop offset="100%" stop-color="#12100D"/>
    </linearGradient>
  </defs>
  <rect width="${CARD_SIZE}" height="${CARD_SIZE}" fill="url(#bg)"/>
  <text x="72" y="78" fill="#A89880" font-size="24" font-family="Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif">${escapeXml(dateLabel)}</text>
  <text x="72" y="130" fill="#F8F1E4" font-size="40" font-weight="800" font-family="Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif">${escapeXml(title)}</text>

  <circle cx="250" cy="320" r="120" fill="none" stroke="#3A342B" stroke-width="18"/>
  <circle cx="250" cy="320" r="120" fill="none" stroke="#E8C04A" stroke-width="18"
    stroke-dasharray="${Math.round((harmony / 100) * 754)} 754" stroke-linecap="round" transform="rotate(-90 250 320)"/>
  <text x="250" y="290" text-anchor="middle" fill="#A89880" font-size="20" font-family="Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif">${escapeXml(isKo ? "케어 조화도" : "Care harmony")}</text>
  <text x="250" y="340" text-anchor="middle" fill="#F8F1E4" font-size="52" font-weight="800" font-family="Arial,sans-serif">${harmony}%</text>
  <rect x="170" y="360" width="160" height="36" rx="18" fill="#3A342B"/>
  <text x="250" y="384" text-anchor="middle" fill="#E8C04A" font-size="16" font-family="Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif">${escapeXml(fortune.title.slice(0, 12))}</text>

  ${statRows}
  ${sectionBlocks}

  <text x="72" y="1020" fill="#6E6456" font-size="22" font-family="Arial,sans-serif">#ksajupet</text>
  <text x="1008" y="1020" text-anchor="end" fill="#8A7C68" font-size="20" font-family="Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif">${escapeXml(footer)}</text>
</svg>`;

  return sharp(Buffer.from(svg)).png({ compressionLevel: 8 }).toBuffer();
}
