import { withJosa } from "@/lib/i18n/korean-josa";
import { dominantElementLabel } from "../pet-lucky-scores";
import type { ElementKey, Gender, Locale, Species } from "../types";
import type { ElementRelation } from "./elements-cycle";

const BOND_LABEL: Record<
  Locale,
  Array<{ min: number; label: string; emoji: string }>
> = {
  ko: [
    { min: 90, label: "천생연분", emoji: "💫" },
    { min: 82, label: "환상의 짝", emoji: "💖" },
    { min: 74, label: "따뜻한 동료", emoji: "🤝" },
    { min: 64, label: "성장형 인연", emoji: "🌱" },
    { min: 0, label: "배려가 필요한 인연", emoji: "🐾" },
  ],
  en: [
    { min: 90, label: "Soul bond", emoji: "💫" },
    { min: 82, label: "Dream team", emoji: "💖" },
    { min: 74, label: "Warm partners", emoji: "🤝" },
    { min: 64, label: "Growth bond", emoji: "🌱" },
    { min: 0, label: "Needs extra care", emoji: "🐾" },
  ],
};

const RELATION_COPY: Record<
  ElementRelation,
  Record<
    Locale,
    {
      title: (pet: string, owner: string) => string;
      story: (
        petName: string,
        ownerName: string,
        petEl: string,
        ownerEl: string,
        species: string
      ) => string;
      tips: string[];
    }
  >
> = {
  same: {
    ko: {
      title: (pet, owner) => `${pet} × ${owner} — 같은 오행, 같은 파장`,
      story: (pet, owner, pEl, oEl, sp) =>
        `${withJosa(pet, "과/와")} ${owner} 집사님은 ${pEl} 기운으로 맞춰진 팀이에요. ${sp} ${pet}의 리듬을 집사님이 직관적으로 이해하고, 말 없이도 쿠션 자리와 휴식 타이밍을 맞춰요.`,
      tips: [
        "루틴을 함께 지키면 유대가 더 깊어져요",
        "같은 기운은 과열할 수 있으니 가끔은 새 산책로로 리프레시",
        "둘 다 흥분하기 쉬운 날엔 조용한 공간에서 10분 휴식",
        "좋아하는 간식·장난감을 고정해 주면 안정감이 커져요",
      ],
    },
    en: {
      title: (pet, owner) => `${pet} × ${owner} — same element wavelength`,
      story: (pet, owner, pEl, oEl, sp) =>
        `${pet} and ${owner} share ${pEl} energy. This ${sp} and butler sync cushions and moods without many words.`,
      tips: [
        "Shared routines deepen the bond",
        "Same energy can overheat—try a fresh walk route sometimes",
        "On excited days, rest together in a quiet spot for 10 minutes",
        "Fixed favorite treats and toys build a sense of safety",
      ],
    },
  },
  owner_nourishes_pet: {
    ko: {
      title: (pet, owner) => `${pet} × ${owner} — 집사가 ${withJosa(pet, "을/를")} 키우는 상생`,
      story: (pet, owner, pEl, oEl, sp) =>
        `집사님의 ${oEl} 기운이 ${sp} ${pet}의 ${pEl}로 스며들어요. 밥·산책·안심이 ${pet}에게 가장 큰 사랑 언어.`,
      tips: [
        "규칙적인 케어가 궁합을 극대화해요",
        "칭찬과 간식 타이밍을 일정하게",
        "밥·산책·수면 시간을 고정하면 신뢰가 빨리 쌓여요",
        "집사님의 차분한 목소리가 반려동물에게 가장 큰 안심 신호예요",
      ],
    },
    en: {
      title: (pet, owner) => `${pet} × ${owner} — butler nourishes pet`,
      story: (pet, owner, pEl, oEl, sp) =>
        `${owner}'s ${oEl} energy feeds ${pet}'s ${pEl}. Meals, walks, and calm presence are love languages.`,
      tips: [
        "Steady care maximizes compatibility",
        "Keep praise and treat timing consistent",
        "Fixed meal, walk, and sleep times build trust quickly",
        "A calm voice from the butler is the strongest safety signal",
      ],
    },
  },
  pet_nourishes_owner: {
    ko: {
      title: (pet, owner) => `${pet} × ${owner} — ${withJosa(pet, "이/가")} 집사를 채우는 상생`,
      story: (pet, owner, pEl, oEl, sp) =>
        `${sp} ${pet}의 ${pEl} 기운이 집사님 ${oEl} 마음을 환하게. 퇴근 후 ${pet} 한 마리가 하루를 치유해요.`,
      tips: [
        "함께 쉬는 시간을 의도적으로 만드세요",
        "눈 맞춤 + 천천히 쓰다듬기",
        "퇴근 후 5분만 앉아 쉬며 인사하는 루틴을 만들어 보세요",
        "반려동물 옆에 앉아 있는 것만으로도 집사님 마음이 회복돼요",
      ],
    },
    en: {
      title: (pet, owner) => `${pet} × ${owner} — pet heals the butler`,
      story: (pet, owner, pEl, oEl, sp) =>
        `${pet}'s ${pEl} brightens ${owner}'s ${oEl} heart. One greeting after work resets the day.`,
      tips: [
        "Schedule intentional rest together",
        "Eye contact + slow petting",
        "Take 5 minutes to sit and greet each other after work",
        "Simply sitting beside your pet can restore your mood",
      ],
    },
  },
  owner_controls_pet: {
    ko: {
      title: (pet, owner) => `${pet} × ${owner} — 결이 다른 두 기운`,
      story: (pet, owner, pEl, oEl, sp) =>
        `집사님 ${oEl}와 ${pet} ${pEl}는 극(克) 관계. ${sp}는 자유롭고 집사님은 기준을 세우는 편—서로 맞추면 훈련·신뢰가 단단해져요.`,
      tips: [
        "짧은 훈련 세션 + 즉시 보상",
        "NO 대신 다른 행동으로 유도하기",
        "규칙은 2~3개만 고정하고 나머지는 유연하게",
        "집사님이 먼저 침착한 톤으로 말하면 반려동물도 빠르게 따라와요",
      ],
    },
    en: {
      title: (pet, owner) => `${pet} × ${owner} — different rhythms`,
      story: (pet, owner, pEl, oEl, sp) =>
        `${owner}'s ${oEl} and ${pet}'s ${pEl} form a controlling pair. Structure plus patience builds strong trust.`,
      tips: [
        "Short training + instant reward",
        "Redirect instead of only saying no",
        "Keep only 2–3 fixed rules and stay flexible on the rest",
        "When the butler speaks calmly first, the pet follows faster",
      ],
    },
  },
  pet_controls_owner: {
    ko: {
      title: (pet, owner) => `${pet} × ${owner} — ${withJosa(pet, "이/가")} 기승하는 귀여운 극`,
      story: (pet, owner, pEl, oEl, sp) =>
        `${pet} ${pEl} 기운이 집사님 ${oEl}을 살짝 압도. ${withJosa(sp, "이/가")} 집안 분위기를 이끌지만, 경계만 부드럽게 세우면 최고의 파트너.`,
      tips: [
        "일관된 규칙 2~3개만 유지",
        "간식은 칭찬 후에만",
        "놀이 시간과 휴식 시간을 번갈아 정해 주세요",
        "귀여움에 양보하기 전에 ‘지금은 쉬는 시간’을 한 번 알려 주세요",
      ],
    },
    en: {
      title: (pet, owner) => `${pet} × ${owner} — pet leads the vibe`,
      story: (pet, owner, pEl, oEl, sp) =>
        `${pet}'s ${pEl} gently leads ${owner}'s ${oEl}. Set soft boundaries and this pair shines.`,
      tips: [
        "Keep 2–3 consistent house rules",
        "Treats after praise, not before",
        "Alternate planned play time and rest time",
        "Say ‘rest time now’ once before giving in to cuteness",
      ],
    },
  },
  neutral: {
    ko: {
      title: (pet, owner) => `${pet} × ${owner} — 조화로운 중립`,
      story: (pet, owner, pEl, oEl, sp) =>
        `${pEl}와 ${oEl}는 직접 생극하지 않아요. ${sp}와 집사님은 서로 다른 매력을 가져오고, 존중하면 오래가요.`,
      tips: [
        "서로의 템포를 관찰하는 첫 2주",
        "새 놀이를 함께 찾아보기",
        "좋아하는 거리감(안아주기·옆에 두기)을 기록해 두세요",
        "서로 다른 매력을 인정하면 오래 가는 조화형 궁합이 돼요",
      ],
    },
    en: {
      title: (pet, owner) => `${pet} × ${owner} — balanced neutral`,
      story: (pet, owner, pEl, oEl, sp) =>
        `${pEl} and ${oEl} don't clash directly. Different charms—respect pacing and it lasts.`,
      tips: [
        "Observe each other's tempo for two weeks",
        "Discover a new game together",
        "Note preferred distance (holding vs. sitting nearby)",
        "Respecting different charms makes this bond last",
      ],
    },
  },
};

function fmtEl(el: ElementKey, locale: Locale): string {
  return dominantElementLabel(el, locale);
}

function genderLabel(gender: Gender, target: "pet" | "owner", locale: Locale): string {
  if (locale === "en") return gender === "male" ? "male" : "female";
  if (target === "pet") return gender === "male" ? "수" : "암";
  return gender === "male" ? "남성" : "여성";
}

function relationDetail(relation: ElementRelation, locale: Locale): string {
  const copy: Record<ElementRelation, Record<Locale, string>> = {
    same: {
      ko: "같은 오행은 서로의 반응 속도와 편안해지는 포인트가 닮아 있어요. 마음이 잘 맞는 만큼 흥분이나 고집도 같이 커질 수 있으니, 즐거운 루틴 뒤에는 짧은 휴식 시간을 넣어주세요.",
      en: "The same element means similar comfort points and reaction rhythm. The bond can feel easy, but excitement or stubbornness can rise together, so add a short rest after happy routines.",
    },
    owner_nourishes_pet: {
      ko: "집사의 기운이 반려동물의 기운을 받쳐주는 상생 흐름입니다. 밥, 산책, 안정적인 목소리처럼 꾸준한 케어가 반려동물에게 큰 신뢰 신호로 전달돼요.",
      en: "This is a supportive flow where the parent's energy nourishes the pet. Meals, walks, and a steady voice become strong signals of safety.",
    },
    pet_nourishes_owner: {
      ko: "반려동물의 기운이 집사의 마음을 채워주는 흐름입니다. 지친 날일수록 눈맞춤, 옆에 누워 있기, 천천히 쓰다듬는 시간이 집사에게 큰 회복감으로 돌아옵니다.",
      en: "This flow lets the pet restore the parent's heart. On tiring days, eye contact, resting side by side, and slow petting can feel deeply healing.",
    },
    owner_controls_pet: {
      ko: "집사의 기준과 반려동물의 자유로운 리듬이 부딪힐 수 있는 관계예요. 강하게 누르기보다 짧은 규칙, 즉시 보상, 다른 행동으로 유도하는 방식이 궁합을 안정시킵니다.",
      en: "The parent's structure and the pet's rhythm may bump into each other. Short rules, instant rewards, and gentle redirection work better than pressure.",
    },
    pet_controls_owner: {
      ko: "반려동물이 집안 분위기를 주도하기 쉬운 관계입니다. 귀여움에 흐름을 다 내주기보다, 간식·놀이·휴식의 기준을 부드럽게 정해주면 서로가 훨씬 편안해져요.",
      en: "The pet may easily lead the mood at home. Instead of letting cuteness decide everything, set gentle rules for treats, play, and rest.",
    },
    neutral: {
      ko: "서로 다른 결을 가진 조화형 관계입니다. 처음부터 완벽하게 맞추기보다, 좋아하는 거리감과 반응 속도를 관찰하면서 둘만의 생활 리듬을 만드는 것이 중요해요.",
      en: "This is a balanced relationship with different textures. Rather than expecting instant sync, observe preferred distance and reaction speed to build your own rhythm.",
    },
  };

  return copy[relation][locale];
}

function genderDetail(
  petName: string,
  ownerName: string,
  petGender: Gender,
  ownerGender: Gender,
  species: string,
  locale: Locale
): string {
  const pet = genderLabel(petGender, "pet", locale);
  const owner = genderLabel(ownerGender, "owner", locale);

  if (locale === "ko") {
    return `${withJosa(petName, "은/는")} ${pet} ${species}로, ${ownerName} 집사님은 ${owner}의 생활 리듬을 가지고 있어요. 성별 자체가 궁합 점수를 정하지는 않지만, 호칭·스킨십 강도·놀이 템포를 맞출 때 중요한 관찰 포인트가 됩니다.`;
  }

  return `${petName} is a ${pet} ${species}, and ${ownerName} brings a ${owner} daily rhythm. Gender does not decide the score, but it helps tune names, touch intensity, and play tempo with more care.`;
}

const PET_ELEMENT_NOTES: Record<ElementKey, Record<Locale, (name: string) => string>> = {
  wood: {
    ko: (name) =>
      `${name}의 목(木) 기운은 호기심과 활력이 중심이에요. 산책·놀이·새 자극에 잘 반응하므로 움직임을 챙겨 주면 마음이 안정돼요.`,
    en: (name) =>
      `${name}'s wood energy loves curiosity and motion. Walks, play, and new stimuli help them feel settled.`,
  },
  fire: {
    ko: (name) =>
      `${name}의 화(火) 기운은 표현과 애정이 풍부해요. 칭찬·눈맞춤·함께하는 시간이 많을수록 유대가 깊어져요.`,
    en: (name) =>
      `${name}'s fire energy is expressive and affectionate. Praise, eye contact, and shared time deepen the bond.`,
  },
  earth: {
    ko: (name) =>
      `${name}의 토(土) 기운은 안정과 습관을 좋아해요. 규칙적인 밥·휴식·산책 시간이 이 아이에게 가장 큰 안심이에요.`,
    en: (name) =>
      `${name}'s earth energy values stability and routine. Regular meals, rest, and walks are the biggest comfort.`,
  },
  metal: {
    ko: (name) =>
      `${name}의 금(金) 기운은 민감하고 기준이 분명한 편이에요. 예측 가능한 환경과 차분한 톤이 신뢰를 쌓아 줘요.`,
    en: (name) =>
      `${name}'s metal energy is sensitive and clear about boundaries. Predictable routines and a calm tone build trust.`,
  },
  water: {
    ko: (name) =>
      `${name}의 수(水) 기운은 관찰력과 적응력이 뛰어나요. 조용한 공간과 천천히 다가가는 스킨십이 잘 맞아요.`,
    en: (name) =>
      `${name}'s water energy is observant and adaptable. Quiet spaces and gentle, slow touch work best.`,
  },
};

const OWNER_ELEMENT_NOTES: Record<ElementKey, Record<Locale, (name: string) => string>> = {
  wood: {
    ko: (name) =>
      `${name} 집사님의 목(木) 기운은 성장과 계획을 중시해요. 반려동물의 도전을 격려하고 함께 움직이는 케어와 잘 맞아요.`,
    en: (name) =>
      `${name}'s wood energy values growth and planning. Encouraging the pet's efforts and moving together fits this style.`,
  },
  fire: {
    ko: (name) =>
      `${name} 집사님의 화(火) 기운은 따뜻한 표현과 적극적인 교감을 좋아해요. 칭찬과 놀이로 관계를 키우기 쉬운 타입이에요.`,
    en: (name) =>
      `${name}'s fire energy loves warm expression and active bonding. Praise and play come naturally.`,
  },
  earth: {
    ko: (name) =>
      `${name} 집사님의 토(土) 기운은 책임감과 꾸준함이 강해요. 루틴을 지키며 돌보는 방식이 반려동물에게 큰 안정감을 줘요.`,
    en: (name) =>
      `${name}'s earth energy is steady and responsible. Consistent care gives the pet a strong sense of safety.`,
  },
  metal: {
    ko: (name) =>
      `${name} 집사님의 금(金) 기운은 기준과 원칙을 세우는 편이에요. 짧고 명확한 규칙이 반려동물과의 신뢰를 단단하게 해요.`,
    en: (name) =>
      `${name}'s metal energy sets clear standards. Short, consistent rules build firm trust with the pet.`,
  },
  water: {
    ko: (name) =>
      `${name} 집사님의 수(水) 기운은 섬세한 관찰력이 돋보여요. 반려동물의 작은 신호를 읽고 맞춰 주는 케어에 강점이 있어요.`,
    en: (name) =>
      `${name}'s water energy reads small signals well. Tuning care to subtle cues is a real strength.`,
  },
};

export function buildCompatibilityNarrative(
  relation: ElementRelation,
  score: number,
  petName: string,
  ownerName: string,
  petElement: ElementKey,
  ownerElement: ElementKey,
  petGender: Gender,
  ownerGender: Gender,
  species: Species,
  locale: Locale
) {
  const speciesLabel =
    locale === "ko" ? (species === "dog" ? "강아지" : species === "cat" ? "고양이" : "반려동물") : species;
  const copy = RELATION_COPY[relation][locale];
  const petEl = fmtEl(petElement, locale);
  const ownerEl = fmtEl(ownerElement, locale);

  const bond =
    BOND_LABEL[locale].find((b) => score >= b.min) ??
    BOND_LABEL[locale][BOND_LABEL[locale].length - 1];

  return {
    bondLabel: bond.label,
    bondEmoji: bond.emoji,
    headline: copy.title(petName, ownerName),
    story: copy.story(petName, ownerName, petEl, ownerEl, speciesLabel),
    details:
      locale === "ko"
        ? [
            { title: "궁합 흐름", body: relationDetail(relation, locale) },
            {
              title: "성별·생활 리듬",
              body: genderDetail(petName, ownerName, petGender, ownerGender, speciesLabel, locale),
            },
            {
              title: "오행 교감 포인트",
              body: `${petName}의 ${petEl} 기운과 ${ownerName} 집사님의 ${ownerEl} 기운은 서로의 반응 방식을 보여줘요. 기분이 잘 맞는 순간뿐 아니라, 어긋나는 순간의 회복 방법까지 함께 보는 것이 이 궁합의 핵심입니다.`,
            },
          ]
        : [
            { title: "Bond flow", body: relationDetail(relation, locale) },
            {
              title: "Gender and daily rhythm",
              body: genderDetail(petName, ownerName, petGender, ownerGender, speciesLabel, locale),
            },
            {
              title: "Element bonding point",
              body: `${petName}'s ${petEl} energy and ${ownerName}'s ${ownerEl} energy show how both sides respond. The key is reading not only the easy moments, but also how to recover when rhythms miss each other.`,
            },
          ],
    careTips: copy.tips,
    relationDescription: relationDetail(relation, locale),
    petElementNote: PET_ELEMENT_NOTES[petElement][locale](petName),
    ownerElementNote: OWNER_ELEMENT_NOTES[ownerElement][locale](ownerName),
  };
}
