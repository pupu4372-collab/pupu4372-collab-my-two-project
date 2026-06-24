const KO_MESSAGES: Record<string, string> = {
  "Invalid birth date or time": "생년월일과 출생 시간을 다시 확인해 주세요.",
  "Invalid birth date.": "생년월일을 연·월·일까지 모두 선택해 주세요.",
  "birthDate required.": "생년월일을 입력해 주세요.",
  "privacyConsent required.": "개인정보 수집·이용에 동의해 주세요.",
  "Valid email required.": "올바른 이메일을 입력해 주세요.",
  "personName required.": "이름을 입력해 주세요.",
};

export function formatHumanPremiumError(message: string, locale: "ko" | "en"): string {
  if (locale !== "ko") return message;
  return KO_MESSAGES[message] ?? message;
}
