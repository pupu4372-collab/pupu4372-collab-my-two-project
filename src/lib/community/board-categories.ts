import type { CommunityBoardKind } from "./qa-feed";

export type PetAnimalType = "dog" | "cat" | "reptile" | "other";

export interface BoardCategoryOption {
  id: string;
  ko: string;
  en: string;
  children?: BoardCategoryOption[];
}

const QA_CATEGORIES: Record<PetAnimalType, BoardCategoryOption[]> = {
  dog: [
    { id: "health-disease", ko: "건강·질병", en: "Health & illness" },
    { id: "behavior-training", ko: "행동·훈련", en: "Behavior & training" },
    { id: "food-nutrition", ko: "사료·영양", en: "Food & nutrition" },
    { id: "saju-fortune", ko: "사주·운세", en: "Saju & fortune" },
  ],
  cat: [
    { id: "health-disease", ko: "건강·질병", en: "Health & illness" },
    { id: "behavior-habits", ko: "행동·습성", en: "Behavior & habits" },
    { id: "food-nutrition", ko: "사료·영양", en: "Food & nutrition" },
    { id: "saju-fortune", ko: "사주·운세", en: "Saju & fortune" },
  ],
  reptile: [
    { id: "health-disease", ko: "건강·질병", en: "Health & illness" },
    { id: "habitat", ko: "사육 환경", en: "Habitat & setup" },
    { id: "feeding", ko: "먹이", en: "Feeding" },
    { id: "saju-fortune", ko: "사주·운세", en: "Saju & fortune" },
  ],
  other: [
    { id: "health-disease", ko: "건강·질병", en: "Health & illness" },
    { id: "habitat", ko: "사육 환경", en: "Habitat & setup" },
    { id: "feeding", ko: "먹이", en: "Feeding" },
    { id: "saju-fortune", ko: "사주·운세", en: "Saju & fortune" },
  ],
};

const TIPS_CATEGORIES: Record<PetAnimalType, BoardCategoryOption[]> = {
  dog: [
    {
      id: "health-care",
      ko: "건강 관리",
      en: "Health care",
      children: [
        { id: "dog-dental", ko: "치아·구강", en: "Dental care" },
        { id: "dog-skin", ko: "피부·털", en: "Skin & coat" },
        { id: "dog-checkup", ko: "예방·검진", en: "Prevention & checkups" },
      ],
    },
    {
      id: "training-behavior",
      ko: "훈련·행동",
      en: "Training & behavior",
      children: [
        { id: "dog-potty", ko: "배변", en: "Potty" },
        { id: "dog-walk", ko: "산책", en: "Walks" },
        { id: "dog-separation", ko: "분리불안", en: "Separation anxiety" },
      ],
    },
    {
      id: "food-diy",
      ko: "사료·간식 DIY",
      en: "Food & treat DIY",
      children: [
        { id: "dog-meal", ko: "식단", en: "Meals" },
        { id: "dog-snack", ko: "간식", en: "Treats" },
        { id: "dog-supplement", ko: "영양제", en: "Supplements" },
      ],
    },
    {
      id: "saju-tips",
      ko: "사주 활용법",
      en: "Saju tips",
      children: [
        { id: "dog-personality", ko: "성향 이해", en: "Personality" },
        { id: "dog-routine", ko: "루틴 추천", en: "Routine tips" },
      ],
    },
  ],
  cat: [
    {
      id: "enrichment",
      ko: "환경 풍부화",
      en: "Enrichment",
      children: [
        { id: "cat-play", ko: "놀이", en: "Play" },
        { id: "cat-scratch", ko: "스크래처", en: "Scratchers" },
        { id: "cat-litter", ko: "화장실", en: "Litter box" },
      ],
    },
    {
      id: "health-care",
      ko: "건강 관리",
      en: "Health care",
      children: [
        { id: "cat-dental", ko: "치아·구강", en: "Dental care" },
        { id: "cat-hairball", ko: "헤어볼", en: "Hairballs" },
        { id: "cat-checkup", ko: "예방·검진", en: "Prevention & checkups" },
      ],
    },
    {
      id: "food-diy",
      ko: "사료·간식 DIY",
      en: "Food & treat DIY",
      children: [
        { id: "cat-meal", ko: "식단", en: "Meals" },
        { id: "cat-snack", ko: "간식", en: "Treats" },
        { id: "cat-water", ko: "음수량", en: "Hydration" },
      ],
    },
    {
      id: "saju-tips",
      ko: "사주 활용법",
      en: "Saju tips",
      children: [
        { id: "cat-personality", ko: "성향 이해", en: "Personality" },
        { id: "cat-routine", ko: "루틴 추천", en: "Routine tips" },
      ],
    },
  ],
  reptile: [
    {
      id: "habitat-setup",
      ko: "사육 환경 세팅",
      en: "Habitat setup",
      children: [
        { id: "reptile-temperature", ko: "온도·습도", en: "Temperature & humidity" },
        { id: "reptile-uvb", ko: "UVB·조명", en: "UVB & lighting" },
        { id: "reptile-cleaning", ko: "청소", en: "Cleaning" },
      ],
    },
    {
      id: "feeding-care",
      ko: "먹이 관리",
      en: "Feeding",
      children: [
        { id: "reptile-food", ko: "먹이 종류", en: "Food types" },
        { id: "reptile-schedule", ko: "급여 주기", en: "Feeding schedule" },
      ],
    },
    {
      id: "health-care",
      ko: "건강 관리",
      en: "Health care",
      children: [
        { id: "reptile-shedding", ko: "탈피·피부", en: "Shedding & skin" },
        { id: "reptile-checkup", ko: "예방·검진", en: "Prevention & checkups" },
      ],
    },
    {
      id: "saju-tips",
      ko: "사주 활용법",
      en: "Saju tips",
      children: [
        { id: "reptile-personality", ko: "성향 이해", en: "Personality" },
        { id: "reptile-routine", ko: "루틴 추천", en: "Routine tips" },
      ],
    },
  ],
  other: [
    {
      id: "habitat-setup",
      ko: "사육 환경 세팅",
      en: "Habitat setup",
      children: [
        { id: "other-temperature", ko: "온도·습도", en: "Temperature & humidity" },
        { id: "other-cage", ko: "케이지·어항", en: "Cage & tank" },
        { id: "other-cleaning", ko: "청소", en: "Cleaning" },
      ],
    },
    {
      id: "feeding-care",
      ko: "먹이 관리",
      en: "Feeding",
      children: [
        { id: "other-food", ko: "먹이 종류", en: "Food types" },
        { id: "other-schedule", ko: "급여 주기", en: "Feeding schedule" },
      ],
    },
    {
      id: "health-care",
      ko: "건강 관리",
      en: "Health care",
      children: [
        { id: "other-warning", ko: "이상 신호", en: "Warning signs" },
        { id: "other-checkup", ko: "예방·검진", en: "Prevention & checkups" },
      ],
    },
    {
      id: "saju-tips",
      ko: "사주 활용법",
      en: "Saju tips",
      children: [
        { id: "other-personality", ko: "성향 이해", en: "Personality" },
        { id: "other-routine", ko: "루틴 추천", en: "Routine tips" },
      ],
    },
  ],
};

function withOtherSubcategories(categories: BoardCategoryOption[]): BoardCategoryOption[] {
  return categories.map((category) => ({
    ...category,
    children: category.children
      ? [...category.children, { id: `${category.id}-other`, ko: "기타", en: "Other" }]
      : category.children,
  }));
}

const PET_ANIMAL_OPTIONS = [
  { value: "dog" as const, ko: "강아지", en: "Dog" },
  { value: "cat" as const, ko: "고양이", en: "Cat" },
  { value: "reptile" as const, ko: "렙타일", en: "Reptile" },
  { value: "other" as const, ko: "그외친구들", en: "Other friends" },
];

export function isPetAnimalType(value: unknown): value is PetAnimalType {
  return value === "dog" || value === "cat" || value === "reptile" || value === "other";
}

export function getPetAnimalOptions(isKo: boolean) {
  return PET_ANIMAL_OPTIONS.map((o) => ({
    value: o.value,
    label: isKo ? o.ko : o.en,
  }));
}

export function getBoardCategories(
  board: "qa" | "tips",
  animal: PetAnimalType
): BoardCategoryOption[] {
  return board === "qa" ? QA_CATEGORIES[animal] : withOtherSubcategories(TIPS_CATEGORIES[animal]);
}

export function getBoardSubcategories(
  board: "qa" | "tips",
  animal: PetAnimalType,
  categoryId: string
): BoardCategoryOption[] {
  return getBoardCategories(board, animal).find((c) => c.id === categoryId)?.children ?? [];
}

export function isValidBoardCategory(
  board: CommunityBoardKind,
  animal: PetAnimalType,
  categoryId: string
): boolean {
  if (board !== "qa" && board !== "tips") return false;
  return getBoardCategories(board, animal).some((c) => c.id === categoryId);
}

export function isValidBoardSubcategory(
  board: CommunityBoardKind,
  animal: PetAnimalType,
  categoryId: string,
  subcategoryId: string
): boolean {
  if (board !== "qa" && board !== "tips") return false;
  return getBoardSubcategories(board, animal, categoryId).some((c) => c.id === subcategoryId);
}

export function subcategoryTag(subcategoryId: string) {
  return `subcategory:${subcategoryId}`;
}

export function subcategoryIdFromTag(tag: string) {
  return tag.startsWith("subcategory:") ? tag.slice("subcategory:".length) : null;
}

export function getCategoryLabel(
  board: "qa" | "tips",
  animal: PetAnimalType | null | undefined,
  categoryId: string | null | undefined,
  isKo: boolean
): string | null {
  if (!categoryId || !animal) return null;
  const option = getBoardCategories(board, animal).find((c) => c.id === categoryId);
  if (!option) return categoryId;
  return isKo ? option.ko : option.en;
}

export function getSubcategoryLabel(
  board: "qa" | "tips",
  animal: PetAnimalType | null | undefined,
  categoryId: string | null | undefined,
  subcategoryId: string | null | undefined,
  isKo: boolean
): string | null {
  if (!subcategoryId || !categoryId || !animal) return null;
  const option = getBoardSubcategories(board, animal, categoryId).find((c) => c.id === subcategoryId);
  if (!option) return subcategoryId;
  return isKo ? option.ko : option.en;
}

export function getAnimalLabel(animal: PetAnimalType | null | undefined, isKo: boolean): string | null {
  if (!animal) return null;
  const option = PET_ANIMAL_OPTIONS.find((o) => o.value === animal);
  if (!option) return animal;
  return isKo ? option.ko : option.en;
}

/** Infer animal from legacy tag-only posts */
export const TIPS_DIFFICULTY_OPTIONS = [
  { id: "easy" as const, ko: "초급", en: "Easy" },
  { id: "medium" as const, ko: "중급", en: "Medium" },
  { id: "hard" as const, ko: "고급", en: "Hard" },
];

export function isTipsDifficulty(value: unknown): value is (typeof TIPS_DIFFICULTY_OPTIONS)[number]["id"] {
  return value === "easy" || value === "medium" || value === "hard";
}

export function resolvePostAnimalType(
  animalType: PetAnimalType | null | undefined,
  tags: string[]
): PetAnimalType | null {
  if (animalType && isPetAnimalType(animalType)) return animalType;
  return (tags.find((t) => isPetAnimalType(t)) as PetAnimalType | undefined) ?? null;
}
