"use client";

import { DailyFortuneInstaCard } from "@/components/home/pet-fortune/DailyFortuneInstaCard";
import { DailyFortuneInstaCardWithPhoto } from "@/components/home/pet-fortune/DailyFortuneInstaCardWithPhoto";
import type { PetDailyFortune, PetFortunePetMeta } from "@/lib/saju/pet-daily-fortune";
import {
  canShareImageFiles,
  captureDailyFortuneInstaCard,
  shareDailyFortuneInstaCardFromBlob,
} from "@/lib/share/daily-fortune-insta-card";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const [compositeUrl, setCompositeUrl] = useState<string | null>(null);
  const [compositeBlob, setCompositeBlob] = useState<Blob | null>(null);
  const [compositeError, setCompositeError] = useState(false);
  const [photoCardReady, setPhotoCardReady] = useState(false);

  const hasPhoto = Boolean(pet.photoUrl);

  useEffect(() => {
    setShareCapable(canShareImageFiles());
  }, []);

  useEffect(() => {
    setPhotoCardReady(false);
  }, [pet.id, pet.photoUrl]);

  const handlePhotoReady = useCallback(() => {
    setPhotoCardReady(true);
  }, []);

  const buildComposite = useCallback(async () => {
    if (!cardRef.current) return null;

    const blob = await captureDailyFortuneInstaCard(cardRef.current);
    return blob;
  }, []);

  useEffect(() => {
    if (!hasPhoto) {
      setCompositeError(false);
      setCompositeUrl(null);
      setCompositeBlob(null);
      return;
    }

    if (!photoCardReady) return;

    let cancelled = false;
    let objectUrl: string | null = null;

    async function run() {
      setCompositeError(false);
      setCompositeUrl(null);
      setCompositeBlob(null);

      try {
        const blob = await buildComposite();
        if (cancelled || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setCompositeBlob(blob);
        setCompositeUrl(objectUrl);
      } catch {
        if (!cancelled) setCompositeError(true);
      }
    }

    void run();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [
    buildComposite,
    fortune.dateLabel,
    fortune.lucky[0]?.text,
    fortune.title,
    hasPhoto,
    isKo,
    pet.dominantElement,
    pet.id,
    pet.photoUrl,
    photoCardReady,
  ]);

  async function handleInstagramShare() {
    setBusy(true);
    setStatus(null);
    try {
      let blob = compositeBlob;
      if (!blob) {
        blob = await buildComposite();
      }
      if (!blob) {
        setStatus(t("instagramShareFailed"));
        return;
      }

      const result = await shareDailyFortuneInstaCardFromBlob(blob, pet.name);
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
      {/* Off-screen only — no opacity:0 (html2canvas would paint photo as invisible). */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 -z-50"
        style={{ left: -9999, width: 1080, height: 1080 }}
      >
        {hasPhoto && pet.photoUrl ? (
          <DailyFortuneInstaCardWithPhoto
            ref={cardRef}
            pet={pet}
            fortune={fortune}
            isKo={isKo}
            photoUrl={pet.photoUrl}
            onPhotoReady={handlePhotoReady}
          />
        ) : (
          <DailyFortuneInstaCard ref={cardRef} pet={pet} fortune={fortune} isKo={isKo} />
        )}
      </div>

      <div className="mx-auto w-full max-w-md px-1">
        <div className="mb-3 overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-100 shadow-sm">
          {hasPhoto ? (
            compositeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={compositeUrl} alt="" className="aspect-square w-full object-cover" />
            ) : compositeError ? (
              <p className="px-4 py-8 text-center text-xs font-semibold text-stone-600">
                {isKo ? "미리보기를 불러오지 못했어요." : "Could not load preview."}
              </p>
            ) : (
              <p className="px-4 py-8 text-center text-xs font-semibold text-stone-500">
                {isKo ? "카드 미리보기 준비 중…" : "Preparing card preview…"}
              </p>
            )
          ) : (
            <div className="aspect-square w-full overflow-hidden">
              <div
                className="origin-top-left scale-[0.37]"
                style={{ width: 1080, height: 1080 }}
              >
                <DailyFortuneInstaCard pet={pet} fortune={fortune} isKo={isKo} />
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={busy || (hasPhoto && !compositeBlob && !photoCardReady)}
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
