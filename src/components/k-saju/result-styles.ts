import type { ElementKey } from "@/lib/saju/types";

export const ELEMENT_ACCENT: Record<
  ElementKey,
  { pill: string; ring: string; bar: string; cardBorder: string }
> = {
  wood: {
    pill: "border-mok-green/30 bg-mint/50 text-mok-green",
    ring: "bg-mint/40 ring-mok-green/30",
    bar: "bg-mok-green",
    cardBorder: "border-mok-green",
  },
  fire: {
    pill: "border-hwa-red/30 bg-blush/60 text-hwa-red",
    ring: "bg-blush/60 ring-hwa-red/30",
    bar: "bg-hwa-red",
    cardBorder: "border-hwa-red",
  },
  earth: {
    pill: "border-to-yellow/30 bg-sand/70 text-to-yellow",
    ring: "bg-sand/70 ring-to-yellow/30",
    bar: "bg-to-yellow",
    cardBorder: "border-to-yellow",
  },
  metal: {
    pill: "border-geum-white/40 bg-white/70 text-su-black",
    ring: "bg-white/70 ring-geum-white/40",
    bar: "bg-geum-white",
    cardBorder: "border-geum-white",
  },
  water: {
    pill: "border-channel-dog/30 bg-mint/40 text-channel-dog",
    ring: "bg-mint/40 ring-channel-dog/30",
    bar: "bg-channel-dog",
    cardBorder: "border-channel-dog",
  },
};
