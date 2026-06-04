import { BreedGuideHub } from "@/components/community/BreedGuideHub";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { fetchBreedGuides } from "@/lib/community/breed-guides";
import type { PetAnimalType } from "@/lib/supabase/types";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ animal?: string }>;
}

function parseAnimal(value?: string): PetAnimalType | "all" {
  if (value === "dog" || value === "cat" || value === "other") return value;
  return "all";
}

export default async function BreedGuidesPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { animal: animalParam } = await searchParams;
  const isKo = locale !== "en";
  const activeAnimal = parseAnimal(animalParam);
  const { guides, source } = await fetchBreedGuides({
    animalType: activeAnimal === "all" ? null : activeAnimal,
    language: isKo ? "ko" : "en",
  });

  return (
    <ChannelShell
      theme="community"
      title={isKo ? "품종별 가이드" : "Breed guides"}
      subtitle={
        isKo
          ? "견종·묘종 레퍼런스 — 성격, 건강, 사주 힌트까지 한곳에서"
          : "Dog and cat breed reference with care and saju hints"
      }
      backHref="/community"
      backLabel={isKo ? "← 커뮤니티" : "← Community"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/saju", label: isKo ? "펫 사주" : "Pet Saju" },
      ]}
    >
      <BreedGuideHub guides={guides} source={source} activeAnimal={activeAnimal} isKo={isKo} />
    </ChannelShell>
  );
}
