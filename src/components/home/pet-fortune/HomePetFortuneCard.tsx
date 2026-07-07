"use client";

import { PetFortuneEntryForm, type PetFortuneFormValues } from "@/components/home/pet-fortune/PetFortuneEntryForm";
import { PetFortuneQuickAddForm, PetFortuneSajuGuide } from "@/components/home/pet-fortune/PetFortuneQuickAddForm";
import { PetFortuneInsightsDashboard } from "@/components/home/pet-fortune/PetFortuneInsightsDashboard";
import { PetCareReminderBanner } from "@/components/home/PetCareReminderBanner";
import type { FortuneTodayState } from "@/components/home/PetDailyFortunePanel";
import type { PetDailyFortune, PetFortunePetMeta } from "@/lib/saju/pet-daily-fortune";
import { buildSamplePetFortune } from "@/lib/saju/pet-fortune-sample";
import type { CareRemindersPayload } from "@/lib/pet-care/reminders";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";

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
  const resultRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [livePet, setLivePet] = useState<PetFortunePetMeta | null>(null);
  const [liveFortune, setLiveFortune] = useState<PetDailyFortune | null>(null);

  const sample = useMemo(
    () => buildSamplePetFortune(locale === "en" ? "en" : "ko"),
    [locale]
  );

  const hasRegisteredPets = fortuneData?.mode === "personalized";

  async function handleSubmit(values: PetFortuneFormValues) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/fortune/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Request failed.");
        return;
      }
      setLivePet(data.pet as PetFortunePetMeta);
      setLiveFortune(data.fortune as PetDailyFortune);
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch {
      setError(locale === "ko" ? "네트워크 오류가 발생했어요." : "Network error.");
    } finally {
      setLoading(false);
    }
  }

  function handleResetLive() {
    setLivePet(null);
    setLiveFortune(null);
    setError(null);
  }

  if (hasRegisteredPets && fortuneData.mode === "personalized") {
    const selectedPet =
      fortuneData.pets.find((pet) => pet.id === fortuneData.petId) ?? fortuneData.pets[0];

    return (
      <div className="space-y-3">
        <PetFortuneSajuGuide />
        <div className="pet-fortune-guest-shell relative min-w-0 space-y-5">
          <PetFortuneQuickAddForm onAdded={onPetAdded} />
        <PetCareReminderBanner
          careReminders={careReminders ?? fortuneData.careReminders}
          isKo={locale === "ko"}
        />
        <PetFortuneInsightsDashboard
          mode="registered"
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

  const resultPet = livePet ?? sample.pet;
  const resultFortune = liveFortune ?? sample.fortune;
  const resultMode = liveFortune ? "live" : "demo";

  return (
    <div className="space-y-3">
      <div className="pet-fortune-guest-shell relative min-w-0 space-y-6">
      {isLoggedIn ? (
        <PetFortuneQuickAddForm onAdded={onPetAdded} />
      ) : (
        <PetFortuneEntryForm loading={loading} error={error} onSubmit={handleSubmit} />
      )}

      {isLoggedIn ? (
        <PetFortuneSajuGuide />
      ) : (
        <div className="relative z-10 px-1 text-center">
          <p className="text-sm font-semibold leading-relaxed text-stone-700">{t("previewHint")}</p>
          <div className="mx-auto mt-2 h-px w-16 bg-stone-300" aria-hidden />
        </div>
      )}

      <div ref={resultRef} className="relative">
        <PetFortuneInsightsDashboard
          mode={resultMode}
          pet={resultPet}
          fortune={resultFortune}
          onResetPreview={resultMode === "live" ? handleResetLive : undefined}
          suppressGuestChrome={isLoggedIn}
        />
      </div>
    </div>
    </div>
  );
}
