import type { ReactNode } from "react";

export const COMMUNITY_SOLID_SURFACE_CLASS =
  "rounded-[2rem] border border-white/35 bg-white/95 shadow-[0_12px_40px_rgba(15,19,79,0.16)]";

export const COMMUNITY_SOLID_CARD_CLASS =
  "rounded-[2rem] border border-white/35 bg-white/95 shadow-[0_10px_30px_rgba(15,19,79,0.12)]";

export const COMMUNITY_CHIP_IDLE_CLASS =
  "whitespace-nowrap rounded-full border border-white/35 bg-white/95 px-5 py-2.5 text-xs font-bold text-plum/80 shadow-sm transition hover:bg-white";

export const COMMUNITY_CHIP_IDLE_SM_CLASS =
  "whitespace-nowrap rounded-full border border-white/35 bg-white/95 px-4 py-2 text-xs font-bold text-plum/75 shadow-sm transition hover:bg-white";

export const COMMUNITY_DETAIL_META_CLASS =
  "flex flex-wrap items-center gap-2 text-xs font-semibold text-plum/70";

export const COMMUNITY_DETAIL_BODY_CLASS =
  "whitespace-pre-wrap rounded-[1.25rem] bg-sand/45 px-5 py-5 text-sm leading-relaxed text-ink";

export function CommunityDetailSurface({ children }: { children: ReactNode }) {
  return <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} p-6 md:p-8`}>{children}</div>;
}
