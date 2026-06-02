import { Link } from "@/i18n/navigation";

interface OnboardingRoadmapProps {
  locale: string;
}

const COPY = {
  ko: {
    eyebrow: "Success Journey",
    title: "K-Saju Pet 시작 로드맵",
    subtitle: "펫 프로필 등록부터 사주, 궁합, Pet Show까지 이어지는 핵심 흐름을 한눈에 확인하세요.",
    skip: "홈으로 바로가기",
    start: "지금 시작하기",
    steps: [
      {
        label: "Step 01",
        title: "우리 아이 프로필 등록",
        body: "이름, 생년월일, 성별을 입력하면 사주와 프로필이 함께 연결됩니다.",
        icon: "🐾",
      },
      {
        label: "Step 02",
        title: "신비로운 사주 분석",
        body: "오행과 만세력으로 아이의 타고난 기운과 성향을 확인하세요.",
        icon: "✨",
      },
      {
        label: "Step 03",
        title: "집사와의 궁합 확인",
        body: "서로의 오행 관계를 비교해 더 잘 맞는 케어 방법을 찾습니다.",
        icon: "💞",
      },
      {
        label: "Step 04",
        title: "우리아이 자랑하기",
        body: "Pet Show에 사진을 올리고 주간 랭킹과 커뮤니티 반응을 확인하세요.",
        icon: "🏆",
      },
    ],
  },
  en: {
    eyebrow: "Success Journey",
    title: "K-Saju Pet Roadmap",
    subtitle: "See the core flow from pet profiles to saju readings, compatibility, and Pet Show.",
    skip: "Go home",
    start: "Start now",
    steps: [
      {
        label: "Step 01",
        title: "Register your pet",
        body: "Connect name, birth data, and profile info to future readings.",
        icon: "🐾",
      },
      {
        label: "Step 02",
        title: "Read their K-Saju",
        body: "Discover your pet's five-element vibe and personality story.",
        icon: "✨",
      },
      {
        label: "Step 03",
        title: "Check compatibility",
        body: "Compare elemental harmony between pet and parent for care tips.",
        icon: "💞",
      },
      {
        label: "Step 04",
        title: "Join Pet Show",
        body: "Share photos, collect reactions, and try weekly rankings.",
        icon: "🏆",
      },
    ],
  },
} as const;

export function OnboardingRoadmap({ locale }: OnboardingRoadmapProps) {
  const t = COPY[locale === "en" ? "en" : "ko"];

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-fixed via-surface to-secondary-fixed/80 px-5 py-10 shadow-sm md:px-10 md:py-14">
      <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/35 blur-3xl" aria-hidden />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-5xl text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-primary/70">{t.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-primary md:text-5xl">{t.title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-on-surface-variant md:text-lg">{t.subtitle}</p>
      </div>

      <div className="relative mt-12 grid gap-5 md:grid-cols-4">
        <div className="absolute left-[12%] right-[12%] top-20 hidden border-t-2 border-dashed border-primary/15 md:block" aria-hidden />
        {t.steps.map((step, index) => (
          <article
            key={step.label}
            className={`glass-card relative rounded-[2rem] p-5 text-center shadow-sm transition hover:-translate-y-1 md:p-6 ${
              index % 2 === 1 ? "md:mt-12" : ""
            }`}
          >
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white/75 text-4xl shadow-sm">
              <span aria-hidden>{step.icon}</span>
            </div>
            <div className="mx-auto -mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-lg">
              {index + 1}
            </div>
            <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary/55">{step.label}</p>
            <h2 className="mt-2 text-lg font-bold text-primary">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-plum/65">{step.body}</p>
          </article>
        ))}
      </div>

      <div className="relative mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/home" className="rounded-full bg-white/70 px-6 py-3 text-sm font-bold text-primary shadow-sm transition hover:bg-white">
          {t.skip}
        </Link>
        <Link href="/home" className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:brightness-110">
          {t.start}
        </Link>
      </div>
    </div>
  );
}
