export const COUNTRY_OPTIONS = [
  { code: "KR", emoji: "🇰🇷", ko: "대한민국", en: "South Korea" },
  { code: "US", emoji: "🇺🇸", ko: "미국", en: "United States" },
  { code: "JP", emoji: "🇯🇵", ko: "일본", en: "Japan" },
  { code: "CN", emoji: "🇨🇳", ko: "중국", en: "China" },
  { code: "TW", emoji: "🇹🇼", ko: "대만", en: "Taiwan" },
  { code: "HK", emoji: "🇭🇰", ko: "홍콩", en: "Hong Kong" },
  { code: "SG", emoji: "🇸🇬", ko: "싱가포르", en: "Singapore" },
  { code: "TH", emoji: "🇹🇭", ko: "태국", en: "Thailand" },
  { code: "VN", emoji: "🇻🇳", ko: "베트남", en: "Vietnam" },
  { code: "PH", emoji: "🇵🇭", ko: "필리핀", en: "Philippines" },
  { code: "ID", emoji: "🇮🇩", ko: "인도네시아", en: "Indonesia" },
  { code: "MY", emoji: "🇲🇾", ko: "말레이시아", en: "Malaysia" },
  { code: "AU", emoji: "🇦🇺", ko: "호주", en: "Australia" },
  { code: "CA", emoji: "🇨🇦", ko: "캐나다", en: "Canada" },
  { code: "GB", emoji: "🇬🇧", ko: "영국", en: "United Kingdom" },
  { code: "DE", emoji: "🇩🇪", ko: "독일", en: "Germany" },
  { code: "FR", emoji: "🇫🇷", ko: "프랑스", en: "France" },
  { code: "BR", emoji: "🇧🇷", ko: "브라질", en: "Brazil" },
  { code: "MX", emoji: "🇲🇽", ko: "멕시코", en: "Mexico" },
  { code: "OTHER", emoji: "🌍", ko: "기타 국가", en: "Other" },
] as const;

export type CountryCode = (typeof COUNTRY_OPTIONS)[number]["code"];

export function normalizeCountryCode(value?: string | null): CountryCode | null {
  if (!value) return null;
  const code = value.trim().toUpperCase();
  return COUNTRY_OPTIONS.some((country) => country.code === code) ? (code as CountryCode) : null;
}

export function getCountryOption(code?: string | null) {
  const normalized = normalizeCountryCode(code);
  return COUNTRY_OPTIONS.find((country) => country.code === normalized) ?? null;
}

export function getCountryLabel(code: string | null | undefined, locale: string) {
  const country = getCountryOption(code);
  if (!country) return null;
  return `${country.emoji} ${locale === "en" ? country.en : country.ko}`;
}
