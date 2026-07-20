"use client";

import { PetFortuneQuickAddForm, PetFortuneSajuGuide } from "@/components/home/pet-fortune/PetFortuneQuickAddForm";
import { PetFortuneInsightsDashboard } from "@/components/home/pet-fortune/PetFortuneInsightsDashboard";
import { PetFortuneExampleCarousel } from "@/components/home/pet-fortune/PetFortuneExampleCarousel";
import { PetCareReminderBanner } from "@/components/home/PetCareReminderBanner";
import type { FortuneTodayState } from "@/components/home/PetDailyFortunePanel";
import type { CareRemindersPayload } from "@/lib/pet-care/reminders";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

type Props = {
  fortuneData: FortuneTodayState | null;
  careReminders?: CareRemindersPayload;
  onSelectPet?: (petId: string) => void;
  onPetAdded?: (petId: string) => void;
};

export function HomePetFortuneCard({ fortuneData, careReminders, onSelectPet, onPetAdded }: Props) {
  const locale = useLocale();
  const t = useTranslations("home.guestFortune");
  const { ready, isAnonymous, configured } = useSupabaseSession();
  const isLoggedIn = configured && ready && !isAnonymous;

  const hasRegisteredPets = fortuneData?.mode === "personalized";
  const isLoggedInWithoutPets = isLoggedIn && fortuneData?.mode !== "personalized";

  if (hasRegisteredPets && fortuneData.mode === "personalized") {
    const selectedPet =
      fortuneData.pets.find((pet) => pet.id === fortuneData.petId) ?? fortuneData.pets[0];

    return (
      <div className="space-y-3">
        <PetFortuneSajuGuide sajuPetId={fortuneData.petId} />
        <div className="pet-fortune-guest-shell relative min-w-0 space-y-5">
          <h2 className="pet-fortune-guest-shell__title">{t("quickAddSectionLabel")}</h2>
          <PetFortuneQuickAddForm onAdded={onPetAdded} />
          <PetCareReminderBanner
            careReminders={careReminders ?? fortuneData.careReminders}
            isKo={locale === "ko"}
          />
          <PetFortuneInsightsDashboard
            pet={selectedPet}
            fortune={fortuneData.fortune}
            pets={fortuneData.pets}
            selectedPetId={fortuneData.petId}
            onSelectPet={onSelectPet}
          />
        </div>
      </div>
    );
  }

  if (isLoggedInWithoutPets) {
    return (
      <div className="space-y-3">
        <div className="pet-fortune-guest-shell relative min-w-0 space-y-6">
          <h2 className="pet-fortune-guest-shell__title">{t("quickAddSectionLabel")}</h2>
          <PetFortuneQuickAddForm onAdded={onPetAdded} />
          <PetFortuneSajuGuide />
          <div className="rounded-2xl border border-stone-200/80 bg-white/70 px-5 py-8 text-center shadow-sm">
            <p className="text-sm font-semibold leading-relaxed text-stone-700">{t("emptyPetPrompt")}</p>
            <Link
              href="/profile"
              className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:brightness-105"
            >
              {t("emptyPetCta")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="pet-fortune-guest-shell relative min-w-0 space-y-6">
        <h2 className="pet-fortune-guest-shell__title">{t("quickAddSectionLabel")}</h2>
        <PetFortuneQuickAddForm onAdded={onPetAdded} />
        <PetFortuneExampleCarousel />
      </div>
    </div>
  );
}
