import type { ZiweiChart, ZiweiPalace } from "@/lib/saju/ksaju-engine";
import type { Locale } from "@/lib/saju/types";
import type { HumanPremiumReportSection } from "./types";

const PALACE_LABEL: Record<string, { ko: string; en: string }> = {
  命宮: { ko: "명궁(命宮)", en: "Life Palace" },
  兄弟宮: { ko: "형제궁", en: "Siblings Palace" },
  夫妻宮: { ko: "부부궁", en: "Spouse Palace" },
  子女宮: { ko: "자녀궁", en: "Children Palace" },
  財帛宮: { ko: "재백궁", en: "Wealth Palace" },
  疾厄宮: { ko: "질액궁", en: "Health Palace" },
  遷移宮: { ko: "천이궁", en: "Travel Palace" },
  交友宮: { ko: "교우궁", en: "Friends Palace" },
  官祿宮: { ko: "관록궁", en: "Career Palace" },
  田宅宮: { ko: "전택궁", en: "Property Palace" },
  福德宮: { ko: "복덕궁", en: "Fortune Palace" },
  父母宮: { ko: "부모궁", en: "Parents Palace" },
};

const PALACE_THEME: Record<string, { ko: string; en: string }> = {
  命宮: {
    ko: "성격·기질·인생의 중심축",
    en: "temperament and life direction",
  },
  兄弟宮: {
    ko: "형제·동료·가까운 경쟁 관계",
    en: "siblings, peers, and close rivals",
  },
  夫妻宮: {
    ko: "배우자·연애·동반자 관계",
    en: "partnership and marriage tone",
  },
  子女宮: {
    ko: "자녀·창작·후배와의 인연",
    en: "children, creativity, and protégés",
  },
  財帛宮: {
    ko: "재물·수입·경제적 그릇",
    en: "income style and financial capacity",
  },
  疾厄宮: {
    ko: "건강·스트레스·회복 리듬",
    en: "health rhythm and stress patterns",
  },
  遷移宮: {
    ko: "이동·변화·바깥세계와의 만남",
    en: "travel, change, and outer-world luck",
  },
  交友宮: {
    ko: "친구·네트워크·대중과의 관계",
    en: "friendships and social reach",
  },
  官祿宮: {
    ko: "직업·사회적 역할·성취",
    en: "career path and public role",
  },
  田宅宮: {
    ko: "주거·가정·자산의 기반",
    en: "home, property, and domestic base",
  },
  福德宮: {
    ko: "정신적 여유·복·내면의 만족",
    en: "inner peace and spiritual fortune",
  },
  父母宮: {
    ko: "부모·윗사람·보호와 유산",
    en: "parents, mentors, and inherited support",
  },
};

function palaceLabel(name: string, locale: Locale): string {
  return PALACE_LABEL[name]?.[locale] ?? name;
}

function formatPalaceLine(palace: ZiweiPalace, locale: Locale): string {
  const stars =
    palace.mainStars.length > 0
      ? palace.mainStars.join(locale === "ko" ? " · " : ", ")
      : locale === "ko"
        ? "주성 없음"
        : "no major star";
  const bodyMark = palace.isBodyPalace
    ? locale === "ko"
      ? " [신궁]"
      : " [Body]"
    : "";
  return `${palaceLabel(palace.name, locale)} (${palace.stem}${palace.branch})${bodyMark}: ${stars}`;
}

function lifePalace(chart: ZiweiChart): ZiweiPalace {
  return chart.palaces[0];
}

function keyPalaceBullets(chart: ZiweiChart, locale: Locale): string[] {
  const focus = ["命宮", "財帛宮", "官祿宮", "夫妻宮", "福德宮"];
  return chart.palaces
    .filter((p) => focus.includes(p.name))
    .map((p) => formatPalaceLine(p, locale));
}

export function buildZiweiChartSummary(chart: ZiweiChart) {
  return {
    lunarYear: chart.lunarYear,
    lunarMonth: chart.lunarMonth,
    lunarDay: chart.lunarDay,
    isLeapMonth: chart.isLeapMonth,
    bureau: chart.bureau.name,
    bureauNumber: chart.bureau.number,
    yearPillar: `${chart.yearStem}${chart.yearBranch}`,
    lifePalace: `${chart.lifePalaceBranch}`,
    bodyPalace: `${chart.bodyPalaceBranch}`,
    palaces: chart.palaces.map((p) => ({
      name: p.name,
      stem: p.stem,
      branch: p.branch,
      mainStars: p.mainStars,
      isBodyPalace: p.isBodyPalace,
    })),
  };
}

export function buildZiweiSections(
  chart: ZiweiChart,
  personName: string,
  locale: Locale,
  birthTimeUnknown: boolean
): HumanPremiumReportSection[] {
  const life = lifePalace(chart);
  const lifeStars = life.mainStars.join(locale === "ko" ? " · " : ", ");
  const hourNote =
    birthTimeUnknown
      ? locale === "ko"
        ? " 출생 시각이 없어 정오(12:00) 기준으로 명궁·신궁을 산출했습니다. 시각을 알게 되면 궁 배치가 달라질 수 있습니다."
        : " Birth hour was unknown; noon (12:00) was used for palace placement. A known birth time may shift the chart."
      : "";

  const overviewBody =
    locale === "ko"
      ? `${personName}님의 자미두수(紫微斗數) 명반은 음력 ${chart.lunarYear}년 ${chart.isLeapMonth ? "윤" : ""}${chart.lunarMonth}월 ${chart.lunarDay}일을 기준으로 펼쳐집니다.

오행국은 ${chart.bureau.name}이며, 명궁은 ${chart.lifePalaceBranch}궁, 신궁(身宮)은 ${chart.bodyPalaceBranch}궁에 놓입니다. 자미두수는 사주의 연·월·일·시와 별개로, 14주성이 12궁에 배치되는 별도의 명리 지도입니다.${hourNote}

명궁 ${life.stem}${life.branch}에는 ${lifeStars || "주성이 없어"} 보조성과 함께 삶의 중심 기질을 읽습니다. 자미두수는 길흉을 단정하기보다, 어느 영역에서 어떤 성향이 두드러지는지 살피는 참고 지도로 활용하는 것이 좋습니다.`
      : `${personName}'s Ziwei (Purple Star) chart is cast from lunar ${chart.lunarYear}-${chart.lunarMonth}-${chart.lunarDay}${chart.isLeapMonth ? " (leap month)" : ""}.

The element bureau is ${chart.bureau.name}. The Life Palace sits on ${chart.lifePalaceBranch}, and the Body Palace on ${chart.bodyPalaceBranch}. Ziwei maps 14 major stars across twelve palaces—a complementary lens to the four pillars.${hourNote}

Major stars in the Life Palace (${life.stem}${life.branch}): ${lifeStars || "none"}. Read this as a temperament map, not a fixed verdict.`;

  const palaceBody =
    locale === "ko"
      ? `12궁은 명궁에서 시계 반대 방향으로 배치됩니다. 각 궁의 천간·지지와 주성 조합은 해당 영역의 성향과 과제를 보여줍니다.`
      : `Twelve palaces unfold counter-clockwise from the Life Palace. Stem, branch, and major stars describe each life domain.`;

  const readingBody =
    locale === "ko"
      ? chart.palaces
          .filter((p) => p.mainStars.length > 0)
          .slice(0, 6)
          .map((p) => {
            const theme = PALACE_THEME[p.name]?.ko ?? "";
            return `${palaceLabel(p.name, locale)} — ${p.mainStars.join(" · ")}: ${theme} 영역에서 이 별들의 기운이 두드러질 수 있습니다.`;
          })
          .join("\n\n")
      : chart.palaces
          .filter((p) => p.mainStars.length > 0)
          .slice(0, 6)
          .map((p) => {
            const theme = PALACE_THEME[p.name]?.en ?? "";
            return `${palaceLabel(p.name, locale)} — ${p.mainStars.join(", ")}: these stars may stand out in ${theme}.`;
          })
          .join("\n\n");

  return [
    {
      id: "ziwei-overview",
      chapterId: "ziwei-chart",
      chapterTitle: locale === "ko" ? "자미두수" : "Ziwei Astrology",
      kind: "ziwei",
      title: locale === "ko" ? "자미두수 명반 개요" : "Ziwei chart overview",
      subtitle:
        locale === "ko"
          ? `${chart.bureau.name} · 명궁 ${chart.lifePalaceBranch}`
          : `${chart.bureau.name} · Life ${chart.lifePalaceBranch}`,
      body: overviewBody,
      bullets: keyPalaceBullets(chart, locale),
      pageEstimate: 2,
    },
    {
      id: "ziwei-palaces",
      chapterId: "ziwei-chart",
      chapterTitle: locale === "ko" ? "자미두수" : "Ziwei Astrology",
      kind: "ziwei",
      title: locale === "ko" ? "12궁 배치" : "Twelve palaces",
      body: palaceBody,
      bullets: chart.palaces.map((p) => formatPalaceLine(p, locale)),
      pageEstimate: 2,
    },
    {
      id: "ziwei-reading",
      chapterId: "ziwei-chart",
      chapterTitle: locale === "ko" ? "자미두수" : "Ziwei Astrology",
      kind: "ziwei",
      title: locale === "ko" ? "주성 해석 가이드" : "Major star reading guide",
      body: readingBody,
      pageEstimate: 2,
    },
  ];
}
