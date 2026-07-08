"use client";

import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { PetFortuneInstagramShareButton } from "@/components/home/pet-fortune/PetFortuneInstagramShareButton";
import { PetFortunePetSelector } from "@/components/home/pet-fortune/PetFortunePetSelector";
import type { PetDailyFortune, PetFortunePetMeta } from "@/lib/saju/pet-daily-fortune";
import {
  fortuneStatScoreBand,
  type FortuneStatCategory,
} from "@/lib/saju/pet-fortune-score-bands";
import { withJosa } from "@/lib/i18n/korean-josa";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

export type PetFortuneDashboardMode = "demo" | "live" | "registered";

type Props = {
  pet: PetFortunePetMeta;
  fortune: PetDailyFortune;
  mode: PetFortuneDashboardMode;
  pets?: PetFortunePetMeta[];
  selectedPetId?: string;
  onSelectPet?: (petId: string) => void;
  onResetPreview?: () => void;
  /** Hide sample badge and login CTA when the viewer is already signed in. */
  suppressGuestChrome?: boolean;
};

function findCategory(fortune: PetDailyFortune, labelKo: string, labelEn: string) {
  return fortune.categories.find((c) => c.label === labelKo || c.label === labelEn);
}

function scoreBand(score: number, category: FortuneStatCategory, isKo: boolean): string {
  return fortuneStatScoreBand(score, category, isKo);
}

function harmonyScore(fortune: PetDailyFortune): number {
  const avg =
    fortune.categories.reduce((sum, cat) => sum + cat.score, 0) / Math.max(fortune.categories.length, 1);
  return Math.round(avg);
}

function StatBar({
  label,
  badge,
  score,
  color,
  category,
  isKo,
}: {
  label: string;
  badge: string;
  score: number;
  color: string;
  category: FortuneStatCategory;
  isKo: boolean;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white/90 p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="shrink-0 rounded bg-stone-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {badge}
          </span>
          <span className="truncate text-sm font-bold text-stone-800">{label}</span>
        </div>
        <span className="shrink-0 text-sm font-extrabold tabular-nums" style={{ color }}>
          {score}%
        </span>
      </div>
      <div className="pet-fortune-progress-bg">
        <div className="pet-fortune-progress-fill" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <p className="mt-1.5 text-xs font-semibold text-stone-600">{scoreBand(score, category, isKo)}</p>
    </div>
  );
}

export function PetFortuneInsightsDashboard({
  pet,
  fortune,
  mode,
  pets,
  selectedPetId,
  onSelectPet,
  onResetPreview,
  suppressGuestChrome = false,
}: Props) {
  const t = useTranslations("home.guestFortune");
  const locale = useLocale();
  const isKo = locale === "ko";
  const health = findCategory(fortune, "건강운", "Health");
  const activity = findCategory(fortune, "활동운", "Activity");
  const appetite = findCategory(fortune, "식욕운", "Appetite");
  const sleep = findCategory(fortune, "수면운", "Sleep");
  const harmony = harmonyScore(fortune);
  const moodBody = fortune.messages[0]?.body ?? "";
  const dailyBody = fortune.messages[1]?.body ?? "";
  const tipBody = fortune.tips.map((tip) => tip.text).join(" ");

  const statItems = [
    health ? { cat: health, badge: t("badgeHealth"), category: "health" as const } : null,
    activity ? { cat: activity, badge: t("badgeVitality"), category: "activity" as const } : null,
    appetite ? { cat: appetite, badge: t("badgeJoy"), category: "appetite" as const } : null,
    sleep ? { cat: sleep, badge: t("badgeLuck"), category: "sleep" as const } : null,
  ].filter(
    (item): item is {
      cat: NonNullable<typeof health>;
      badge: string;
      category: FortuneStatCategory;
    } => item !== null
  );

  const showLoginCta = !suppressGuestChrome && (mode === "demo" || mode === "live");
  const showPhotoNudge = (mode === "registered" || mode === "live") && !pet.photoUrl;
  const showPetSelector = mode === "registered" && pets && pets.length > 0 && onSelectPet && selectedPetId;

  return (
    <div className="pet-fortune-dashboard relative z-10 space-y-6">
      {mode === "demo" && !suppressGuestChrome ? (
        <div className="flex justify-center">
          <span className="pet-fortune-sample-badge">{t("sampleBadge")}</span>
        </div>
      ) : null}

      <div className="text-center">
        <p className="text-xs font-semibold text-stone-600">{fortune.dateLabel}</p>
        <p className="mt-1 text-base font-bold text-stone-900">
          {pet.name} · {pet.speciesLabel}
        </p>

        {showPetSelector ? (
          <div className="mt-4">
            <PetFortunePetSelector
              pets={pets}
              selectedPetId={selectedPetId}
              onSelectPet={onSelectPet}
            />
          </div>
        ) : null}

        {mode === "live" && onResetPreview ? (
          <button
            type="button"
            onClick={onResetPreview}
            className="mt-3 text-xs font-semibold text-stone-600 underline-offset-2 hover:text-stone-900 hover:underline"
          >
            {t("editPet")}
          </button>
        ) : null}
      </div>

      <section className="mx-auto w-full max-w-md space-y-4 px-1">
        <div className="relative mx-auto flex w-48 flex-col items-center justify-center sm:w-52">
          <div
            className="absolute inset-0 rounded-full border-[10px] border-double border-stone-400/35"
            aria-hidden
          />
          <div className="relative z-10 flex aspect-square w-full flex-col items-center justify-center rounded-full border-[6px] border-stone-200 bg-stone-700 px-3 py-4 text-center text-white shadow-xl">
            <span className="text-xs font-semibold text-white/95 sm:text-sm">{t("harmonyLabel")}</span>
            <div className="my-1 flex items-center justify-center gap-2 text-xl sm:text-2xl">
              <span>{pet.icon}</span>
              <span className="text-yellow-300">☀️</span>
            </div>
            <div className="human-premium-serif text-4xl font-bold leading-none sm:text-5xl">{harmony}%</div>
            <p className="mt-2 rounded-full border border-white/25 bg-stone-900/55 px-2.5 py-1 text-[10px] font-medium leading-snug text-white sm:text-[11px]">
              {t("harmonyScore")} : {fortune.title}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {statItems.map(({ cat, badge, category }) => (
            <StatBar
              key={cat.label}
              label={cat.label}
              badge={badge}
              score={cat.score}
              color={cat.color}
              category={category}
              isKo={isKo}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-1">
        <article className="pet-fortune-insight-card border-t-amber-200">
          <h3 className="human-premium-serif mb-3 text-center text-base font-bold text-stone-900">
            {t("cardToday")}
          </h3>
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-stone-100 bg-white text-2xl shadow-inner">
              {pet.icon}
            </div>
            <div className="text-sm leading-relaxed text-stone-800">
              <p className="mb-1">
                <strong className="text-stone-900">{t("moodLabel")}</strong> {moodBody}
              </p>
              <p>
                <strong className="text-stone-900">{t("dailyLuckLabel")}</strong> {dailyBody}
              </p>
            </div>
          </div>
        </article>

        <article className="pet-fortune-insight-card border-t-stone-400">
          <h3 className="human-premium-serif mb-3 text-center text-base font-bold text-stone-900">
            {t("cardNature")}
          </h3>
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-stone-300 bg-gradient-to-br from-stone-100 to-stone-400 text-2xl">
              {pet.icon}
            </div>
            <div className="text-sm leading-relaxed text-stone-800">
              <p>
                <strong className="text-stone-900">{t("innateLabel")}</strong> {fortune.innatePersonality}
              </p>
            </div>
          </div>
        </article>

        <article className="pet-fortune-insight-card border-t-stone-200">
          <h3 className="human-premium-serif mb-3 text-center text-base font-bold text-stone-900">
            {t("cardTip")}
          </h3>
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-stone-100 bg-white text-2xl shadow-inner">
              📜
            </div>
            <div className="text-sm leading-relaxed text-stone-800">
              <p>
                <strong className="text-stone-900">{t("ownerAdviceLabel")}</strong> {tipBody}
              </p>
            </div>
          </div>
        </article>
      </section>

      {showLoginCta ? (
        <footer className="pet-fortune-dashboard-cta">
          <p className="flex-1 text-center text-base font-bold leading-snug text-stone-800 sm:text-lg">
            {t("loginBanner")}
          </p>
          <AuthRequiredLink href="/profile" className="pet-fortune-dashboard-login-btn shrink-0">
            {t("loginCta")}
          </AuthRequiredLink>
        </footer>
      ) : null}

      {showPhotoNudge ? (
        <p className="text-center text-sm leading-relaxed text-stone-700">
          {isKo ? (
            <>
              사진을 등록하면 매일 카드에 {withJosa(pet.name, "이/가")} 담겨요.{" "}
              <Link href="/profile" className="font-bold text-channel-saju underline underline-offset-2">
                펫 프로필에서 등록하기
              </Link>
            </>
          ) : (
            <>
              Add a photo and {pet.name} appears on daily fortune cards.{" "}
              <Link href="/profile" className="font-bold text-channel-saju underline underline-offset-2">
                Register in pet profile
              </Link>
            </>
          )}
        </p>
      ) : null}

      <PetFortuneInstagramShareButton pet={pet} fortune={fortune} />

      <p className="text-center text-xs font-semibold text-stone-600">{fortune.disclaimer}</p>
    </div>
  );
}
