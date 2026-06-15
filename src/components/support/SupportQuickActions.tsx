"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";
import { SupportInquiryForm } from "./SupportInquiryForm";
import { SupportInquiryHistory } from "./SupportInquiryHistory";

type ActivePanel = "form" | "history" | null;

const supportCards = [
  {
    icon: "📖",
    koTitle: "이용방법",
    enTitle: "Guide",
    koDesc: "사주 분석 및 커뮤니티 가이드",
    enDesc: "Saju and community guide",
    href: "/onboarding" as const,
  },
  {
    icon: "💬",
    koTitle: "1:1 문의",
    enTitle: "1:1 Inquiry",
    koDesc: "",
    enDesc: "",
    panel: "form" as const,
  },
  {
    icon: "✉️",
    koTitle: "메일문의",
    enTitle: "Email",
    koDesc: "사이트 내부 문의로 접수",
    enDesc: "Submit inside this site",
    panel: "form" as const,
  },
  {
    icon: "↺",
    koTitle: "문의내역",
    enTitle: "History",
    koDesc: "나의 문의 진행 현황 확인",
    enDesc: "Check your inquiry status",
    panel: "history" as const,
  },
] as const;

export function SupportQuickActions() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  return (
    <>
      <section className="relative z-10 mt-10 grid gap-5 md:grid-cols-4">
        {supportCards.map((card) => {
          const desc = isKo ? card.koDesc : card.enDesc;
          const isActive = "panel" in card && activePanel === card.panel;
          const className = `rounded-[1.5rem] border p-7 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_42px_-34px_rgba(0,0,0,0.55)] backdrop-blur-xl transition ${
            isActive
              ? "border-[#ffe6c7]/80 bg-[#fff4e7]/28"
              : "border-[#ffe6c7]/45 bg-[#fff4e7]/18 hover:bg-[#fff4e7]/28"
          }`;
          const content = (
            <>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1d8]/85 text-2xl text-[#5c3d2e] shadow-[0_0_24px_rgba(255,230,199,0.22)]">
                {card.icon}
              </span>
              <h2 className="mt-5 text-lg font-extrabold text-white">{isKo ? card.koTitle : card.enTitle}</h2>
              {desc && <p className="mt-2 text-xs font-bold leading-5 text-white/82">{desc}</p>}
            </>
          );

          return "href" in card ? (
            <Link key={card.koTitle} href={card.href} className={className}>
              {content}
            </Link>
          ) : (
            <button
              key={card.koTitle}
              type="button"
              onClick={() => setActivePanel((current) => (current === card.panel ? null : card.panel))}
              className={className}
            >
              {content}
            </button>
          );
        })}
      </section>

      {activePanel === "form" && <SupportInquiryForm />}
      {activePanel === "history" && <SupportInquiryHistory />}
    </>
  );
}
