"use client";

import { COMMUNITY_CHIP_IDLE_SM_CLASS } from "@/components/community/CommunityDetailSurface";
import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { PetShowFeed, type PetShowSpeciesFilter } from "@/components/community/PetShowFeed";
import { Link } from "@/i18n/navigation";
import type { PetShowSpecies } from "@/lib/supabase/types";
import { useTranslations } from "next-intl";
import { useState } from "react";

const SPECIES_FILTERS: PetShowSpeciesFilter[] = ["all", "dog", "cat", "reptile", "other"];

export function PetShowSnapzone() {
  const t = useTranslations("petshow");
  const tSpecies = useTranslations("petSpecies");
  const [species, setSpecies] = useState<PetShowSpeciesFilter>("all");

  const speciesLabel = (filter: PetShowSpeciesFilter) => {
    if (filter === "all") return t("filterAll");
    if (filter === "other") return tSpecies("otherFriends");
    return tSpecies(filter as PetShowSpecies);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-channel-community">
            {t("snapzoneEyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-white">📷 {t("snapzoneGridTitle")}</h2>
          <p className="mt-1 text-sm text-white/75">{t("snapzoneSubtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AuthRequiredLink
            href="/community/pet-show/upload"
            className="inline-flex rounded-full bg-channel-community px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:brightness-105"
          >
            {t("uploadCta")}
          </AuthRequiredLink>
          <Link
            href="/community/pet-show/fails"
            className="inline-flex rounded-full bg-[#ffd7ff] px-5 py-3 text-sm font-extrabold text-primary shadow-sm transition hover:brightness-105"
          >
            {t("failsCta")}
          </Link>
        </div>
      </div>

      <nav
        className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar"
        aria-label={t("speciesFilterLabel")}
      >
        {SPECIES_FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setSpecies(filter)}
            className={
              species === filter
                ? "whitespace-nowrap rounded-full bg-channel-community px-4 py-2 text-xs font-extrabold text-white shadow-sm"
                : COMMUNITY_CHIP_IDLE_SM_CLASS
            }
            aria-current={species === filter ? "true" : undefined}
          >
            {speciesLabel(filter)}
          </button>
        ))}
      </nav>

      <PetShowFeed key={species} species={species} variant="grid" />
    </div>
  );
}
