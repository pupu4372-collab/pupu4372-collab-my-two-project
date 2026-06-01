import { ChannelShell } from "@/components/layout/ChannelShell";
import { SajuHubGrid } from "@/components/k-saju/SajuHubGrid";
import { getLocale, getTranslations } from "next-intl/server";

export default async function SajuHubPage() {
  const t = await getTranslations("saju");
  const locale = await getLocale();
  const isKo = locale === "ko";

  return (
    <ChannelShell theme="saju" title={t("hubTitle")} subtitle={t("hubSubtitle")}>
      <SajuHubGrid
        labels={{
          basic: isKo ? "K-사주 · 띠별 운세" : "K-Saju · Zodiac year",
          basicDesc: isKo ? "홈에서 반려동물 생일로 만세력 분석" : "Manseryeok reading from Home with your pet's birthday",
          zodiac: isKo ? "별자리 운세" : "Western zodiac",
          zodiacDesc: isKo ? "서양 별자리와 오행이 만나는 오늘의 운세" : "Today's fortune with zodiac and five elements",
          compatibility: isKo ? "펫 · 집사 궁합" : "Pet & owner match",
          compatibilityDesc: isKo ? "오행 상생·상극으로 보는 인연 지수" : "Bond score through elemental harmony",
          premium: isKo ? "Premium 리포트" : "Premium report",
          premiumDesc: isKo ? "평생 사주 스토리와 케어 가이드" : "Lifetime saju story and care guide",
        }}
      />
    </ChannelShell>
  );
}
