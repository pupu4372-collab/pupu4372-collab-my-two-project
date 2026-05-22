import { ELEMENT_META } from "../elements";
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
        `${pet}와 ${owner} 집사님은 ${pEl} 기운으로 맞춰진 팀이에요. ${sp} ${pet}의 리듬을 집사님이 intuitively 이해하고, 말 없이도 쿠션 자리를 맞춰요.`,
      tips: [
        "루틴을 함께 지키면 유대가 더 깊어져요",
        "같은 기운은 과열할 수 있으니 가끔은 새 산책로로 리프레시",
      ],
    },
    en: {
      title: (pet, owner) => `${pet} × ${owner} — same element wavelength`,
      story: (pet, owner, pEl, oEl, sp) =>
        `${pet} and ${owner} share ${pEl} energy. This ${sp} and butler sync cushions and moods without many words.`,
      tips: [
        "Shared routines deepen the bond",
        "Same energy can overheat—try a fresh walk route sometimes",
      ],
    },
  },
  owner_nourishes_pet: {
    ko: {
      title: (pet, owner) => `${pet} × ${owner} — 집사가 ${pet}를 키우는 상생`,
      story: (pet, owner, pEl, oEl, sp) =>
        `집사님의 ${oEl} 기운이 ${sp} ${pet}의 ${pEl}로 스며들어요. 밥·산책·안심이 ${pet}에게 가장 큰 사랑 언어.`,
      tips: [
        "규칙적인 케어가 궁합을 극대화해요",
        "칭찬과 간식 타이밍을 일정하게",
      ],
    },
    en: {
      title: (pet, owner) => `${pet} × ${owner} — butler nourishes pet`,
      story: (pet, owner, pEl, oEl, sp) =>
        `${owner}'s ${oEl} energy feeds ${pet}'s ${pEl}. Meals, walks, and calm presence are love languages.`,
      tips: [
        "Steady care maximizes compatibility",
        "Keep praise and treat timing consistent",
      ],
    },
  },
  pet_nourishes_owner: {
    ko: {
      title: (pet, owner) => `${pet} × ${owner} — ${pet}가 집사를 채우는 상생`,
      story: (pet, owner, pEl, oEl, sp) =>
        `${sp} ${pet}의 ${pEl} 기운이 집사님 ${oEl} 마음을 환하게. 퇴근 후 ${pet} 한 마리가 하루를 치유해요.`,
      tips: [
        "함께 쉬는 시간을 의도적으로 만드세요",
        "눈 맞춤 + 천천히 쓰다듬기",
      ],
    },
    en: {
      title: (pet, owner) => `${pet} × ${owner} — pet heals the butler`,
      story: (pet, owner, pEl, oEl, sp) =>
        `${pet}'s ${pEl} brightens ${owner}'s ${oEl} heart. One greeting after work resets the day.`,
      tips: [
        "Schedule intentional rest together",
        "Eye contact + slow petting",
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
        "NO 대신 redirection(다른 행동 유도)",
      ],
    },
    en: {
      title: (pet, owner) => `${pet} × ${owner} — different rhythms`,
      story: (pet, owner, pEl, oEl, sp) =>
        `${owner}'s ${oEl} and ${pet}'s ${pEl} form a controlling pair. Structure plus patience builds strong trust.`,
      tips: [
        "Short training + instant reward",
        "Redirect instead of only saying no",
      ],
    },
  },
  pet_controls_owner: {
    ko: {
      title: (pet, owner) => `${pet} × ${owner} — ${pet}가 기승하는 귀여운 극`,
      story: (pet, owner, pEl, oEl, sp) =>
        `${pet} ${pEl} 기운이 집사님 ${oEl}을 살짝 압도. ${sp}가 집안 분위기를 이끌지만, 경계만 부드럽게 세우면 최고의 파트너.`,
      tips: [
        "일관된 규칙 2~3개만 유지",
        "간식은 칭찬 후에만",
      ],
    },
    en: {
      title: (pet, owner) => `${pet} × ${owner} — pet leads the vibe`,
      story: (pet, owner, pEl, oEl, sp) =>
        `${pet}'s ${pEl} gently leads ${owner}'s ${oEl}. Set soft boundaries and this pair shines.`,
      tips: [
        "Keep 2–3 consistent house rules",
        "Treats after praise, not before",
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
      ],
    },
    en: {
      title: (pet, owner) => `${pet} × ${owner} — balanced neutral`,
      story: (pet, owner, pEl, oEl, sp) =>
        `${pEl} and ${oEl} don't clash directly. Different charms—respect pacing and it lasts.`,
      tips: [
        "Observe each other's tempo for two weeks",
        "Discover a new game together",
      ],
    },
  },
};

function fmtEl(el: ElementKey, locale: Locale): string {
  const m = ELEMENT_META[el];
  return locale === "ko"
    ? `${m.meaning}(${m.hangul}, ${m.hanja})`
    : `${m.meaning} (${m.hanja})`;
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
    return `${petName}는 ${pet} ${species}로, ${ownerName} 집사님은 ${owner}의 생활 리듬을 가지고 있어요. 성별 자체가 궁합 점수를 정하지는 않지만, 호칭·스킨십 강도·놀이 템포를 맞출 때 중요한 관찰 포인트가 됩니다.`;
  }

  return `${petName} is a ${pet} ${species}, and ${ownerName} brings a ${owner} daily rhythm. Gender does not decide the score, but it helps tune names, touch intensity, and play tempo with more care.`;
}

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
  const speciesLabel = locale === "ko" ? (species === "dog" ? "강아지" : "고양이") : species;
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
  };
}
