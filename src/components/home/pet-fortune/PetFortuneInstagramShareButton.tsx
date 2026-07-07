"use client";

import { DailyFortuneInstaCard } from "@/components/home/pet-fortune/DailyFortuneInstaCard";
import type { PetDailyFortune, PetFortunePetMeta } from "@/lib/saju/pet-daily-fortune";
import {
  canShareImageFiles,
  shareDailyFortuneInstaCard,
} from "@/lib/share/daily-fortune-insta-card";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

type Props = {
  pet: PetFortunePetMeta;
  fortune: PetDailyFortune;
};

export function PetFortuneInstagramShareButton({ pet, fortune }: Props) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const t = useTranslations("home.guestFortune");
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [shareCapable, setShareCapable] = useState(false);

  useEffect(() => {
    setShareCapable(canShareImageFiles());
  }, []);

  async function handleInstagramShare() {
    if (!cardRef.current) return;

    setBusy(true);
    setStatus(null);
    try {
      const result = await shareDailyFortuneInstaCard(cardRef.current, pet.name);
      if (result === "downloaded") {
        setStatus(t("instagramShareSavedToast"));
      }
    } catch {
      setStatus(t("instagramShareFailed"));
    } finally {
      setBusy(false);
    }
  }

  const buttonLabel = shareCapable ? t("instagramShareNative") : t("instagramShareDownload");

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed left-[-9999px] top-0 -z-10">
        <DailyFortuneInstaCard ref={cardRef} pet={pet} fortune={fortune} isKo={isKo} />
      </div>

      <div className="mx-auto w-full max-w-md px-1">
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleInstagramShare()}
          className="pet-fortune-instagram-share-btn w-full disabled:opacity-60"
        >
          {busy ? t("instagramShareLoading") : buttonLabel}
        </button>
        {status ? (
          <p className="mt-2 text-center text-[11px] font-semibold leading-relaxed text-stone-600">
            {status}
          </p>
        ) : null}
      </div>
    </>
  );
}
