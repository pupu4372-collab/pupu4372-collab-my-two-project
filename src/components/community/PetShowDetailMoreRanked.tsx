import { COMMUNITY_SOLID_SURFACE_CLASS } from "@/components/community/CommunityDetailSurface";
import { RunnerUpCard } from "@/components/community/PetShowRankingCards";
import { fetchPetShowSpeciesRankings, getPetShowSpeciesRankingRows } from "@/lib/community/ranking";
import { resolveCommunityPostSpecies } from "@/lib/community/pet-show-species";
import type { CommunityPost } from "@/lib/supabase/types";
import { getTranslations } from "next-intl/server";

interface PetShowDetailMoreRankedProps {
  post: CommunityPost;
  locale: string;
}

export async function PetShowDetailMoreRanked({ post, locale }: PetShowDetailMoreRankedProps) {
  const isKo = locale !== "en";
  const t = await getTranslations({ locale, namespace: "petshow" });
  const species = await resolveCommunityPostSpecies(post);
  if (!species) return null;

  const { rows: grouped } = await fetchPetShowSpeciesRankings("week");
  const speciesRows = getPetShowSpeciesRankingRows(grouped, species);
  if (speciesRows.length <= 1) return null;

  const others = speciesRows.filter((row) => row.id !== post.id);
  if (others.length === 0) return null;

  return (
    <section className={`mt-8 ${COMMUNITY_SOLID_SURFACE_CLASS} p-5 md:p-6`}>
      <h2 className="text-lg font-extrabold text-channel-community md:text-xl">{t("moreRanked")}</h2>
      <ol className="mt-4 space-y-3">
        {others.map((row) => (
          <RunnerUpCard
            key={row.id}
            row={row}
            rank={row.rank_position ?? speciesRows.findIndex((r) => r.id === row.id) + 1}
            isKo={isKo}
          />
        ))}
      </ol>
    </section>
  );
}
