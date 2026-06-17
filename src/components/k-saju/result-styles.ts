import type { ElementKey } from "@/lib/saju/types";

export const ELEMENT_ACCENT: Record<
  ElementKey,
  { pill: string; ring: string; bar: string; cardBorder: string; card: string; title: string }
> = {
  wood: {
    pill: "border-mok-green/30 bg-element-wood text-[#2F6B4F]",
    ring: "bg-element-wood ring-mok-green/30",
    bar: "bg-mok-green",
    cardBorder: "border-mok-green/35",
    card: "border-mok-green/30 bg-element-wood",
    title: "text-mok-green",
  },
  fire: {
    pill: "border-hwa-red/30 bg-element-fire text-[#9E3F3F]",
    ring: "bg-element-fire ring-hwa-red/30",
    bar: "bg-hwa-red",
    cardBorder: "border-hwa-red/35",
    card: "border-hwa-red/30 bg-element-fire",
    title: "text-hwa-red",
  },
  earth: {
    pill: "border-to-yellow/35 bg-element-earth text-[#7A5A32]",
    ring: "bg-element-earth ring-to-yellow/35",
    bar: "bg-to-yellow",
    cardBorder: "border-to-yellow/40",
    card: "border-to-yellow/35 bg-element-earth",
    title: "text-to-yellow",
  },
  metal: {
    pill: "border-geum-silver/35 bg-element-metal text-[#5C574F]",
    ring: "bg-element-metal ring-geum-silver/35",
    bar: "bg-geum-silver",
    cardBorder: "border-geum-silver/40",
    card: "border-geum-silver/35 bg-element-metal",
    title: "text-geum-silver",
  },
  water: {
    pill: "border-su-blue/30 bg-element-water text-[#2E5570]",
    ring: "bg-element-water ring-su-blue/30",
    bar: "bg-su-blue",
    cardBorder: "border-su-blue/35",
    card: "border-su-blue/30 bg-element-water",
    title: "text-su-blue",
  },
};
