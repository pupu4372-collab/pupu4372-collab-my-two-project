import { ELEMENT_META, ELEMENT_ORDER, formatElementLabelForLocale } from "@/lib/saju/elements";
import { ELEMENT_ACCENT } from "@/components/k-saju/result-styles";

const ELEMENT_BLURB = {
  ko: {
    wood: "활기차고 성장을 상징하는 에너지",
    fire: "열정적이고 화려함을 상징하는 에너지",
    earth: "믿음직하고 포용력을 상징하는 에너지",
    metal: "냉철하고 결단력을 상징하는 에너지",
    water: "지혜롭고 유연함을 상징하는 에너지",
  },
  en: {
    wood: "Growth, flexibility, and fresh starts",
    fire: "Passion, expression, and bright energy",
    earth: "Stability, patience, and grounding",
    metal: "Focus, boundaries, and clarity",
    water: "Intuition, calm, and adaptability",
  },
} as const;

interface SajuElementsStripProps {
  isKo: boolean;
}

export function SajuElementsStrip({ isKo }: SajuElementsStripProps) {
  const blurbs = ELEMENT_BLURB[isKo ? "ko" : "en"];
  const locale = isKo ? "ko" : "en";

  return (
    <section className="space-y-6">
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-extrabold text-primary">
          {isKo ? "오행(五行)으로 보는 아이의 기운" : "Five elements at a glance"}
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          {isKo
            ? "만물을 구성하는 다섯 가지 기운, 우리 아이는 어디에 해당할까요?"
            : "Wood, fire, earth, metal, and water — which vibe fits your pet?"}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {ELEMENT_ORDER.map((key) => {
          const meta = ELEMENT_META[key];
          const accent = ELEMENT_ACCENT[key];
          return (
            <div key={key} className={`rounded-3xl border p-4 text-center ${accent.pill}`}>
              <div
                className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white ${accent.bar}`}
              >
                {isKo ? meta.hanja : meta.meaning.charAt(0)}
              </div>
              <h3 className="text-sm font-bold">
                {formatElementLabelForLocale(key, locale)}
              </h3>
              <p className="mt-2 text-xs leading-relaxed opacity-80">{blurbs[key]}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
