const KO_MESSAGES: Record<string, string> = {
  "Invalid birth date or time": "생년월일과 출생 시간을 다시 확인해 주세요.",
  "Invalid birth date.": "생년월일을 연·월·일까지 모두 선택해 주세요.",
  "birthDate required.": "생년월일을 입력해 주세요.",
  "privacyConsent required.": "개인정보 수집·이용에 동의해 주세요.",
  "Valid email required.": "올바른 이메일을 입력해 주세요.",
  "personName required.": "닉네임을 입력해 주세요.",
  "Demo checkout is disabled.": "데모 결제가 비활성화되어 있습니다.",
  "Supabase is not configured.": "Supabase 설정이 필요합니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 를 넣고 서버를 재시작하세요.",
  "Demo checkout failed.": "데모 결제에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  "Failed to create human premium report.": "리포트 저장에 실패했습니다. DB 마이그레이션을 확인해 주세요.",
  "duplicate key value violates unique constraint \"human_premium_reports_checkout_session_id_key\"":
    "이미 생성된 리포트로 이동합니다.",
  cart_items_already_purchased: "이미 구매한 리포트는 장바구니에 담을 수 없어요. 보관함에서 확인해 주세요.",
  login_required: "로그인이 필요해요.",
  daily_quota_exceeded: "오늘의 무료 리포트를 이미 사용하셨어요.",
  RESEND_NOT_CONFIGURED: "이메일 발송 설정이 아직 준비되지 않았어요.",
  EMAIL_NOT_ON_FILE: "결제 시 입력한 이메일이 없어 발송할 수 없어요.",
  "RESEND_API_KEY is not configured.": "이메일 발송 설정이 아직 준비되지 않았어요.",
};

export function formatHumanPremiumError(message: string, locale: "ko" | "en"): string {
  if (locale !== "ko") return message;
  return KO_MESSAGES[message] ?? message;
}
