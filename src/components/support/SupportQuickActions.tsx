"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";
import { SupportInquiryForm } from "./SupportInquiryForm";
import { SupportInquiryHistory } from "./SupportInquiryHistory";

type ActivePanel = "form" | "history" | null;

const supportCards = [
  {
    icon: "📘",
    koTitle: "이용방법",
    enTitle: "Guide",
    koDesc: "사주 분석 및 커뮤니티 가이드",
    enDesc: "Saju and community guide",
    href: "/onboarding" as const,
    tone: {
      card: "border-[#d9c7e6] bg-[#f3edf8] hover:bg-[#fbf7ff]",
      active: "border-[#c5b0d8] bg-[#fbf7ff]",
      icon: "bg-[#e4d7ee] text-[#5a3a6f]",
    },
  },
  {
    icon: "💭",
    koTitle: "1:1 문의",
    enTitle: "1:1 Inquiry",
    koDesc: "사이트 내부 문의로 접수",
    enDesc: "Submit inside this site",
    panel: "form" as const,
    tone: {
      card: "border-[#e9bbc9] bg-[#fff0f4] hover:bg-[#fff8fa]",
      active: "border-[#dfa8bc] bg-[#fff8fa]",
      icon: "bg-[#f5dbe4] text-[#7a4058]",
    },
  },
  {
    icon: "↻",
    koTitle: "문의내역",
    enTitle: "History",
    koDesc: "나의 문의 진행 현황 확인",
    enDesc: "Check your inquiry status",
    panel: "history" as const,
    tone: {
      card: "border-[#c5c8d6] bg-[#eef0f7] hover:bg-[#f8f9fc]",
      active: "border-[#b5b9ca] bg-[#f8f9fc]",
      icon: "bg-[#dde0ea] text-[#4c5268]",
    },
  },
] as const;

export function SupportQuickActions() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  return (
    <>
      <section className="relative z-10 mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
        {supportCards.map((card) => {
          const desc = isKo ? card.koDesc : card.enDesc;
          const isActive = "panel" in card && activePanel === card.panel;
          const className = `rounded-[1.5rem] border p-5 text-center shadow-[0_12px_28px_rgba(61,42,74,0.14)] transition hover:-translate-y-0.5 md:p-7 ${
            isActive ? card.tone.active : card.tone.card
          }`;
          const content = (
            <>
              <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-lg shadow-[0_10px_24px_rgba(61,42,74,0.12)] ${card.tone.icon}`}>
                {card.icon}
              </span>
              <h2 className="mt-4 text-sm font-extrabold text-primary md:mt-5 md:text-lg">{isKo ? card.koTitle : card.enTitle}</h2>
              {desc && <p className="mt-2 text-[11px] font-extrabold leading-5 text-plum md:text-xs">{desc}</p>}
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
