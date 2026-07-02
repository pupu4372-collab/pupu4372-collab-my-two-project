import { ELEMENT_META, charToElement } from "@/lib/saju/elements";
import {
  computeSeunNatalInteractions,
  computeSeunPillar,
  describeLuckPillar,
} from "@/lib/saju/luck-pillars";
import { computeChartSipseong } from "@/lib/saju/sipseong";
import { computeRepresentativeShinsal } from "@/lib/saju/shinsal";
import type { ElementKey, Locale, PillarDisplay, SajuBasicResponse } from "@/lib/saju/types";
import type { HumanPremiumReportSection } from "./types";

const STAGE1_KO = "타고난 성격과 무기 (십신과 격국)";
const STAGE2_KO = "분야별 평생 성적표 (건강·재물·연애 융합)";
const STAGE3_KO = "인생 종합 처방전 (개운법, 開運法)";
const STAGE1_EN = "Innate temperament & tools (Ten Gods & frame)";
const STAGE2_EN = "Lifetime scorecard (health, wealth & love)";
const STAGE3_EN = "Life prescription (開運 kaewoon)";

const LUCKY_BY_ELEMENT: Record<
  ElementKey,
  {
    ko: { color: string; direction: string; numbers: string; food: string };
    en: { color: string; direction: string; numbers: string; food: string };
  }
> = {
  wood: {
    ko: { color: "청록·초록", direction: "동쪽", numbers: "3, 8", food: "신선한 채소·허브·곡물" },
    en: { color: "green/teal", direction: "east", numbers: "3, 8", food: "fresh greens, herbs, grains" },
  },
  fire: {
    ko: { color: "붉은·주황", direction: "남쪽", numbers: "2, 7", food: "따뜻한 수프·향신료·붉은색 채소" },
    en: { color: "red/orange", direction: "south", numbers: "2, 7", food: "warm soups, spices, red produce" },
  },
  earth: {
    ko: { color: "베이지·황토", direction: "중앙·남서", numbers: "5, 10", food: "뿌리채소·잡곡·구수한 음식" },
    en: { color: "beige/ochre", direction: "center/southwest", numbers: "5, 10", food: "root vegetables, whole grains" },
  },
  metal: {
    ko: { color: "흰색·은색", direction: "서쪽", numbers: "4, 9", food: "담백한 단백질·흰색 채소" },
    en: { color: "white/silver", direction: "west", numbers: "4, 9", food: "lean protein, light vegetables" },
  },
  water: {
    ko: { color: "검정·남색", direction: "북쪽", numbers: "1, 6", food: "수분 많은 음식·해산물·국물" },
    en: { color: "black/navy", direction: "north", numbers: "1, 6", food: "hydrating foods, broths, seafood" },
  },
};

function elLabel(el: ElementKey, locale: Locale): string {
  const meta = ELEMENT_META[el];
  return locale === "ko"
    ? `${meta.hangul}(${meta.hanja})`
    : `${meta.meaning} (${meta.hanja})`;
}

function pillarText(pillar: PillarDisplay): string {
  return `${pillar.pillar}(${pillar.stemLabel}·${pillar.branchLabel})`;
}

function pickWeakElement(saju: SajuBasicResponse): ElementKey {
  const sorted = [...saju.elements].sort((a, b) => a.count - b.count);
  const weakest = sorted.find((e) => e.count === 0)?.key ?? sorted[0]?.key;
  return weakest ?? saju.dominantElement;
}

function pickYongsinElement(saju: SajuBasicResponse): ElementKey {
  const weak = pickWeakElement(saju);
  if (saju.elements.find((e) => e.key === weak)?.count === 0) return weak;
  const cycle: Record<ElementKey, ElementKey> = {
    wood: "water",
    fire: "wood",
    earth: "fire",
    metal: "earth",
    water: "metal",
  };
  return cycle[saju.dominantElement] ?? weak;
}

function sipseongSummary(saju: SajuBasicResponse, locale: Locale): string {
  const chart = computeChartSipseong(saju.pillars.day.stemHanja, saju.pillars, locale);
  const slots = (["year", "month", "day", "hour"] as const)
    .map((slot) => chart[slot])
    .filter(Boolean);
  if (locale === "ko") {
    return slots
      .map((row, i) => {
        const labels = ["년", "월", "일", "시"];
        return `${labels[i]}주 천간 ${row!.stem}·지지 ${row!.branch}`;
      })
      .join(", ");
  }
  return slots
    .map((row, i) => `Pillar ${i + 1}: stem ${row!.stem}, branch ${row!.branch}`)
    .join("; ");
}

function shinsalRiskLines(saju: SajuBasicResponse, locale: Locale): string[] {
  const shinsal = computeRepresentativeShinsal(saju.pillars, locale);
  return shinsal
    .filter((row) => row.matchedSlots.length > 0)
    .map((row) => {
      const where = row.matchedSlots.map((s) => s.label).join(", ");
      return locale === "ko"
        ? `${row.name}(${where}) — 과하면 구설·변동·피로 신호로 읽을 수 있음`
        : `${row.name} (${where}) — when overactive, watch gossip, change, or fatigue`;
    });
}

export function fortuneYearForReport(): number {
  return new Date().getFullYear();
}

export function yearFortuneTitle(year: number, locale: Locale): string {
  return locale === "ko" ? `${year}년 사주 총평` : `${year} Saju overview`;
}

function section(
  partial: Omit<HumanPremiumReportSection, "pageEstimate"> & { pageEstimate?: number }
): HumanPremiumReportSection {
  return { pageEstimate: 2, ...partial };
}

export function buildYearFortuneSections(
  saju: SajuBasicResponse,
  locale: Locale,
  fortuneYear = fortuneYearForReport()
): HumanPremiumReportSection[] {
  const name = saju.petName;
  const dayStem = saju.pillars.day.stemHanja;
  const seunPillar = computeSeunPillar(fortuneYear);
  const seun = describeLuckPillar(dayStem, seunPillar, locale);
  const interactions = computeSeunNatalInteractions(
    seunPillar.branchHanja,
    saju.pillars,
    locale
  );
  const dominant = elLabel(saju.dominantElement, locale);
  const yongsin = pickYongsinElement(saju);
  const yongsinLabel = elLabel(yongsin, locale);
  const lucky = LUCKY_BY_ELEMENT[yongsin][locale === "ko" ? "ko" : "en"];
  const sipSummary = sipseongSummary(saju, locale);
  const risks = shinsalRiskLines(saju, locale);
  const weakList = saju.elements
    .filter((e) => e.count <= 1)
    .map((e) => elLabel(e.key, locale))
    .join(locale === "ko" ? ", " : ", ") || dominant;

  const interactionText =
    interactions.length > 0
      ? interactions.map((l) => l.label).join(locale === "ko" ? ", " : "; ")
      : locale === "ko"
        ? "원국과 올해 세운 사이 뚜렷한 충·합 신호는 약함"
        : "no strong clash/harmony signals between natal chart and this year's seun";

  if (locale === "ko") {
    return [
      section({
        id: "result-year-fortune",
        chapterId: "saju-result",
        chapterTitle: "사주결과",
        kind: "summary",
        title: yearFortuneTitle(fortuneYear, locale),
        subtitle: `${fortuneYear}년 세운 ${pillarText(seunPillar)} · 원국 년주 ${pillarText(saju.pillars.year)}`,
        body: `${fortuneYear}년은 ${name}님에게 ${pillarText(seunPillar)} 세운이 겹치는 해입니다. 천간 십성 ${seun.stemTenGod}, 지지 십성 ${seun.branchTenGod}의 기운이 한 해의 큰 줄기를 이루며, 원국과의 상호작용은 ${interactionText}으로 읽힙니다.

이 총평은 출생 원국(년·월·일${saju.pillars.hour ? "·시" : ""})과 올해 세운을 함께 놓고, 성격·재물·관계·건강의 평생 축을 단계별로 풀어 갑니다. 운은 예언이 아니라 타이밍의 지도이니, 아래 항목을 참고해 선택의 폭을 넓혀 보세요.`,
        bullets: [
          `${fortuneYear}년 세운: ${pillarText(seunPillar)}`,
          `대표 오행: ${dominant}`,
          `보완 기운(용신 후보): ${yongsinLabel}`,
        ],
        pageEstimate: 3,
      }),
      section({
        id: "result-temperament",
        chapterId: "saju-result",
        chapterTitle: "사주결과",
        kind: "domain",
        title: "성격 및 기질 총평",
        subtitle: STAGE1_KO,
        body: `년주 ${pillarText(saju.pillars.year)}는 바깥으로 드러나는 사회적 페르소나, 일주 ${pillarText(saju.pillars.day)}는 무의식 속 깊은 내면의 축을 보여줍니다. 월주 ${pillarText(saju.pillars.month)}는 직장·사회 무대에서의 태도를,${saju.pillars.hour ? ` 시주 ${pillarText(saju.pillars.hour)}는 말년과 숨은 습관을` : ""} 비춥니다.

원국 십성 분포: ${sipSummary}. 겉으로는 년·월의 기운이 먼저 보이지만, 실제 선택의 중심에는 일주의 힘이 있습니다. ${name}님은 타인이 보는 이미지와 속마음의 속도가 다를 수 있으니, 중요한 결정은 한 박자 늦춰 내면의 리듬을 확인한 뒤 움직이는 것이 좋습니다. ${dominant} 기운이 강할수록 장점을 과신하지 말고 주변 반응을 읽는 연습이 균형을 잡아 줍니다.`,
        pageEstimate: 3,
      }),
      section({
        id: "result-gyeokguk-yongsin",
        chapterId: "saju-result",
        chapterTitle: "사주결과",
        kind: "domain",
        title: "격국(格局)과 용신(用神)",
        subtitle: STAGE1_KO,
        body: `월주 ${pillarText(saju.pillars.month)}를 중심으로 일간 ${saju.pillars.day.stemLabel}(${elLabel(charToElement(dayStem) ?? saju.dominantElement, locale)})이 자리 잡은 구조에서, ${name}님의 격국은 ‘한 가지 기운에 치우치지 않고 월령의 계절감 속에서 일간을 세우는’ 형태로 읽힙니다. 사회적 역할(월)과 자아(일)의 조화가 인생의 중심 정체성입니다.

용신(用神)은 chart에서 상대적으로 약한 ${weakList} 쪽을 보완하는 ${yongsinLabel} 기운으로 잡습니다. 위기나 피로가 올 때는 이 기운을 생활 속에서 의식적으로 채우세요 — 색·방향·음식·휴식 리듬에 반영하면 균형이 빨리 돌아옵니다. 용신은 만능약이 아니라 ‘균형을 되찾는 나침반’입니다.`,
        pageEstimate: 3,
      }),
      section({
        id: "result-wealth",
        chapterId: "saju-result",
        chapterTitle: "사주결과",
        kind: "domain",
        title: "재물운 (Wealth)",
        subtitle: STAGE2_KO,
        body: `${name}님의 재물 그릇은 ${dominant} 기운과 월주 ${pillarText(saju.pillars.month)}의 십성 흐름이 만드는 ‘${saju.elements.find((e) => e.key === saju.dominantElement)?.count ?? 0}회 등장하는 대표 오행’의 밀도와 연결됩니다. 한 번에 크게 벌기보다 반복 가능한 수입 구조·신뢰가 쌓이는 전문성이 평생 재테크 성향에 맞습니다.

직장과 사업의 기로에서는 속도보다 계약·현금흐름·파트너 신뢰를 먼저 보는 편이 유리합니다. 편재·정재 성향이 강한 달·대운에는 기회가 빠르게 오므로 검증 후 움직이고, 비겁·식상 쪽이 강할 때는 지출과 분배 규칙을 분명히 하세요.`,
        pageEstimate: 3,
      }),
      section({
        id: "result-career",
        chapterId: "saju-result",
        chapterTitle: "사주결과",
        kind: "domain",
        title: "직업/성공운 (Career)",
        subtitle: STAGE2_KO,
        body: `사회적 출세와 성공의 무기는 월주 ${pillarText(saju.pillars.month)}와 일주 ${pillarText(saju.pillars.day)}가 만드는 십성 조합에서 찾습니다. ${dominant} 기운을 살릴 수 있는 분야 — 기획·교육·기술·예술·관리·상담 등에서 ‘사람을 연결하거나 기준을 세우는’ 역할이 강점으로 작동합니다.

대운 흐름에서 관성(官星)·식상(食傷)이 살아나는 시기가 사회적 인정이 오르는 구간입니다. 성별·순행 정보가 확정되면 대운 장에서 더 정밀히 짚을 수 있으니, 이 리포트의 대운 후보와 함께 읽어 보세요. 가장 강한 무기는 ‘전문성 + 말투의 절제’입니다.`,
        pageEstimate: 3,
      }),
      section({
        id: "result-love",
        chapterId: "saju-result",
        chapterTitle: "사주결과",
        kind: "domain",
        title: "연애/결혼운 (Love)",
        subtitle: STAGE2_KO,
        body: `일지 ${saju.pillars.day.branchLabel}는 배우자궁·친밀 관계의 바탕을, 년·월주는 끌리는 이성의 ‘겉모습과 생활 리듬’을 보여줍니다. ${name}님은 안정과 자극 사이에서 균형을 찾는 인연을 만나기 쉽고, 말투와 약속의 신뢰가 인연이 단단해지는 열쇠입니다.

도화·천을 등 원국 신살이 살아 있으면 인연의 폭은 넓어지나 선택의 기준이 더 중요합니다. 인연이 깊어지는 시기는 대운·세운에서 정인·정관·재성이 조화를 이루거나, 일지와 합·생의 신호가 올 때입니다. 서두른 확정보다 반복된 신뢰가 배우자 복을 만듭니다.`,
        pageEstimate: 3,
      }),
      section({
        id: "result-health-risk",
        chapterId: "saju-result",
        chapterTitle: "사주결과",
        kind: "domain",
        title: "건강 및 조심해야 할 액운",
        subtitle: STAGE2_KO,
        body: `오행 분포상 ${weakList} 기운이 상대적으로 약하면 해당 장부·컨디션 리듬을 평생 챙기는 것이 좋습니다. ${dominant} 기운이 과할 때는 과로·과열·과한 자극으로 균형이 깨지기 쉬우니, 휴식 루틴을 미리 정해 두세요.

살(煞)·신살 관점의 참고 신호: ${risks.length > 0 ? risks.join(" / ") : "원국 대표 신살의 과잉 작동 시 구설·이동·감정 기복에 주의"}. 이는 사고를 단정하지 않으며, 말과 계약·이동·건강 검진을 평소보다 한 번 더 확인하는 습관으로 풀어 가세요.`,
        pageEstimate: 3,
      }),
      section({
        id: "result-lucky-items",
        chapterId: "saju-result",
        chapterTitle: "사주결과",
        kind: "domain",
        title: "나만의 행운 아이템",
        subtitle: STAGE3_KO,
        body: `부족한 기운을 보완할 용신 후보 ${yongsinLabel}에 맞춘 처방입니다. 색상: ${lucky.color} / 방향: ${lucky.direction} / 숫자: ${lucky.numbers} / 음식: ${lucky.food}.

책상 방향, 소품 색, 지갑·노트 선택, 식단에 한 가지씩만 반영해도 심리적 안정과 리듬 회복에 도움이 됩니다. 개운(開運)은 비싼 물건이 아니라 ‘약한 오행을 생활에 다시 불어넣는’ 습관입니다.`,
        pageEstimate: 2,
      }),
      section({
        id: "result-final-advice",
        chapterId: "saju-result",
        chapterTitle: "사주결과",
        kind: "summary",
        title: "인생의 최종 조언",
        subtitle: STAGE3_KO,
        body: `${name}님, 운명은 정해진 결말이 아니라 흐름입니다. 알고 늦추고, 부족한 기운을 채우고, 약속을 지키는 사람에게 운은 길잡이가 됩니다. 심원 올림: 서두르지 말고, 당신의 리듬으로 꽃피우세요.`,
        pageEstimate: 1,
      }),
    ];
  }

  return [
    section({
      id: "result-year-fortune",
      chapterId: "saju-result",
      chapterTitle: "Saju Result",
      kind: "summary",
      title: yearFortuneTitle(fortuneYear, locale),
      subtitle: `${fortuneYear} seun ${pillarText(seunPillar)} · natal year ${pillarText(saju.pillars.year)}`,
      body: `${fortuneYear} brings seun pillar ${pillarText(seunPillar)} for ${name}. Stem Ten God ${seun.stemTenGod}, branch ${seun.branchTenGod}. Natal interaction: ${interactionText}.

This overview reads your birth chart with the current year's stem and unfolds temperament, wealth, career, love, health, and kaewoon in stages below.`,
      bullets: [
        `${fortuneYear} seun: ${pillarText(seunPillar)}`,
        `Core element: ${dominant}`,
        `Support element (yongsin candidate): ${yongsinLabel}`,
      ],
      pageEstimate: 3,
    }),
    section({
      id: "result-temperament",
      chapterId: "saju-result",
      chapterTitle: "Saju Result",
      kind: "domain",
      title: "Temperament overview",
      subtitle: STAGE1_EN,
      body: `Year pillar ${pillarText(saju.pillars.year)} shapes your social persona; day pillar ${pillarText(saju.pillars.day)} holds your inner axis. Month pillar ${pillarText(saju.pillars.month)} colors work and public stance.

Natal Ten Gods: ${sipSummary}. Others may read your year-month tone before your day-master core—pause to align inner rhythm before major choices. Strong ${dominant} energy rewards humility and reading the room.`,
      pageEstimate: 3,
    }),
    section({
      id: "result-gyeokguk-yongsin",
      chapterId: "saju-result",
      chapterTitle: "Saju Result",
      kind: "domain",
      title: "Chart frame & yongsin",
      subtitle: STAGE1_EN,
      body: `Centered on month pillar ${pillarText(saju.pillars.month)} and day master ${saju.pillars.day.stemLabel}, your life frame balances seasonal month energy with self pillar identity.

Yongsin (balancing element): strengthen ${yongsinLabel}, especially when ${weakList} runs low. Use color, direction, food, and rest—not as superstition but as a compass back to balance.`,
      pageEstimate: 3,
    }),
    section({
      id: "result-wealth",
      chapterId: "saju-result",
      chapterTitle: "Saju Result",
      kind: "domain",
      title: "Wealth",
      subtitle: STAGE2_EN,
      body: `Wealth capacity links to ${dominant} density and month pillar flow. Sustainable income systems and trusted expertise beat one-shot gambles.

At career forks, prioritize contracts, cash rhythm, and partner trust. When Indirect/Direct Wealth tones rise in luck cycles, verify before you leap.`,
      pageEstimate: 3,
    }),
    section({
      id: "result-career",
      chapterId: "saju-result",
      chapterTitle: "Saju Result",
      kind: "domain",
      title: "Career & success",
      subtitle: STAGE2_EN,
      body: `Your strongest professional weapons emerge where month and day pillars meet ${dominant} energy—roles that connect people or set standards fit well.

Officer and Output stars in major luck cycles often mark recognition windows. Pair this section with the daewoon chapter for timing. Weapon: expertise plus restrained speech.`,
      pageEstimate: 3,
    }),
    section({
      id: "result-love",
      chapterId: "saju-result",
      chapterTitle: "Saju Result",
      kind: "domain",
      title: "Love & marriage",
      subtitle: STAGE2_EN,
      body: `Day branch ${saju.pillars.day.branchLabel} anchors intimacy; year and month show who you attract and daily rhythm fit. Trust built through tone and kept promises deepens bonds.

Bonds strengthen when Resource/Officer/Wealth stars harmonize in luck cycles. Favor repeated trust over rushed commitment.`,
      pageEstimate: 3,
    }),
    section({
      id: "result-health-risk",
      chapterId: "saju-result",
      chapterTitle: "Saju Result",
      kind: "domain",
      title: "Health & caution stars",
      subtitle: STAGE2_EN,
      body: `Watch rhythms tied to weaker elements: ${weakList}. When ${dominant} runs hot, guard against burnout and overstimulation.

Spirit-star notes: ${risks.length > 0 ? risks.join("; ") : "when representative stars overact, mind gossip, travel, and mood swings"}. Not fixed accidents—habits of double-checking words, contracts, and rest.`,
      pageEstimate: 3,
    }),
    section({
      id: "result-lucky-items",
      chapterId: "saju-result",
      chapterTitle: "Saju Result",
      kind: "domain",
      title: "Personal luck items",
      subtitle: STAGE3_EN,
      body: `For yongsin tone ${yongsinLabel}: colors ${lucky.color}, direction ${lucky.direction}, numbers ${lucky.numbers}, foods ${lucky.food}.

Small shifts in desk facing, accessories, or meals can steady rhythm. Kaewoon is habit, not luxury goods.`,
      pageEstimate: 2,
    }),
    section({
      id: "result-final-advice",
      chapterId: "saju-result",
      chapterTitle: "Saju Result",
      kind: "summary",
      title: "Final counsel",
      subtitle: STAGE3_EN,
      body: `${name}, fate is current, not a sealed ending. Know the flow, slow down, fill what is thin, keep your word—and luck becomes a guide. — Simwon`,
      pageEstimate: 1,
    }),
  ];
}
