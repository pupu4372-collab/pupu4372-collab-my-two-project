import type { PetCareCategory } from "@/lib/supabase/types";

export const PET_CARE_CATEGORIES: PetCareCategory[] = [
  "weight",
  "vaccine",
  "vet",
  "grooming",
  "medication",
  "nutrition",
  "exercise",
  "other",
];

export const PET_CARE_CATEGORY_META: Record<
  PetCareCategory,
  { ko: string; en: string; emoji: string; color: string }
> = {
  weight: { ko: "체중", en: "Weight", emoji: "⚖️", color: "#3B82F6" },
  vaccine: { ko: "접종", en: "Vaccine", emoji: "💉", color: "#22C55E" },
  vet: { ko: "병원", en: "Vet visit", emoji: "🏥", color: "#EF4444" },
  grooming: { ko: "미용", en: "Grooming", emoji: "✂️", color: "#A855F7" },
  medication: { ko: "투약", en: "Medication", emoji: "💊", color: "#F97316" },
  nutrition: { ko: "식사", en: "Nutrition", emoji: "🍽️", color: "#EAB308" },
  exercise: { ko: "산책·운동", en: "Exercise", emoji: "🎾", color: "#14B8A6" },
  other: { ko: "기타", en: "Other", emoji: "📝", color: "#64748B" },
};

export function isPetCareCategory(value: unknown): value is PetCareCategory {
  return typeof value === "string" && PET_CARE_CATEGORIES.includes(value as PetCareCategory);
}

export function categoryLabel(category: PetCareCategory, isKo: boolean) {
  return isKo ? PET_CARE_CATEGORY_META[category].ko : PET_CARE_CATEGORY_META[category].en;
}

export function monthBounds(year: number, month: number) {
  const mm = String(month).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  return {
    from: `${year}-${mm}-01`,
    to: `${year}-${mm}-${String(lastDay).padStart(2, "0")}`,
  };
}

export function toDateISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
