import { BREED_GUIDE_SEEDS } from "@/lib/community/breed-guide-seeds";
import type { BreedGuide } from "@/lib/supabase/types";

export const MOCK_BREED_GUIDES: BreedGuide[] = BREED_GUIDE_SEEDS.map((seed, index) => ({
  id: `mock-breed-${seed.seo_slug}`,
  ...seed,
  thumbnail_url: null,
  hero_image_url: null,
  language: "ko",
  is_published: true,
  view_count: 120 - index,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

export function filterMockBreedGuides(animal?: import("@/lib/supabase/types").PetAnimalType | null) {
  if (!animal) return MOCK_BREED_GUIDES;
  return MOCK_BREED_GUIDES.filter((g) => g.animal_type === animal);
}
