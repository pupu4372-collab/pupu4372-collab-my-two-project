import type { PetCareCategory } from "@/lib/supabase/types";

export const PET_CARE_CATEGORIES: PetCareCategory[] = [
  "feeding",
  "grooming",
  "vet_visit",
  "vaccination",
  "exercise",
  "medication",
  "other",
];

export const PET_CARE_CATEGORY_META: Record<
  PetCareCategory,
  { ko: string; en: string; emoji: string; color: string }
> = {
  feeding: { ko: "급여", en: "Feeding", emoji: "🍽️", color: "#EAB308" },
  grooming: { ko: "미용", en: "Grooming", emoji: "✂️", color: "#A855F7" },
  vet_visit: { ko: "병원", en: "Vet visit", emoji: "🏥", color: "#EF4444" },
  vaccination: { ko: "접종", en: "Vaccination", emoji: "💉", color: "#22C55E" },
  exercise: { ko: "산책·운동", en: "Exercise", emoji: "🎾", color: "#14B8A6" },
  medication: { ko: "투약", en: "Medication", emoji: "💊", color: "#F97316" },
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

function isTime(value: unknown): value is string {
  return typeof value === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(value);
}

/** Accepts HH:MM or HH:MM:SS → HH:MM:SS for Postgres `time`. */
export function normalizeEventTime(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (!isTime(value)) return null;
  const parts = value.split(":");
  if (parts.length === 2) return `${parts[0]}:${parts[1]}:00`;
  return value;
}
