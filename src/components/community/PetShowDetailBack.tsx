"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const FALLBACK_HREF = "/community/pet-show/ranking";

export function PetShowDetailBack() {
  const router = useRouter();
  const t = useTranslations("petshow");

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(FALLBACK_HREF);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="mb-4 inline-flex items-center gap-1 text-sm font-extrabold text-plum/75 transition hover:text-channel-community"
    >
      <span aria-hidden>&lt;</span>
      {t("backToList")}
    </button>
  );
}
