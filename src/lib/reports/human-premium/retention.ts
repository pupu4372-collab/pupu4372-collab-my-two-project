export const HUMAN_PREMIUM_WEB_RETENTION_DAYS = 30;

export function humanPremiumWebExpiresAt(from = Date.now()): string {
  return new Date(from + HUMAN_PREMIUM_WEB_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

export function humanPremiumRetentionNotice(locale: "ko" | "en"): string {
  return locale === "ko"
    ? `보안을 위해 웹 리포트는 결제일로부터 ${HUMAN_PREMIUM_WEB_RETENTION_DAYS}일간만 보관됩니다. PDF 저장·링크 복사로 미리 보관해 주세요.`
    : `For security, web reports are kept for ${HUMAN_PREMIUM_WEB_RETENTION_DAYS} days after purchase. Save a PDF or copy the link.`;
}
