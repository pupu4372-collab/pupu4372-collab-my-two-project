"use client";

import type { PetPremiumSectionCompletion } from "@/lib/reports/pet-premium/section-completion";
import type { Locale } from "@/lib/saju/types";
import { useState } from "react";

const COPY = {
  ko: {
    intro: "세 가지 프리미엄 케어 가이드를 한 권의 PDF로 저장해 보세요.",
    introReady: "세 가지 케어 가이드를 한 권의 PDF로 저장할 수 있어요.",
    progress: (done: number, total: number) =>
      `${done}/${total} 완료 — 모두 완료하면 저장할 수 있어요`,
    button: "PDF로 저장하기",
    loading: "PDF 만드는 중…",
    fail: "PDF 저장에 실패했어요. 잠시 후 다시 시도해 주세요.",
    premiumRequired: "프리미엄 결제가 필요해요.",
    sectionsIncomplete: "세 가지 항목을 모두 완료한 뒤 저장해 주세요.",
  },
  en: {
    intro: "Save all three premium care guides as one PDF.",
    introReady: "All three care guides are ready to save as one PDF.",
    progress: (done: number, total: number) =>
      `${done}/${total} complete — finish all sections to save`,
    button: "Save as PDF",
    loading: "Creating PDF…",
    fail: "Could not save the PDF. Please try again.",
    premiumRequired: "Premium unlock required.",
    sectionsIncomplete: "Complete all three sections before saving.",
  },
} as const;

function parseFilenameFromDisposition(header: string | null): string | null {
  if (!header) return null;
  const utf8 = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1]);
    } catch {
      return utf8[1];
    }
  }
  const ascii = header.match(/filename="([^"]+)"/i);
  return ascii?.[1] ?? null;
}

type Props = {
  locale: Locale;
  petId: string;
  accessToken?: string | null;
  completion: PetPremiumSectionCompletion;
};

export function PetPremiumPdfSaveRow({ locale, petId, accessToken, completion }: Props) {
  const t = COPY[locale];
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const allComplete = completion.allComplete;

  async function handleDownload() {
    if (!allComplete || busy) return;

    setBusy(true);
    setStatus(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const res = await fetch("/api/saju/premium/pdf", {
        method: "POST",
        headers,
        body: JSON.stringify({ petId, locale }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (data.error === "premium_required") {
          setStatus(t.premiumRequired);
        } else if (data.error === "sections_incomplete") {
          setStatus(t.sectionsIncomplete);
        } else {
          setStatus(t.fail);
        }
        return;
      }

      const blob = await res.blob();
      const filename =
        parseFilenameFromDisposition(res.headers.get("Content-Disposition")) ?? "pet-premium-care.pdf";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setStatus(t.fail);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-[1.5rem] border-2 border-channel-saju/30 bg-white p-5 shadow-lg">
      <p className="text-center text-sm font-extrabold leading-6 text-primary">
        {allComplete ? t.introReady : t.intro}
      </p>
      {!allComplete ? (
        <p className="mt-2 text-center text-xs font-semibold text-plum/75">
          {t.progress(completion.completedCount, 3)}
        </p>
      ) : null}
      <div className="mt-4">
        <button
          type="button"
          disabled={busy || !allComplete}
          onClick={() => void handleDownload()}
          className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-channel-saju/40 bg-mint/40 px-4 py-3.5 text-sm font-extrabold text-primary shadow-sm transition hover:border-channel-saju hover:bg-mint/60 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="text-lg leading-none" aria-hidden>
            📄
          </span>
          {busy ? t.loading : t.button}
        </button>
      </div>
      {status && <p className="mt-3 text-center text-[11px] font-semibold text-plum">{status}</p>}
    </div>
  );
}
