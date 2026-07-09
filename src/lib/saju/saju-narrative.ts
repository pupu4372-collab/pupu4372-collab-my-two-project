import { escapeHtml } from "@/lib/saju/escape-html";
import type { AnimalGroup, PetSajuMapping } from "@/lib/saju/pet-trait-mapping";
import type { ElementKey, Locale, SajuBasicResponse, Species } from "@/lib/saju/types";

type ElementGloss = {
  fullKo: string;
  shortKo: string;
  essenceKo: string;
  fullEn: string;
  shortEn: string;
  essenceEn: string;
};

const ELEMENT_GLOSS: Record<ElementKey, ElementGloss> = {
  wood: {
    fullKo: "목(木)·나무의 기운",
    shortKo: "나무의 기운",
    essenceKo: "성장과 탐색을 밀어 주는 생동감 있는 힘이에요",
    fullEn: "Mok(木) · wood energy",
    shortEn: "wood energy",
    essenceEn: "a lively force that pushes growth and exploration",
  },
  fire: {
    fullKo: "화(火)·불의 기운",
    shortKo: "불의 기운",
    essenceKo: "밝은 표현과 활기를 이끄는 에너지예요",
    fullEn: "Hwa(火) · fire energy",
    shortEn: "fire energy",
    essenceEn: "energy that brings bright expression and lively spirit",
  },
  earth: {
    fullKo: "토(土)·땅의 기운",
    shortKo: "땅의 기운",
    essenceKo: "안정과 루틴을 좋아하는 든든한 힘이에요",
    fullEn: "To(土) · earth energy",
    shortEn: "earth energy",
    essenceEn: "a steady force that loves stability and routine",
  },
  metal: {
    fullKo: "금(金)·쇠의 기운",
    shortKo: "쇠의 기운",
    essenceKo: "선명한 기준과 섬세한 감각을 만드는 힘이에요",
    fullEn: "Geum(金) · metal energy",
    shortEn: "metal energy",
    essenceEn: "a force that shapes clear standards and refined senses",
  },
  water: {
    fullKo: "수(水)·물의 기운",
    shortKo: "물의 기운",
    essenceKo: "분위기를 읽고 유연하게 반응하는 깊은 힘이에요",
    fullEn: "Su(水) · water energy",
    shortEn: "water energy",
    essenceEn: "a deep force that reads the mood and responds flexibly",
  },
};

const WEAK_CARE_BOLD: Record<ElementKey, { ko: string; en: string }> = {
  wood: {
    ko: "가벼운 활동과 새로운 자극을 조금씩 넣어 주세요",
    en: "add gentle activity and small new experiences bit by bit",
  },
  fire: {
    ko: "짧고 즐거운 놀이 뒤에는 충분히 쉬게 해 주세요",
    en: "after short fun play, allow plenty of cooldown time",
  },
  earth: {
    ko: "하루 루틴을 일정하게 유지해 주세요",
    en: "keep daily routines steady and predictable",
  },
  metal: {
    ko: "조용한 쉼터와 자유로운 선택 시간을 보장해 주세요",
    en: "offer a quiet nook and freedom to choose rest",
  },
  water: {
    ko: "수분 섭취와 잔잔한 휴식 환경을 챙겨 주세요",
    en: "support hydration and a calm resting environment",
  },
};

type SceneGroup = "dog" | "cat" | "neutral";

type DailySceneCopy = {
  behaviorBold: { ko: string; en: string };
  example1: { ko: string; en: string };
  example2: { ko: string; en: string };
};

const DAILY_SCENE_COPY: Record<SceneGroup, Record<ElementKey, DailySceneCopy>> = {
  dog: {
    wood: {
      behaviorBold: {
        ko: "새로운 길과 냄새를 코로 탐색하려는 호기심이 강해요",
        en: "they love sniffing out new paths and scents",
      },
      example1: {
        ko: "산책 중 갑자기 방향을 바꿔 코를 땅에 박는 모습",
        en: "suddenly changing direction on walks to sniff the ground",
      },
      example2: {
        ko: "새 장난감이나 박스를 먼저 입에 넣어 보려는 습관",
        en: "trying a new toy or box with their mouth first",
      },
    },
    fire: {
      behaviorBold: {
        ko: "만나는 사람에게 애정 표현이 크고 에너지가 넘치는 편이에요",
        en: "they show big affection and overflow with energy",
      },
      example1: {
        ko: "문 앞에서 꼬리를 크게 흔들며 반기는 모습",
        en: "greeting you with an enthusiastic tail wag at the door",
      },
      example2: {
        ko: "산책만 나가면 걸음이 빨라지는 변화",
        en: "picking up the pace the moment a walk begins",
      },
    },
    earth: {
      behaviorBold: {
        ko: "익숙한 루틴을 따르고 편안한 자리를 선호해요",
        en: "they follow familiar routines and favorite resting spots",
      },
      example1: {
        ko: "정해진 산책 시간에 스스로 현관 쪽으로 가는 모습",
        en: "heading to the door around their usual walk time",
      },
      example2: {
        ko: "같은 담요나 쿠션 자리를 고집하는 습관",
        en: "insisting on the same blanket or cushion every day",
      },
    },
    metal: {
      behaviorBold: {
        ko: "낯선 자극을 경계하고 자기 공간을 분명히 하는 편이에요",
        en: "they guard their space and stay cautious around new stimuli",
      },
      example1: {
        ko: "처음 만난 사람에게는 거리를 두다 천천히 다가가는 모습",
        en: "keeping distance from strangers before warming up slowly",
      },
      example2: {
        ko: "정해진 장난감만 골라 가지고 놀려는 선택",
        en: "choosing the same trusted toys again and again",
      },
    },
    water: {
      behaviorBold: {
        ko: "주변 분위기를 먼저 읽고 신중하게 반응하는 편이에요",
        en: "they read the room and respond carefully",
      },
      example1: {
        ko: "손님이 와도 잠깐 거리를 두고 상황을 지켜보는 모습",
        en: "watching guests from a short distance before engaging",
      },
      example2: {
        ko: "조용한 구석에서 보호자 곁을 지키며 쉬는 시간",
        en: "resting quietly nearby while staying close to you",
      },
    },
  },
  cat: {
    wood: {
      behaviorBold: {
        ko: "높은 곳과 새 공간을 먼저 점검하려는 탐험성이 있어요",
        en: "they like checking high places and new corners first",
      },
      example1: {
        ko: "캣타워 최상단을 차지하고 내려다보는 모습",
        en: "claiming the top of a cat tree to look down",
      },
      example2: {
        ko: "새 상자나 가방을 먼저 파고드는 행동",
        en: "diving into a fresh box or bag before anyone else",
      },
    },
    fire: {
      behaviorBold: {
        ko: "애교와 도도함이 공존하고 기분에 따라 반응이 달라져요",
        en: "sweet and aloof sides show up depending on mood",
      },
      example1: {
        ko: "기분 좋을 때는 무릎에 올라와 골골송을 부르는 모습",
        en: "climbing onto your lap and purring when the mood is right",
      },
      example2: {
        ko: "싫은 자극엔 바로 자리를 피하는 빠른 전환",
        en: "quickly leaving when something feels unwelcome",
      },
    },
    earth: {
      behaviorBold: {
        ko: "느긋하게 같은 자리에서 쉬며 안정을 좋아해요",
        en: "they nap in the same cozy spot and prefer calm",
      },
      example1: {
        ko: "햇빛 드는 아늑한 자리를 오래 차지하는 모습",
        en: "holding a sunny nap spot for a long stretch",
      },
      example2: {
        ko: "급한 변화보다 익숙한 식사·휴식 리듬을 따르는 습관",
        en: "sticking to familiar meal and rest rhythms",
      },
    },
    metal: {
      behaviorBold: {
        ko: "선을 긋고 관찰한 뒤에야 행동하는 도도한 면이 있어요",
        en: "they draw clear lines and act only after observing",
      },
      example1: {
        ko: "손길을 먼저 거두면 그때 다가오는 신중한 태도",
        en: "approaching only after you pull your hand back first",
      },
      example2: {
        ko: "낯선 소리에 귀만 돌리고 잠시 멈추는 반응",
        en: "freezing for a moment when an unfamiliar sound appears",
      },
    },
    water: {
      behaviorBold: {
        ko: "낯선 상황에 조심스럽지만 마음 열면 깊이 의지해요",
        en: "they stay cautious at first but attach deeply once trust grows",
      },
      example1: {
        ko: "새 가구가 들어오면 멀리서 냄새부터 확인하는 모습",
        en: "sniffing new furniture from a safe distance",
      },
      example2: {
        ko: "신뢰한 사람 옆에서 천천히 몸을 기대는 시간",
        en: "leaning in slowly beside someone they trust",
      },
    },
  },
  neutral: {
    wood: {
      behaviorBold: {
        ko: "새 환경과 자극에 적극적으로 반응하는 편이에요",
        en: "they respond actively to new environments and cues",
      },
      example1: {
        ko: "새로 바뀐 공간 구석을 먼저 둘러보는 모습",
        en: "exploring a changed corner of their space first",
      },
      example2: {
        ko: "낯선 소리나 냄새에 귀·코를 기울이는 태도",
        en: "tilting ears or nose toward unfamiliar sounds or scents",
      },
    },
    fire: {
      behaviorBold: {
        ko: "활동량과 반응 속도가 기분과 환경에 따라 달라져요",
        en: "activity level shifts with mood and surroundings",
      },
      example1: {
        ko: "편안할 때 활발해지는 변화",
        en: "becoming more active when they feel comfortable",
      },
      example2: {
        ko: "더운 환경에선 움직임을 줄이는 조절",
        en: "slowing down when the environment feels too warm",
      },
    },
    earth: {
      behaviorBold: {
        ko: "익숙한 패턴과 편안한 환경을 선호해요",
        en: "they prefer familiar patterns and a steady environment",
      },
      example1: {
        ko: "같은 시간에 식사·휴식을 찾는 습관",
        en: "returning to meals and rest at similar times",
      },
      example2: {
        ko: "자주 쓰는 자리를 고수하는 모습",
        en: "keeping to a favorite resting place",
      },
    },
    metal: {
      behaviorBold: {
        ko: "예민한 자극엔 거리를 두고 관찰 후 움직여요",
        en: "they keep distance from sharp stimuli and observe first",
      },
      example1: {
        ko: "큰 소리에 잠시 멈추는 반응",
        en: "pausing briefly after a loud sound",
      },
      example2: {
        ko: "익숙한 사람에게만 편안해지는 차이",
        en: "relaxing only around familiar people",
      },
    },
    water: {
      behaviorBold: {
        ko: "주변 변화에 신중하고 쉬는 시간을 중요히 여겨요",
        en: "they stay cautious about change and value quiet rest",
      },
      example1: {
        ko: "조용한 구석에서 천천히 컨디션을 회복하는 모습",
        en: "recovering slowly in a quiet corner",
      },
      example2: {
        ko: "낯선 방문에 숨거나 거리를 두는 습관",
        en: "hiding or keeping distance when visitors arrive",
      },
    },
  },
};

function resolveSceneGroup(animalGroup: AnimalGroup, species: Species): SceneGroup {
  if (species === "dog" || animalGroup === "dog") return "dog";
  if (species === "cat" || animalGroup === "cat") return "cat";
  return "neutral";
}

function petNameSuffix(name: string, locale: Locale): string {
  if (locale !== "ko") return name;
  const last = name.charCodeAt(name.length - 1);
  const hasJong = (last - 0xac00) % 28 !== 0;
  return `${name}${hasJong ? "은" : "는"}`;
}

export function buildSajuNarrative(result: SajuBasicResponse, mapping: PetSajuMapping): string {
  const locale = result.locale;
  const dominant = mapping.dominantElement as ElementKey;
  const weak = mapping.weakElement as ElementKey;
  const dominantGloss = ELEMENT_GLOSS[dominant];
  const weakGloss = ELEMENT_GLOSS[weak];
  const sceneGroup = resolveSceneGroup(mapping.animalGroup, result.species);
  const scene = DAILY_SCENE_COPY[sceneGroup][dominant];
  const careBold = WEAK_CARE_BOLD[weak];
  const safeName = escapeHtml(result.petName);
  const dayMasterLine = mapping.dayMasterArchetype.description;

  if (locale === "ko") {
    const p1 = [
      `${petNameSuffix(safeName, locale)} <strong>${dominantGloss.fullKo}</strong>을 강하게 타고난 아이예요.`,
      `${dominantGloss.shortKo}은 ${dominantGloss.essenceKo}.`,
      `${dayMasterLine}.`,
    ].join(" ");

    const p2 = [
      "이 기운을 가진 아이들은",
      `<strong>${scene.behaviorBold.ko}</strong>.`,
      `예를 들어 ${scene.example1.ko},`,
      `${scene.example2.ko}도 ${dominantGloss.shortKo} 때문이에요.`,
    ].join(" ");

    const p3 = [
      `반면 ${weakGloss.fullKo}은 옅은 편이라 <strong>${careBold.ko}</strong>.`,
      `이런 기운의 조합이 ${safeName}의 성격 곳곳에 드러납니다.`,
    ].join(" ");

    return [p1, p2, p3].join("\n\n");
  }

  const p1 = [
    `${safeName} carries strong <strong>${dominantGloss.fullEn}</strong>.`,
    `${dominantGloss.shortEn} is ${dominantGloss.essenceEn}.`,
    `${dayMasterLine}.`,
  ].join(" ");

  const p2 = [
    "Pets with this energy",
    `<strong>${scene.behaviorBold.en}</strong>.`,
    `For example, ${scene.example1.en}, and ${scene.example2.en} often trace back to ${dominantGloss.shortEn}.`,
  ].join(" ");

  const p3 = [
    `Meanwhile ${weakGloss.fullEn} runs lighter, so <strong>${careBold.en}</strong>.`,
    `That blend shows up throughout ${safeName}'s personality.`,
  ].join(" ");

  return [p1, p2, p3].join("\n\n");
}
