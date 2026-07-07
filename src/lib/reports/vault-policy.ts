import type { Pet, SajuResultRow, SajuType } from "@/lib/supabase/types";

export const VAULT_FREE_RETENTION_DAYS = 30;

const VAULT_PREMIUM_SAJU_TYPES = new Set<SajuType>([
  "mbti",
  "zodiac",
  "compatibility",
  "premium",
]);

export type VaultTier = "premium" | "free";

export interface VaultReportMeta {
  tier: VaultTier;
  daysRemaining: number | null;
}

export type VaultReportRow = SajuResultRow & {
  pet: Pet | null;
  vault: VaultReportMeta;
};

export function isVaultPremiumReport(report: {
  saju_type: SajuType;
  is_premium: boolean;
}): boolean {
  return report.is_premium || VAULT_PREMIUM_SAJU_TYPES.has(report.saju_type);
}

export function vaultTierForReport(report: {
  saju_type: SajuType;
  is_premium: boolean;
}): VaultTier {
  return isVaultPremiumReport(report) ? "premium" : "free";
}

export function vaultDaysRemaining(createdAt: string, now = new Date()): number {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return 0;

  const expiresAt = new Date(created);
  expiresAt.setDate(expiresAt.getDate() + VAULT_FREE_RETENTION_DAYS);

  const ms = expiresAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export function isVisibleInVault(report: {
  saju_type: SajuType;
  is_premium: boolean;
  created_at: string;
}): boolean {
  if (isVaultPremiumReport(report)) return true;
  return vaultDaysRemaining(report.created_at) > 0;
}

export function vaultMetaForReport(report: {
  saju_type: SajuType;
  is_premium: boolean;
  created_at: string;
}): VaultReportMeta {
  const tier = vaultTierForReport(report);
  return {
    tier,
    daysRemaining: tier === "free" ? vaultDaysRemaining(report.created_at) : null,
  };
}

export const VAULT_TYPE_LABELS = {
  ko: {
    basic: "기본 사주",
    mbti: "상세 MBTI",
    zodiac: "별자리",
    compatibility: "궁합",
    premium: "프리미엄 리포트",
    character_card: "캐릭터",
    daily: "데일리",
  },
  en: {
    basic: "Basic K-Saju",
    mbti: "Detailed MBTI",
    zodiac: "Zodiac",
    compatibility: "Bond",
    premium: "Premium report",
    character_card: "Character",
    daily: "Daily",
  },
} as const;

export function vaultTypeLabel(
  sajuType: SajuType,
  locale: "ko" | "en",
  isPremiumFlag = false
): string {
  const labels = VAULT_TYPE_LABELS[locale];
  if (isPremiumFlag && sajuType === "basic") {
    return labels.premium;
  }
  return labels[sajuType as keyof typeof labels] ?? sajuType;
}
