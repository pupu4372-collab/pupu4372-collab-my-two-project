/** Shared 12 지지 birth-time dropdown (KST 30-min windows). */
export const BIRTH_TIME_OPTIONS = [
  { value: "unknown", label: "모름(I don't know)" },
  { value: "23:30", label: "자시(Rat) 23:30 ~ 01:30 🐭" },
  { value: "01:30", label: "축시(Ox) 01:30 ~ 03:30 🐮" },
  { value: "03:30", label: "인시(Tiger) 03:30 ~ 05:30 🐯" },
  { value: "05:30", label: "묘시(Rabbit) 05:30 ~ 07:30 🐰" },
  { value: "07:30", label: "진시(Dragon) 07:30 ~ 09:30 🐲" },
  { value: "09:30", label: "사시(Snake) 09:30 ~ 11:30 🐍" },
  { value: "11:30", label: "오시(Horse) 11:30 ~ 13:30 🐴" },
  { value: "13:30", label: "미시(Sheep) 13:30 ~ 15:30 🐑" },
  { value: "15:30", label: "신시 (Monkey) 15:30 ~ 17:30 🐵" },
  { value: "17:30", label: "유시(Rooster) 17:30 ~ 19:30 🐔" },
  { value: "19:30", label: "술시(Dog) 19:30 ~ 21:30 🐶" },
  { value: "21:30", label: "해시(Pig) 21:30 ~ 23:30 🐷" },
] as const;

const EN_BIRTH_TIME_LABELS: Record<string, string> = {
  unknown: "Unknown",
  "23:30": "Rat hour 23:30 ~ 01:30",
  "01:30": "Ox hour 01:30 ~ 03:30",
  "03:30": "Tiger hour 03:30 ~ 05:30",
  "05:30": "Rabbit hour 05:30 ~ 07:30",
  "07:30": "Dragon hour 07:30 ~ 09:30",
  "09:30": "Snake hour 09:30 ~ 11:30",
  "11:30": "Horse hour 11:30 ~ 13:30",
  "13:30": "Sheep hour 13:30 ~ 15:30",
  "15:30": "Monkey hour 15:30 ~ 17:30",
  "17:30": "Rooster hour 17:30 ~ 19:30",
  "19:30": "Dog hour 19:30 ~ 21:30",
  "21:30": "Pig hour 21:30 ~ 23:30",
};

export function getBirthTimeOptionLabel(
  option: (typeof BIRTH_TIME_OPTIONS)[number],
  locale: "ko" | "en"
): string {
  return locale === "en" ? EN_BIRTH_TIME_LABELS[option.value] ?? option.label : option.label;
}

export function parseBirthTimeSelect(value: string): {
  birthTime: string | null;
  birthTimeUnknown: boolean;
} {
  if (value === "unknown") {
    return { birthTime: null, birthTimeUnknown: true };
  }
  return { birthTime: value, birthTimeUnknown: false };
}
