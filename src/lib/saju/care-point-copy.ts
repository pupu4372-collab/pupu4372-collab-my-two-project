import type { PetSajuMapping } from "@/lib/saju/pet-trait-mapping";
import type { Locale } from "@/lib/saju/types";

const CARE_POINT_BY_FOCUS: Record<string, { ko: string; en: string }> = {
  "관절·인대": {
    ko: "관절과 인대 건강을 위해 무리한 점프·급정거를 줄이고, 성장기에는 영양 균형을 챙겨 주세요.",
    en: "Protect joints and ligaments with moderate play and balanced nutrition during growth.",
  },
  "성장기 영양 관리": {
    ko: "성장기에는 단백질과 칼슘이 골고루 들어간 식단으로 체력 기반을 다져 주세요.",
    en: "During growth, steady protein and minerals help build a strong foundation.",
  },
  "심장·순환기": {
    ko: "심장·순환기 건강을 위해 더운 날엔 그늘 휴식을, 추운 날엔 실내 활동 위주로 조절해 주세요.",
    en: "Support heart and circulation with shade breaks in heat and gentler indoor play in cold weather.",
  },
  "과흥분 시 체온 관리": {
    ko: "신나게 놀았다면 물과 휴식으로 체온을 천천히 내려 주세요.",
    en: "After high-energy play, offer water and quiet rest to cool down safely.",
  },
  "소화기": {
    ko: "소화기 부담을 줄이려면 한 번에 많이 주기보다 소량·규칙적인 급여가 좋아요.",
    en: "Smaller, regular meals are easier on digestion than one large serving.",
  },
  "체중 관리": {
    ko: "적정 체중을 유지하려면 간식량과 산책·놀이 시간을 함께 조절해 주세요.",
    en: "Balance treat portions with daily walks and play to keep a healthy weight.",
  },
  "호흡기": {
    ko: "호흡기를 위해 먼지·향이 강한 환경은 피하고, 실내 공기를 자주 환기해 주세요.",
    en: "Keep air fresh and avoid dusty or strongly scented spaces for easier breathing.",
  },
  "피모(피부·털) 건강": {
    ko: "피부·털 건강을 위해 정기적인 빗질과 적절한 목욕 주기를 지켜 주세요.",
    en: "Regular brushing and a sensible bath routine help keep skin and coat healthy.",
  },
  "신장·비뇨기": {
    ko: "신장·비뇨기 건강을 위해 물그릇을 깨끗하게 유지하고 충분한 수분 섭취를 도와주세요.",
    en: "Fresh water and a clean bowl support kidney and urinary health.",
  },
  "수분 섭취": {
    ko: "수분 섭취가 잘 되도록 물그릇 위치와 교체 주기를 편하게 맞춰 주세요.",
    en: "Make water easy to reach and refresh the bowl often to encourage hydration.",
  },
  관절: {
    ko: "관절 부담을 줄이려면 높은 곳 점프 후 착지 공간을 부드럽게, 무리한 운동은 피해 주세요.",
    en: "Soft landing spots and moderate activity help protect joints.",
  },
  "근육 발달": {
    ko: "근육 발달을 위해 짧고 규칙적인 놀이와 점프 높이를 단계적으로 맞춰 주세요.",
    en: "Short, regular play with gradual climbing heights supports healthy muscles.",
  },
  심장: {
    ko: "심장 건강을 위해 과도한 자극보다 안정적인 루틴과 충분한 휴식을 병행해 주세요.",
    en: "Pair steady routines with enough rest rather than constant overstimulation.",
  },
  "스트레스성 질환": {
    ko: "스트레스를 줄이려면 조용한 휴식 공간과 예측 가능한 하루 루틴을 유지해 주세요.",
    en: "A quiet rest zone and predictable daily rhythm help lower stress.",
  },
  비만: {
    ko: "체중 관리를 위해 간식은 소량으로, 활동량은 조금씩 늘려 주세요.",
    en: "Use small treats and gradually increase activity for healthy weight care.",
  },
  "치아·구강": {
    ko: "치아·구강 건강을 위해 구강 간식과 정기적인 구강 점검을 습관으로 만들어 주세요.",
    en: "Dental-friendly snacks and regular mouth checks support oral health.",
  },
  "신장(고양이 취약 부위)": {
    ko: "고양이는 신장이 취약한 편이에요. 수분 섭취를 챙겨 주세요.",
    en: "Cats can be prone to kidney strain — help them stay well hydrated.",
  },
  "수분 섭취 관리": {
    ko: "수분 섭취를 늘리려면 물그릇·급수기 위치를 바꿔 보거나 습식 간식을 활용해 보세요.",
    en: "Try moving the water bowl or adding wet snacks to boost hydration.",
  },
  "탈피 주기 관리": {
    ko: "탈피기에는 습도와 은신처를 안정적으로 유지해 스트레스를 줄여 주세요.",
    en: "Stable humidity and hideouts ease shedding-season stress.",
  },
  "서식 공간 크기": {
    ko: "활동 반경이 넉넉한 서식 공간이 컨디션 유지에 도움이 됩니다.",
    en: "A roomy enclosure supports steady activity and comfort.",
  },
  "온도·조명(바스킹) 관리": {
    ko: "온도 구역과 바스킹 조명을 종에 맞게 유지해 체온 리듬을 지켜 주세요.",
    en: "Keep temperature zones and basking light suited to your pet’s species.",
  },
  "소화 및 배변 주기": {
    ko: "급여 시간과 온도를 일정하게 유지하면 소화·배변 리듬이 안정됩니다.",
    en: "Consistent feeding times and temperature help regular digestion.",
  },
  "피부·탈피 상태": {
    ko: "피부·탈피 상태를 보려면 습도와 은신처를 꾸준히 점검해 주세요.",
    en: "Monitor humidity and hides to keep skin and shedding healthy.",
  },
  "습도 관리": {
    ko: "적정 습도를 유지하고 은신처를 마련해 편안하게 쉴 수 있게 해 주세요.",
    en: "Maintain suitable humidity and provide hides for comfortable rest.",
  },
  "수분 공급": {
    ko: "수분 공급을 위해 물그릇·분무 등 종에 맞는 방법을 꾸준히 챙겨 주세요.",
    en: "Offer species-appropriate hydration — fresh water, misting, or soaks as needed.",
  },
};

const HEALTH_FOCUS_TRAIT_KEYS = new Set(Object.keys(CARE_POINT_BY_FOCUS));

/** Stored trait tag that came from healthFocus (legacy snapshots). */
export function isHealthFocusTrait(trait: string): boolean {
  const normalized = trait.trim();
  if (!normalized) return false;
  if (HEALTH_FOCUS_TRAIT_KEYS.has(normalized)) return true;

  return (
    normalized.includes("신장") ||
    normalized.includes("비만") ||
    normalized.includes("소화") ||
    normalized.includes("호흡") ||
    normalized.includes("관절") ||
    normalized.includes("치아") ||
    normalized.includes("탈피") ||
    normalized.includes("습도") ||
    normalized.includes("체중") ||
    normalized.includes("수분") ||
    normalized.includes("심장") ||
    normalized.includes("비뇨")
  );
}

export function buildCarePointText(mapping: PetSajuMapping, locale: Locale): string | null {
  const focus = mapping.weakTraits.healthFocus.find((item) => item.trim().length > 0)?.trim();
  if (!focus) return null;

  const mapped = CARE_POINT_BY_FOCUS[focus];
  if (mapped) return locale === "ko" ? mapped.ko : mapped.en;

  if (locale === "ko") {
    return `${focus} 쪽을 평소에 조금 더 챙겨 주면 컨디션이 안정되는 편이에요.`;
  }
  return `A little extra care around ${focus.toLowerCase()} helps keep daily comfort steady.`;
}
