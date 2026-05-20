import { ELEMENT_META } from "../elements";
import type { ElementKey, Species } from "../types";

const SPECIES_LABEL: Record<Species, string> = {
  dog: "강아지",
  cat: "고양이",
};

const TEMPLATES: Record<
  ElementKey,
  {
    headline: (name: string, romanized: string, hangul: string, hanja: string) => string;
    story: (name: string, romanized: string, hangul: string, species: string) => string;
    traits: string[];
  }
> = {
  wood: {
    headline: (name, romanized, hangul, hanja) =>
      `${name} · ${romanized}(${hangul}, ${hanja}) 성장형 에너지`,
    story: (name, romanized, hangul, species) =>
      `${name}는 ${romanized}(${hangul}) 기운의 ${species}예요. 봄바람 같은 호기심, 첫 만남에 꼬리·꼬리가 먼저 친해지는 타입. 충성심은 비 오는 날 대나무처럼 쑥쑥 자라요.`,
    traits: ["모험가", "친화력 갑", "눈치 빠름"],
  },
  fire: {
    headline: (name, romanized, hangul, hanja) =>
      `${name} · ${romanized}(${hangul}, ${hanja}) 에너자이저`,
    story: (name, romanized, hangul, species) =>
      `${name}는 ${romanized}(${hangul}) 기운이 센 ${species}! 산책·놀이가 곧 행복이고, 조용한 날은 뭔가 일이 날 예감해요. 하트는 크고, 행복 표현은 더 크게.`,
    traits: ["에너지 넘침", "주인공 기질", "애정 표현 왕"],
  },
  earth: {
    headline: (name, romanized, hangul, hanja) =>
      `${name} · ${romanized}(${hangul}, ${hanja}) 포근 수호자`,
    story: (name, romanized, hangul, species) =>
      `${name}는 ${romanized}(${hangul}) 기운의 든든한 ${species}. 소파 수비대지만, 필요할 땐 누구보다 먼저 달려와요. 루틴과 간식을 사랑하고, 집을 ‘우리 집’으로 만드는 재주가 있어요.`,
    traits: ["차분함", "인내심", "간식 러버"],
  },
  metal: {
    headline: (name, romanized, hangul, hanja) =>
      `${name} · ${romanized}(${hangul}, ${hanja}) 시크 관찰자`,
    story: (name, romanized, hangul, species) =>
      `${name}는 ${romanized}(${hangul}) 기운의 세련된 ${species}. 새 신발, 새 택배, 새 감정까지 다 읽어요. 기준이 높지만, 한번 마음 열면 그 애정은 진짜 프리미엄.`,
    traits: ["관찰력", "독립적", "시크함"],
  },
  water: {
    headline: (name, romanized, hangul, hanja) =>
      `${name} · ${romanized}(${hangul}, ${hanja}) 직감형 소울`,
    story: (name, romanized, hangul, species) =>
      `${name}는 ${romanized}(${hangul}) 기운의 감성 ${species}. 눈빛은 부드럽고, 낮잠 실력은 프로. 분위기를 먼저 읽고, 무릎 위에 앉는 타이밍은 운명처럼 정확해요.`,
    traits: ["공감 능력", "몽글몽글", "낮잠 마스터"],
  },
};

export function narrativeKo(
  element: ElementKey,
  species: Species,
  petName: string
) {
  const meta = ELEMENT_META[element];
  const tpl = TEMPLATES[element];
  const speciesLabel = SPECIES_LABEL[species];

  return {
    headline: tpl.headline(petName, meta.romanized, meta.hangul, meta.hanja),
    story: tpl.story(petName, meta.romanized, meta.hangul, speciesLabel),
    traits: tpl.traits,
  };
}
