import { filterMockBreedGuides, MOCK_BREED_GUIDES } from "@/lib/community/breed-guide-mock";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { BreedGuide, PetAnimalType } from "@/lib/supabase/types";

const BREED_GUIDE_SELECT =
  "id, breed_name, breed_name_en, animal_type, size_category, lifespan, personality, health_notes, exercise_level, grooming_level, beginner_friendly, saju_tendency, seo_slug, thumbnail_url, hero_image_url, summary, body, tags, language, is_published, view_count, created_at, updated_at";

export interface BreedGuideListResult {
  guides: BreedGuide[];
  source: "supabase" | "mock";
}

export async function fetchBreedGuides(options?: {
  animalType?: PetAnimalType | null;
  language?: string;
}): Promise<BreedGuideListResult> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return {
      guides: filterMockBreedGuides(options?.animalType),
      source: "mock",
    };
  }

  let query = supabase
    .from("breed_guides")
    .select(BREED_GUIDE_SELECT)
    .eq("is_published", true)
    .order("view_count", { ascending: false })
    .order("breed_name", { ascending: true });

  if (options?.animalType) {
    query = query.eq("animal_type", options.animalType);
  }
  if (options?.language) {
    query = query.eq("language", options.language);
  }

  const { data, error } = await query;
  if (error || !data?.length) {
    if (process.env.NODE_ENV === "development") {
      console.warn("breed guides: Supabase 결과 없음, mock 폴백");
      const mock = filterMockBreedGuides(options?.animalType);
      return { guides: mock.length ? mock : MOCK_BREED_GUIDES, source: "mock" };
    }
    return { guides: [], source: "supabase" };
  }

  return { guides: data as BreedGuide[], source: "supabase" };
}

export async function fetchBreedGuideBySlug(
  slug: string,
  options?: { previewMock?: boolean },
): Promise<{
  guide: BreedGuide | null;
  source: "supabase" | "mock";
}> {
  if (options?.previewMock) {
    const guide = MOCK_BREED_GUIDES.find((g) => g.seo_slug === slug) ?? null;
    return { guide, source: "mock" };
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    const guide = MOCK_BREED_GUIDES.find((g) => g.seo_slug === slug) ?? null;
    return { guide, source: "mock" };
  }

  const { data, error } = await supabase
    .from("breed_guides")
    .select(BREED_GUIDE_SELECT)
    .eq("seo_slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    const guide = MOCK_BREED_GUIDES.find((g) => g.seo_slug === slug) ?? null;
    return { guide, source: "mock" };
  }

  return { guide: data as BreedGuide, source: "supabase" };
}
