import type { PetSajuMapping } from "./pet-trait-mapping";
import type { Locale, SajuBasicResponse } from "./types";

const HUMAN_HONORIFIC_RE =
  /집사(님)?|보호자(님)?|주인(님)?|butler|pet\s*parent|guardian/i;

const KO_HEADLINE_SUFFIX: Record<string, string> = {
  리더형: "당당한 리더",
  순둥형: "다정한 순둥이",
  태양형: "집안의 작은 태양",
  은은형: "은은한 애정파",
  든든형: "든든한 수호자",
  살림형: "우리집 낭만가",
  느급형: "마이페이스 우리집 낭만가",
  결단형: "단호한 결단가",
  예민형: "섬세한 미식가",
  자유형: "자유로운 탐험가",
  관찰형: "신중한 관찰자",
  대장묘형: "집안 대장",
  애교형: "애교 만렙 친구",
  인싸묘형: "사교적인 인싸",
  잔잔형: "잔잔한 곁누림러",
  안주형: "안주형 곁누림러",
  도도형: "도도한 매력쟁이",
  까칠형: "까칠하지만 다정한 타입",
  탐험형: "호기심 탐험가",
  은신형: "은신처 탐험가",
};

function cleanPetPhrase(text: string): string {
  return text
    .replace(/집사바라기/g, "우리집")
    .replace(/집사(님)?|보호자(님)?|주인(님)?|살림꾼/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasHumanHonorificInPetCopy(text: string): boolean {
  return HUMAN_HONORIFIC_RE.test(text);
}

export function sanitizePetHeadline(text: string): string {
  return cleanPetPhrase(text)
    .replace(/\s*[,·]\s*$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function buildPetHeadlineFromMapping(
  petName: string,
  mapping: PetSajuMapping,
  locale: Locale
): string {
  const { keyword, description } = mapping.dayMasterArchetype;
  if (locale === "ko") {
    const suffix = KO_HEADLINE_SUFFIX[keyword] ?? cleanPetPhrase(description);
    return `${petName} · ${suffix}`;
  }
  const suffix = cleanPetPhrase(description) || keyword;
  return `${petName} · ${suffix}`;
}

/** Normalize pet saju headline — never address the pet as butler/guardian. */
export function finalizePetHeadline(
  result: SajuBasicResponse,
  mapping: PetSajuMapping
): void {
  const sanitized = sanitizePetHeadline(result.headline);
  if (
    !sanitized ||
    hasHumanHonorificInPetCopy(sanitized) ||
    sanitized.length < 4
  ) {
    result.headline = buildPetHeadlineFromMapping(
      result.petName,
      mapping,
      result.locale
    );
    return;
  }
  result.headline = sanitized;
}
