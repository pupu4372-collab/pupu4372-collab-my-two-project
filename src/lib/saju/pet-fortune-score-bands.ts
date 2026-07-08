export type FortuneStatCategory = "health" | "activity" | "appetite" | "sleep";

type Locale = "ko" | "en";

/** Six score tiers — 70%대도 구간이 갈리도록 촘촘히 나눔. */
type ScoreTier = "peak" | "high" | "good" | "steady" | "calm" | "low";

function scoreToTier(score: number): ScoreTier {
  if (score >= 92) return "peak";
  if (score >= 82) return "high";
  if (score >= 72) return "good";
  if (score >= 62) return "steady";
  if (score >= 52) return "calm";
  return "low";
}

const STAT_BAND_COPY: Record<FortuneStatCategory, Record<Locale, Record<ScoreTier, string>>> = {
  health: {
    ko: {
      peak: "컨디션 최상, 활력이 넘쳐요",
      high: "몸이 가볍고 건강해 보여요",
      good: "전반적으로 건강한 하루예요",
      steady: "무리 없이 컨디션을 지켜요",
      calm: "조용히 쉬며 회복하는 날",
      low: "컨디션 관리에 신경 써 주세요",
    },
    en: {
      peak: "Peak condition and bright energy",
      high: "Looking light and healthy today",
      good: "A generally healthy day overall",
      steady: "Steady condition, no strain needed",
      calm: "A quiet day to rest and recover",
      low: "Watch comfort and recovery today",
    },
  },
  activity: {
    ko: {
      peak: "에너지가 폭발, 놀이 최고!",
      high: "활동량이 크게 올라가요",
      good: "적당히 뛰어놀기 좋은 날",
      steady: "가벼운 산책 정도가 딱이에요",
      calm: "느긋하게 쉬는 편이 좋아요",
      low: "무리한 운동은 피해 주세요",
    },
    en: {
      peak: "Bursting energy — playtime rocks!",
      high: "Activity level runs high today",
      good: "Great for moderate play and walks",
      steady: "Light walks are just right",
      calm: "Better to rest at an easy pace",
      low: "Skip strenuous exercise today",
    },
  },
  appetite: {
    ko: {
      peak: "식욕 최고, 밥 시간이 기다려져요",
      high: "밥을 잘 먹고 기분도 좋아요",
      good: "평소보다 식욕이 괜찮은 편",
      steady: "적당한 양으로 천천히 먹어요",
      calm: "입맛이 조금 가볍은 날",
      low: "소량·부드러운 간식 위주로",
    },
    en: {
      peak: "Huge appetite — mealtime joy!",
      high: "Eating well with good spirits",
      good: "Appetite is fairly solid today",
      steady: "Eat slowly in moderate portions",
      calm: "A lighter appetite kind of day",
      low: "Try small, gentle snacks only",
    },
  },
  sleep: {
    ko: {
      peak: "숙면 최고, 깊이 잘 자요",
      high: "낮잠도 편안하고 숙면해요",
      good: "잠 패턴이 안정적인 하루",
      steady: "평소처럼 규칙적으로 쉬어요",
      calm: "잠이 조금 얕을 수 있어요",
      low: "조용한 환경에서 휴식을",
    },
    en: {
      peak: "Deep, restful sleep today",
      high: "Naps feel easy and restorative",
      good: "Sleep rhythm stays stable",
      steady: "Rest on your usual routine",
      calm: "Sleep may feel a bit light",
      low: "Prioritize quiet rest time",
    },
  },
};

export function fortuneStatScoreBand(
  score: number,
  category: FortuneStatCategory,
  isKo: boolean
): string {
  const locale: Locale = isKo ? "ko" : "en";
  const tier = scoreToTier(score);
  return STAT_BAND_COPY[category][locale][tier];
}

export function categoryKeyFromLabels(label: string): FortuneStatCategory | null {
  if (label === "건강운" || label === "Health") return "health";
  if (label === "활동운" || label === "Activity") return "activity";
  if (label === "식욕운" || label === "Appetite") return "appetite";
  if (label === "수면운" || label === "Sleep") return "sleep";
  return null;
}
