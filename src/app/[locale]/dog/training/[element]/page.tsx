import { ChannelShell } from "@/components/layout/ChannelShell";
import { Link } from "@/i18n/navigation";
import { getSajuTrainingCard, SAJU_TRAINING_CARDS } from "@/lib/channel/saju-training";
import { notFound } from "next/navigation";

const DETAIL_TONE = {
  mok: {
    hero: "bg-[#eef9e8]",
    accent: "text-green-600",
    soft: "bg-green-500/10 text-green-600",
  },
  hwa: {
    hero: "bg-[#fdeaea]",
    accent: "text-red-500",
    soft: "bg-red-500/10 text-red-500",
  },
  su: {
    hero: "bg-[#eef7ff]",
    accent: "text-sky-600",
    soft: "bg-sky-500/10 text-sky-600",
  },
  to: {
    hero: "bg-[#fff4df]",
    accent: "text-amber-600",
    soft: "bg-amber-500/10 text-amber-600",
  },
  geum: {
    hero: "bg-[#f3f4f6]",
    accent: "text-slate-600",
    soft: "bg-slate-400/15 text-slate-600",
  },
} as const;

interface PageProps {
  params: Promise<{ element: string; locale: string }>;
}

export function generateStaticParams() {
  return SAJU_TRAINING_CARDS.map((card) => ({ element: card.element }));
}

export default async function DogTrainingDetailPage({ params }: PageProps) {
  const { element, locale } = await params;
  const isKo = locale !== "en";
  const training = getSajuTrainingCard(element);
  if (!training) notFound();

  const actions = isKo ? training.koActions : training.enActions;
  const detail = isKo ? training.koDetail : training.enDetail;
  const tone = DETAIL_TONE[training.element];

  return (
    <ChannelShell
      theme="dog"
      title={isKo ? training.ko : training.en}
      subtitle={isKo ? "오행 기운에 맞춘 강아지 교감 훈련" : "Dog bonding training by elemental energy"}
      backHref="/dog"
      backLabel={isKo ? "← 강아지 채널" : "← Dog Channel"}
      rightLinks={[
        { href: "/saju", label: isKo ? "댕냥사주" : "K-Saju" },
        { href: "/community", label: isKo ? "커뮤니티" : "Community" },
      ]}
    >
      <article className="mx-auto max-w-4xl space-y-8 text-primary">
        <section className={`rounded-[2rem] border border-white/20 p-6 shadow-xl md:p-10 ${tone.hero}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={`text-xs font-extrabold uppercase tracking-[0.18em] ${tone.accent}`}>
              {detail?.eyebrow ?? (isKo ? "사주 맞춤 훈련" : "K-Saju Training")}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold md:text-4xl">
              {detail?.title ?? (isKo ? training.ko : training.en)}
            </h2>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-plum/80 md:text-base">
              {detail?.intro ?? (isKo ? training.koDesc : training.enDesc)}
            </p>
          </div>
          <span className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl font-extrabold ${tone.soft}`}>
            {training.icon}
          </span>
        </div>
        </section>

        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <span key={action} className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-plum shadow-sm">
              {action}
            </span>
          ))}
        </div>

        {detail ? (
          <>
            <section>
              <h3 className="text-sm font-extrabold text-white/70">{isKo ? "이런 아이에게 잘 맞아요" : "Best for dogs like this"}</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {detail.fitCards.map((card) => (
                  <div key={card.title} className="rounded-[1.25rem] bg-cream p-5 text-center shadow-sm">
                    <p className="text-lg font-extrabold text-primary">{card.title}</p>
                    <p className="mt-2 text-xs font-bold text-plum/70">{card.subtitle}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-extrabold text-white/70">{detail.routineTitle}</h3>
              <div className="mt-4 rounded-[1.5rem] bg-cream p-5 shadow-sm md:p-7">
                <div className="divide-y divide-primary/10">
                  {detail.steps.map((step, index) => (
                    <div key={step.title} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${tone.soft}`}>
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-primary">{step.title}</h4>
                        <p className="mt-2 text-sm font-semibold leading-7 text-plum/80">{step.body}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {step.meta.map((meta) => (
                            <span key={meta} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-plum/70">
                              {meta}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-extrabold text-white/70">{detail.checklistTitle}</h3>
              <div className="mt-4 rounded-[1.5rem] bg-cream p-5 shadow-sm md:p-7">
                <ul className="space-y-4">
                  {detail.checklist.map((item) => (
                    <li key={item} className="flex gap-3 text-sm font-semibold leading-6 text-plum/85">
                      <span className={tone.accent} aria-hidden>
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <p className="rounded-[1.25rem] border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-7 text-[#5f4a2b]">
              {detail.caution}
            </p>
          </>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                isKo ? "핵심 루틴" : "Core routine",
                isKo ? "단계별 진행" : "Step-by-step",
                isKo ? "주의할 점" : "Care notes",
              ].map((title) => (
                <section key={title} className="rounded-[1.5rem] border border-primary/10 bg-cream p-5">
                  <h3 className="text-base font-extrabold text-primary">{title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-plum/70">
                    {isKo
                      ? "상세 콘텐츠를 이 영역에 추가할 예정입니다."
                      : "Detailed content will be added here."}
                  </p>
                </section>
              ))}
            </div>

            <div className="rounded-[1.5rem] bg-lavender/70 p-5">
              <h3 className="text-lg font-extrabold">{isKo ? "본문 작성 자리" : "Content placeholder"}</h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-plum/80">
                {isKo
                  ? "가져오실 상세 원고를 붙이면 되는 자리입니다. 루틴 설명, 권장 시간, 보호자 멘트, 금지 행동 등을 이어서 구성하면 됩니다."
                  : "This area is ready for the full article: routine details, recommended timing, guardian phrases, and things to avoid."}
              </p>
            </div>
          </>
        )}

        <div className="flex flex-wrap gap-3">
          <Link href="/dog" className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-white transition hover:bg-plum">
            {isKo ? "강아지 채널로 돌아가기" : "Back to Dog Channel"}
          </Link>
          <Link href="/saju" className="rounded-full bg-white px-6 py-3 text-sm font-extrabold text-primary transition hover:bg-lavender">
            {isKo ? "우리 아이 사주 보기" : "Check K-Saju"}
          </Link>
        </div>
      </article>
    </ChannelShell>
  );
}
