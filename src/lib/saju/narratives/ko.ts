import { ELEMENT_META } from "../elements";
import type { ElementKey, Species } from "../types";

const SPECIES_LABEL: Record<Species, string> = {
  dog: "강아지",
  cat: "고양이",
  reptile: "렙타일",
  other: "그외친구",
};

function koElementLabel(hangul: string, hanja: string): string {
  return `${hangul}(${hanja})`;
}

const TEMPLATES: Record<
  ElementKey,
  {
    headline: (name: string, elementLabel: string) => string;
    story: (name: string, elementLabel: string, species: string) => string;
    traits: string[];
  }
> = {
  wood: {
    headline: (name, elementLabel) => `${name} · ${elementLabel} 숲길을 여는 성장형 에너지`,
    story: (name, elementLabel, species) =>
      [
        `${name}는 ${elementLabel} 기운이 앞장서는 ${species}예요. 오래된 만세력으로 보면 木은 봄의 문을 여는 기운이라, ${name} 안에는 “일단 맡아보고, 가보고, 친해져 보자”는 작은 탐험대장이 살고 있어요.`,
        `처음 보는 장난감 앞에서는 선비처럼 잠깐 품평하다가도, 마음에 들면 순식간에 대나무 숲의 바람처럼 달려듭니다. 새로운 사람에게도 경계보다 호기심이 먼저 고개를 들 가능성이 커요. 다만 너무 많은 자극을 한 번에 주면 가지가 이리저리 흔들리듯 집중이 흩어질 수 있어요.`,
        `집사님이 해줄 비법은 간단합니다. 산책이나 놀이에 “오늘의 작은 발견”을 하나씩 넣어주세요. 새로운 냄새, 다른 길, 숨겨둔 간식 하나. 그러면 ${name}의 충성심은 봄비 맞은 죽순처럼 쑥쑥 자라고, 집 안 분위기는 은근히 싱그러워집니다.`,
      ].join("\n\n"),
    traits: ["호기심 선비", "숲길 탐험가", "친화력 새싹"],
  },
  fire: {
    headline: (name, elementLabel) => `${name} · ${elementLabel} 작은 태양 에너자이저`,
    story: (name, elementLabel, species) =>
      [
        `${name}는 ${elementLabel} 기운이 반짝이는 ${species}입니다. 火는 등불이자 축제의 기운이라, ${name}는 조용히 있어도 존재감이 슬쩍 새어 나와요. 방 안 어딘가에서 이미 무대 조명이 켜진 느낌이랄까요.`,
        `기분이 좋을 때는 애정 표현이 크고 선명합니다. 눈빛, 발걸음, 꼬리 혹은 골골송까지 “나 지금 행복함”을 꽤 성대하게 발표할 수 있어요. 대신 불기운은 금방 뜨거워지기 때문에, 신나는 놀이 뒤에는 식히는 시간도 필요합니다. 안 그러면 궁중 잔치가 갑자기 야시장 댄스 배틀이 될 수 있어요.`,
        `집사님에게 권하는 운영법은 “짧고 즐겁게, 그리고 멋지게 쉬기”입니다. 에너지를 태울 놀이를 주되, 끝에는 칭찬과 휴식을 세트로 묶어주세요. 그러면 ${name}의 불꽃은 산만한 불씨가 아니라 집안을 밝혀주는 복 많은 등불이 됩니다.`,
      ].join("\n\n"),
    traits: ["작은 태양", "애정 폭죽", "무대 체질"],
  },
  earth: {
    headline: (name, elementLabel) => `${name} · ${elementLabel} 집안을 지키는 포근 수호자`,
    story: (name, elementLabel, species) =>
      [
        `${name}는 ${elementLabel} 기운이 든든한 ${species}예요. 土는 가운데를 잡아주는 산과 들판의 기운이라, ${name}에게는 “내 사람, 내 자리, 내 밥그릇”을 소중히 여기는 안정감이 있습니다.`,
        `겉으로는 느긋해 보여도 속으로는 집안의 흐름을 꽤 성실하게 기록하고 있을 수 있어요. 누가 언제 들어오는지, 간식 통은 어느 서랍에 있는지, 집사님 기분이 평소보다 7도쯤 낮은지까지요. 가끔 소파 수비대처럼 누워 있어도 사실은 궁궐 수문장 근무 중일지 모릅니다.`,
        `이 타입에게는 예측 가능한 루틴이 복을 부릅니다. 밥 시간, 산책/놀이 시간, 쉬는 자리를 안정적으로 잡아주면 ${name}는 마음을 넓게 펴요. 그리고 간식은 약속의 인장처럼 쓰세요. 너무 남발하면 수문장이 세금 인상(?)을 요구할 수 있습니다.`,
      ].join("\n\n"),
    traits: ["포근 수문장", "루틴 장인", "간식 외교관"],
  },
  metal: {
    headline: (name, elementLabel) => `${name} · ${elementLabel} 달빛 같은 시크 관찰자`,
    story: (name, elementLabel, species) =>
      [
        `${name}는 ${elementLabel} 기운이 맑게 선 ${species}입니다. 金은 가을 달빛처럼 선명하고 정제된 기운이라, ${name}는 아무거나 대충 넘기지 않는 타입이에요. 새 택배, 새 신발, 새 표정까지 조용히 감정합니다.`,
        `기준이 높아 보일 수 있지만, 그건 까다롭다기보다 감각이 섬세한 쪽에 가깝습니다. 마음에 들지 않는 담요에는 “궁중 품질 심사 탈락” 판정을 내릴 수도 있고, 마음에 든 사람에게는 아주 조용하지만 깊은 애정을 보여줘요. 겉은 시크, 속은 프리미엄 한정판입니다.`,
        `집사님은 ${name}에게 선택권을 조금 주세요. 쉴 자리, 장난감, 다가오는 타이밍을 스스로 고르게 하면 신뢰가 쌓입니다. 억지로 끌어안기보다 품격 있게 초대하는 편이 좋아요. 그러면 어느 날 먼저 다가와 “오늘은 특별히 허락한다”는 표정으로 곁을 내줄 거예요.`,
      ].join("\n\n"),
    traits: ["달빛 감별사", "시크 귀족", "선택권 중시"],
  },
  water: {
    headline: (name, elementLabel) => `${name} · ${elementLabel} 달그림자 직감형 소울`,
    story: (name, elementLabel, species) =>
      [
        `${name}는 ${elementLabel} 기운이 깊은 ${species}예요. 水는 밤하늘과 물결의 기운이라, ${name}는 말보다 분위기를 먼저 읽는 편입니다. 집사님이 한숨을 쉬면 이미 알고 있었다는 듯 슬쩍 가까이 오는 재주가 있어요.`,
        `이 기운은 부드럽지만 만만하지 않습니다. 낮잠을 자는 것처럼 보여도 세상의 파동을 수신 중일 수 있고, 무릎에 올라오는 타이밍은 거의 점성술 수준으로 정확합니다. “왜 지금 와?” 싶을 때가 사실 가장 필요한 순간일지도 몰라요.`,
        `다만 水의 아이들은 소리와 분위기에 민감할 수 있으니, 휴식처를 조용하고 안전하게 만들어주세요. 잔잔한 루틴, 부드러운 말투, 물 흐르듯 이어지는 놀이가 잘 맞습니다. 그러면 ${name}는 집안의 작은 호수처럼 마음을 맑게 해주는 존재가 됩니다.`,
      ].join("\n\n"),
    traits: ["분위기 예언자", "달빛 감성", "낮잠 도사"],
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
  const elementLabel = koElementLabel(meta.hangul, meta.hanja);

  return {
    headline: tpl.headline(petName, elementLabel),
    story: tpl.story(petName, elementLabel, speciesLabel),
    traits: tpl.traits,
  };
}
