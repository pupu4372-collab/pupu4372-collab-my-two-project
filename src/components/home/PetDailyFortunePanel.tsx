"use client";

import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import type {
  CommonPetDailyFortune,
  PetDailyFortune,
  PetFortunePetMeta,
} from "@/lib/saju/pet-daily-fortune";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PetFortuneShareRow } from "@/components/home/PetFortuneShareRow";
import {
  JigFortuneContentBox,
  JigFortuneToggleButton,
  JigFortuneWatermark,
} from "@/components/home/jig-fortune/JigFortuneDecor";

export type PetFortuneVisualVariant = "jigwanjae" | "default";

function starsString(count: number) {
  return "★".repeat(count) + "☆".repeat(5 - count);
}

function isJigwanjae(variant: PetFortuneVisualVariant) {
  return variant === "jigwanjae";
}

function CommonFortunePanel({
  fortune,
  isKo,
  variant,
  isNight,
  showRegisterCta,
}: {
  fortune: CommonPetDailyFortune;
  isKo: boolean;
  variant: PetFortuneVisualVariant;
  isNight: boolean;
  showRegisterCta: boolean;
}) {
  const [revealed, setRevealed] = useState(true);

  if (isJigwanjae(variant)) {
    return (
      <div className="mt-2 space-y-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="human-premium-label-caps rounded-full border border-[var(--jig-ink)]/10 bg-white/60 px-3 py-1 text-[var(--jig-seal)]">
            {fortune.dateLabel}
          </span>
          <span className="text-xs font-semibold text-[var(--jig-muted)]">{fortune.scopeLabel}</span>
        </div>

        {revealed ? (
          <JigFortuneContentBox>
            <JigFortuneWatermark />
            <div className="relative z-10 space-y-3">
              <p className="human-premium-label-caps text-[var(--jig-muted)]">
                {isKo ? "공통 운세" : "Common fortune"}
              </p>
              <h3 className="human-premium-serif text-2xl font-semibold text-[var(--jig-ink)]">{fortune.headline}</h3>
              <p className="text-sm leading-7 text-[var(--jig-muted)]">{fortune.body}</p>
            </div>
          </JigFortuneContentBox>
        ) : (
          <JigFortuneContentBox>
            <JigFortuneWatermark />
            <div className="relative z-10 space-y-2">
              <p className="human-premium-label-caps text-[var(--jig-muted)]">
                {isKo ? "공통 운세" : "Common fortune"}
              </p>
              <p className="human-premium-serif text-2xl font-semibold leading-snug text-[var(--jig-ink)]">
                {isKo ? (
                  <>
                    오늘의 운세를
                    <br />
                    확인하세요
                  </>
                ) : (
                  <>
                    Check today&apos;s
                    <br />
                    fortune
                  </>
                )}
              </p>
            </div>
          </JigFortuneContentBox>
        )}

        {revealed && showRegisterCta && (
          <p className="jig-fortune-notice px-4 py-3 text-center text-xs font-semibold leading-5 text-[var(--jig-muted)]">
            {isKo
              ? "K-사주를 저장하면 내 아이 맞춤 운세가 열려요."
              : "Save a K-Saju reading to unlock your pet's personalized fortune."}
          </p>
        )}

        {revealed ? (
          <>
            <AuthRequiredLink
              href="/saju"
              className="jig-fortune-reveal-btn mx-auto flex w-full max-w-xs items-center justify-center gap-4 bg-[var(--jig-ink)] px-8 py-4 text-white transition hover:opacity-90 active:scale-[0.98]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[var(--jig-seal)]">
                <span className="human-premium-serif text-lg italic text-white">知</span>
              </span>
              <span className="human-premium-label-caps text-base tracking-widest">{fortune.cta}</span>
            </AuthRequiredLink>
            <button
              type="button"
              onClick={() => setRevealed(false)}
              className="mx-auto text-xs font-bold text-[var(--jig-muted)] transition hover:text-[var(--jig-seal)]"
            >
              {isKo ? "접기" : "Fold"}
            </button>
          </>
        ) : (
          <JigFortuneToggleButton expanded={false} isKo={isKo} onClick={() => setRevealed(true)} />
        )}
      </div>
    );
  }

  const panelClass = isNight
    ? "relative max-w-[470px] border border-white/30 bg-[#351445] pr-24 text-white shadow-[0_10px_26px_rgba(18,10,29,0.16)]"
    : "bg-white/55";

  return (
    <div className={`mt-6 rounded-[1.5rem] p-5 ${panelClass}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${isNight ? "bg-[#4a2d5c] text-[#ffd7ff]" : "bg-[#efe6f2] text-primary"}`}>
          {fortune.dateLabel}
        </span>
        <span className={`text-xs font-bold ${isNight ? "text-[#f3e8ff]/85" : "text-plum/70"}`}>{fortune.scopeLabel}</span>
      </div>
      {isNight && (
        <span className="absolute right-7 top-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-2xl font-semibold tracking-tight text-plum shadow-sm">
          <span className="-mr-1 text-base text-[#6b5a48]">♥</span>RK
        </span>
      )}
      <h3 className={`mt-4 text-lg font-extrabold ${isNight ? "text-white" : "text-primary"}`}>{fortune.headline}</h3>
      <p className={`mt-3 text-sm font-semibold leading-7 ${isNight ? "text-[#f3e8ff]/90" : "text-plum/75"}`}>{fortune.body}</p>
      {showRegisterCta && (
        <p className="mt-4 rounded-2xl bg-white/65 px-4 py-3 text-xs font-extrabold leading-5 text-primary shadow-sm">
          {isKo ? "K-사주를 저장하면 내 아이 맞춤 운세가 열려요." : "Save a K-Saju reading to unlock your pet's personalized fortune."}
        </p>
      )}
      <AuthRequiredLink
        href="/saju"
        className={`mt-5 inline-flex rounded-full px-4 py-2 text-xs font-extrabold shadow-sm transition hover:scale-105 ${
          isNight ? "bg-primary text-white shadow-[0_8px_20px_rgba(61,22,79,0.22)] hover:brightness-105" : "bg-primary text-white hover:brightness-105"
        }`}
      >
        {fortune.cta}
      </AuthRequiredLink>
    </div>
  );
}

function JigPetCarousel({
  pets,
  selectedPetId,
  isKo,
  onSelectPet,
}: {
  pets: PetFortunePetMeta[];
  selectedPetId: string;
  isKo: boolean;
  onSelectPet: (petId: string) => void;
}) {
  return (
    <div className="mb-6 w-full overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-min items-end justify-center gap-4 px-1 md:gap-6">
        {pets.map((pet) => {
          const active = pet.id === selectedPetId;
          return (
            <button
              key={pet.id}
              type="button"
              onClick={() => onSelectPet(pet.id)}
              className={`flex shrink-0 flex-col items-center gap-2 transition ${active ? "scale-110" : "opacity-90 hover:scale-105"}`}
            >
              <div
                className={`relative overflow-hidden rounded-full border-2 bg-white p-1 transition ${
                  active
                    ? "jig-pet-ring-active h-20 w-20 border-[var(--jig-seal)]/30 p-1.5 md:h-24 md:w-24"
                    : "h-16 w-16 border-[var(--jig-ink)]/10 md:h-20 md:w-20"
                }`}
              >
                <div className="h-full w-full overflow-hidden rounded-full bg-[var(--jig-hanji)]">
                  {pet.profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={supabaseImageTransformUrl(pet.profileImageUrl, { width: 96, height: 96 })}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-2xl md:text-3xl">{pet.icon}</span>
                  )}
                </div>
                {active && <span className="pointer-events-none absolute inset-0 animate-pulse rounded-full bg-[var(--jig-seal)]/5" />}
              </div>
              <span
                className={`human-premium-label-caps text-center text-[10px] md:text-xs ${
                  active ? "font-bold text-[var(--jig-seal)]" : "text-[var(--jig-muted)]"
                }`}
              >
                {pet.name}
                {active ? (isKo ? " (선택됨)" : " (selected)") : ""}
              </span>
            </button>
          );
        })}
        <AuthRequiredLink
          href="/profile"
          className="flex shrink-0 flex-col items-center gap-2 opacity-80 transition hover:scale-105 hover:opacity-100"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[var(--jig-ink)]/20 bg-white/70 text-xl text-[var(--jig-muted)] md:h-20 md:w-20">
            +
          </div>
          <span className="human-premium-label-caps text-[10px] text-[var(--jig-muted)]">{isKo ? "추가" : "Add"}</span>
        </AuthRequiredLink>
      </div>
    </div>
  );
}

function PersonalizedFortunePanel({
  pets,
  fortune,
  selectedPetId,
  isKo,
  variant,
  isNight,
  onSelectPet,
}: {
  pets: PetFortunePetMeta[];
  fortune: PetDailyFortune;
  selectedPetId: string;
  isKo: boolean;
  variant: PetFortuneVisualVariant;
  isNight: boolean;
  onSelectPet: (petId: string) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const selectedPet = pets.find((pet) => pet.id === selectedPetId) ?? pets[0];
  const jig = isJigwanjae(variant);

  useEffect(() => {
    setRevealed(false);
  }, [selectedPetId]);

  const heroIcon =
    !revealed ? selectedPet.icon : fortune.overall >= 4 ? "🌟" : fortune.overall === 3 ? "☁️" : "🌙";

  const textPrimary = jig ? "text-[var(--jig-ink)]" : isNight ? "text-white" : "text-primary";
  const textSecondary = jig ? "text-[var(--jig-muted)]" : isNight ? "text-[#f3e8ff]" : "text-plum/70";
  const textBody = jig ? "text-[var(--jig-ink)]" : isNight ? "text-white" : "text-plum/85";
  const textMuted = jig ? "text-[var(--jig-muted)]" : isNight ? "text-[#e9d5ff]/90" : "text-plum/60";
  const cardBg = jig
    ? "human-premium-lattice human-premium-paper-warm"
    : isNight
      ? "border border-white/30 bg-[#351445]"
      : "border border-lavender/35 bg-white/72";
  const innerCardBg = jig
    ? "border border-[var(--jig-ink)]/8 bg-white/80"
    : isNight
      ? "bg-[#4a2d5c] border border-white/15"
      : "bg-white/80 border border-lavender/20";
  const sectionLabelClass = jig
    ? "human-premium-label-caps text-[var(--jig-seal)]"
    : `text-xs font-extrabold ${textSecondary}`;

  if (jig) {
    return (
      <div className="space-y-5">
        <p className="text-center text-sm text-[var(--jig-muted)]">{fortune.dateLabel}</p>

        {pets.length > 1 && <JigPetCarousel pets={pets} selectedPetId={selectedPetId} isKo={isKo} onSelectPet={onSelectPet} />}

        {!revealed ? (
          <>
            <JigFortuneContentBox>
              <JigFortuneWatermark />
              <div className="relative z-10 space-y-2">
                <span className="human-premium-label-caps text-[var(--jig-muted)]">
                  {isKo ? `분석 대상: ${selectedPet.name}` : `Reading for: ${selectedPet.name}`}
                </span>
                <p className="human-premium-serif text-2xl font-semibold leading-snug text-[var(--jig-ink)]">
                  {isKo ? (
                    <>
                      오늘의 운세를
                      <br />
                      확인하세요
                    </>
                  ) : (
                    <>
                      Check today&apos;s
                      <br />
                      fortune
                    </>
                  )}
                </p>
                <p className="text-sm text-[var(--jig-muted)]">
                  {isKo
                    ? `${selectedPet.name}의 오늘 하루는 어떨까요?`
                    : `How will ${selectedPet.name}'s day go?`}
                </p>
              </div>
            </JigFortuneContentBox>

            <JigFortuneToggleButton expanded={false} isKo={isKo} onClick={() => setRevealed(true)} />
          </>
        ) : (
          <div className="space-y-4">
            <div className={`rounded-sm p-5 text-center ${cardBg}`}>
              <div className="text-4xl">{heroIcon}</div>
              <h3 className={`mt-3 human-premium-serif text-2xl font-semibold ${textPrimary}`}>{fortune.title}</h3>
              <p className={`mt-2 text-sm font-medium ${textSecondary}`}>
                {selectedPet.name} · {selectedPet.speciesLabel} · {selectedPet.dayBranchSign}{" "}
                {starsString(fortune.overall)}
              </p>
              <p className={`mt-2 text-sm ${textMuted}`}>{fortune.subtitle}</p>
            </div>

            <div className={`rounded-sm p-4 ${cardBg}`}>
              <p className={sectionLabelClass}>{isKo ? "항목별 운세" : "Category scores"}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {fortune.categories.map((cat) => (
                  <div key={cat.label} className={`rounded-sm p-3 text-center ${innerCardBg}`}>
                    <div className="text-xl">{cat.icon}</div>
                    <p className={`mt-1 text-[11px] font-bold ${textSecondary}`}>{cat.label}</p>
                    <p className="mt-1 text-base font-extrabold" style={{ color: cat.color }}>
                      {cat.score}
                      {isKo ? "점" : ""}
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--jig-ink)]/10">
                      <div className="human-premium-chart-bar h-full rounded-full" style={{ width: `${cat.score}%`, background: cat.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-sm p-4 ${cardBg}`}>
              <p className={sectionLabelClass}>{isKo ? "오늘의 메시지" : "Today's messages"}</p>
              <div className="mt-3 space-y-2">
                {fortune.messages.map((msg) => (
                  <div key={msg.label} className={`rounded-sm p-3.5 ${innerCardBg}`}>
                    <div className="flex items-center gap-2">
                      <span>{msg.icon}</span>
                      <span className="human-premium-label-caps text-[var(--jig-seal)]">{msg.label}</span>
                    </div>
                    <p className={`mt-2 text-sm leading-6 ${textBody}`}>{msg.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-sm p-4 ${cardBg}`}>
              <p className={sectionLabelClass}>{isKo ? "오늘의 럭키 아이템" : "Lucky items"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {fortune.lucky.map((item) => (
                  <span
                    key={item.text}
                    className="inline-flex items-center gap-1 rounded-sm border border-[var(--jig-ink)]/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-[var(--jig-ink)]"
                  >
                    {item.icon} {item.text}
                  </span>
                ))}
              </div>
            </div>

            <div className={`rounded-sm p-4 ${cardBg}`}>
              <p className={sectionLabelClass}>{isKo ? "이번 주 운세 미리보기" : "This week's preview"}</p>
              <div className="mt-3 flex gap-1.5">
                {fortune.week.map((day) => (
                  <div
                    key={day.dayLabel}
                    className={`flex-1 rounded-sm border px-1 py-2 text-center ${
                      day.isToday
                        ? "border-[var(--jig-seal)] bg-[var(--jig-obang-white)]"
                        : "border-[var(--jig-ink)]/10 bg-white/70"
                    }`}
                  >
                    <p className={`text-[10px] font-bold ${day.isToday ? "text-[var(--jig-seal)]" : textSecondary}`}>{day.dayLabel}</p>
                    <p className="mt-1 text-base">{day.isToday ? selectedPet.icon : day.icon}</p>
                    <p className="mt-0.5 text-[8px] text-[#d4a373]">{starsString(day.stars)}</p>
                  </div>
                ))}
              </div>
              <p className={`mt-2 text-center text-[11px] font-semibold ${textMuted}`}>
                {isKo ? "내일 이후는 내일 공개돼요" : "Future days unlock tomorrow"}
              </p>
            </div>

            <div className={`rounded-sm p-4 ${cardBg}`}>
              <p className={sectionLabelClass}>{isKo ? "오늘 이렇게 해주세요" : "Care tips for today"}</p>
              <div className="mt-2 divide-y divide-[var(--jig-ink)]/10">
                {fortune.tips.map((tip) => (
                  <div key={tip.text} className="flex items-center gap-3 py-2.5">
                    <span className="text-lg">{tip.icon}</span>
                    <span className={`text-sm font-semibold ${textBody}`}>{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/saju/compatibility"
              className="block rounded-sm border border-[var(--jig-ink)]/15 bg-white/70 px-3 py-2.5 text-center text-xs font-bold text-[var(--jig-ink)] transition hover:bg-white"
            >
              {isKo ? "펫 궁합 보러가기" : "Pet compatibility"}
            </Link>

            <PetFortuneShareRow pet={selectedPet} fortune={fortune} isKo={isKo} variant="jigwanjae" />

            <p className={`text-center text-xs font-semibold ${textMuted}`}>{fortune.disclaimer}</p>

            <button
              type="button"
              onClick={() => setRevealed(false)}
              className="mx-auto text-xs font-bold text-[var(--jig-muted)] transition hover:text-[var(--jig-seal)]"
            >
              {isKo ? "접기" : "Fold"}
            </button>
          </div>
        )}
      </div>
    );
  }

  const chipInactive = isNight
    ? "border-white/35 bg-[#4a2d5c] text-white"
    : "border-lavender/40 bg-white/75 text-plum/80";
  const chipActive = isNight
    ? "border-[#ffd7ff] bg-[#6b4a82] text-white"
    : "border-channel-saju bg-channel-saju/12 text-primary";

  return (
    <div className="mt-6 space-y-3">
      <div className={`rounded-[1.5rem] p-5 text-center ${cardBg}`}>
        <span
          className={`inline-block rounded-full px-3 py-1 text-[11px] font-extrabold ${
            isNight ? "bg-[#6b4a82] text-[#ffd7ff]" : "bg-channel-saju/12 text-channel-saju"
          }`}
        >
          {fortune.dateLabel}
        </span>

        {pets.length > 1 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {pets.map((pet) => (
              <button
                key={pet.id}
                type="button"
                onClick={() => onSelectPet(pet.id)}
                className={`flex min-w-[64px] flex-col items-center gap-1 rounded-2xl border px-2.5 py-2 transition ${
                  pet.id === selectedPetId ? chipActive : chipInactive
                }`}
              >
                {pet.profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={supabaseImageTransformUrl(pet.profileImageUrl, { width: 56, height: 56 })}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">{pet.icon}</span>
                )}
                <span className={`text-[11px] font-bold ${pet.id === selectedPetId ? "text-white" : textSecondary}`}>
                  {pet.name}
                </span>
              </button>
            ))}
            <AuthRequiredLink
              href="/profile"
              className={`flex min-w-[64px] flex-col items-center gap-1 rounded-2xl border border-dashed px-2.5 py-2 ${chipInactive}`}
            >
              <span className={`text-xl ${textSecondary}`}>+</span>
              <span className={`text-[11px] font-bold ${textSecondary}`}>{isKo ? "추가" : "Add"}</span>
            </AuthRequiredLink>
          </div>
        )}

        <div className="mt-4">
          <div className="text-5xl">{heroIcon}</div>
          <h3 className={`mt-3 text-xl font-extrabold ${textPrimary}`}>
            {revealed ? fortune.title : isKo ? "오늘의 운세를 확인하세요" : "Check today's fortune"}
          </h3>
          <p className={`mt-1 text-sm font-semibold ${textSecondary}`}>
            {revealed
              ? `${selectedPet.name} · ${selectedPet.speciesLabel} · ${selectedPet.dayBranchSign} ${starsString(fortune.overall)}`
              : isKo
                ? `${selectedPet.name}의 오늘 하루는 어떨까요?`
                : `How will ${selectedPet.name}'s day go?`}
          </p>
          {!revealed && (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="mt-4 rounded-2xl bg-channel-saju px-7 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:brightness-105"
            >
              {isKo ? "운세 보기" : "Reveal fortune"}
            </button>
          )}
        </div>
      </div>

      {revealed && (
        <div className="space-y-3">
          <div className={`rounded-[1.5rem] p-4 ${cardBg}`}>
            <p className={`text-xs font-extrabold ${textSecondary}`}>{isKo ? "항목별 운세" : "Category scores"}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {fortune.categories.map((cat) => (
                <div key={cat.label} className={`rounded-2xl p-3 text-center ${innerCardBg}`}>
                  <div className="text-xl">{cat.icon}</div>
                  <p className={`mt-1 text-[11px] font-bold ${textSecondary}`}>{cat.label}</p>
                  <p className="mt-1 text-base font-extrabold" style={{ color: cat.color }}>
                    {cat.score}
                    {isKo ? "점" : ""}
                  </p>
                  <div className={`mt-2 h-1.5 overflow-hidden rounded-full ${isNight ? "bg-white/25" : "bg-lavender/30"}`}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${cat.score}%`, background: cat.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-[1.5rem] p-4 ${cardBg}`}>
            <p className={`text-xs font-extrabold ${textSecondary}`}>{isKo ? "오늘의 메시지" : "Today's messages"}</p>
            <div className="mt-3 space-y-2">
              {fortune.messages.map((msg) => (
                <div key={msg.label} className={`rounded-2xl p-3.5 ${innerCardBg}`}>
                  <div className="flex items-center gap-2">
                    <span>{msg.icon}</span>
                    <span className={`text-xs font-extrabold ${isNight ? "text-[#ffd7ff]" : "text-plum/70"}`}>{msg.label}</span>
                  </div>
                  <p className={`mt-2 text-sm leading-6 ${textBody}`}>{msg.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-[1.5rem] p-4 ${cardBg}`}>
            <p className={`text-xs font-extrabold ${textSecondary}`}>{isKo ? "오늘의 럭키 아이템" : "Lucky items"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {fortune.lucky.map((item) => (
                <span
                  key={item.text}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${
                    item.type === "color"
                      ? isNight
                        ? "border border-[#c4b5fd]/40 bg-[#6b4a82] text-[#f5f3ff]"
                        : "bg-channel-saju/15 text-channel-saju"
                      : item.type === "food"
                        ? isNight
                          ? "border border-emerald-300/35 bg-emerald-950/55 text-emerald-100"
                          : "bg-mint/55 text-emerald-900"
                        : isNight
                          ? "border border-rose-300/35 bg-rose-950/55 text-rose-100"
                          : "bg-petal/55 text-rose-900"
                  }`}
                >
                  {item.icon} {item.text}
                </span>
              ))}
            </div>
          </div>

          <div className={`rounded-[1.5rem] p-4 ${cardBg}`}>
            <p className={`text-xs font-extrabold ${textSecondary}`}>{isKo ? "이번 주 운세 미리보기" : "This week's preview"}</p>
            <div className="mt-3 flex gap-1.5">
              {fortune.week.map((day) => (
                <div
                  key={day.dayLabel}
                  className={`flex-1 rounded-xl border px-1 py-2 text-center ${
                    day.isToday
                      ? isNight
                        ? "border-[#ffd7ff] bg-[#6b4a82] text-white"
                        : "border-channel-saju bg-channel-saju/10"
                      : isNight
                        ? "border-white/25 bg-[#4a2d5c] text-[#f3e8ff]"
                        : "border-lavender/30 bg-white/70"
                  }`}
                >
                  <p className={`text-[10px] font-bold ${day.isToday ? (isNight ? "text-[#ffd7ff]" : "text-channel-saju") : textSecondary}`}>
                    {day.dayLabel}
                  </p>
                  <p className="mt-1 text-base">{day.isToday ? selectedPet.icon : day.icon}</p>
                  <p className={`mt-0.5 text-[8px] ${isNight ? "text-amber-300" : "text-amber-500"}`}>{starsString(day.stars)}</p>
                </div>
              ))}
            </div>
            <p className={`mt-2 text-center text-[11px] font-semibold ${textMuted}`}>
              {isKo ? "내일 이후는 내일 공개돼요" : "Future days unlock tomorrow"}
            </p>
          </div>

          <div className={`rounded-[1.5rem] p-4 ${cardBg}`}>
            <p className={`text-xs font-extrabold ${textSecondary}`}>{isKo ? "오늘 이렇게 해주세요" : "Care tips for today"}</p>
            <div className={`mt-2 divide-y ${isNight ? "divide-white/15" : "divide-lavender/25"}`}>
              {fortune.tips.map((tip) => (
                <div key={tip.text} className="flex items-center gap-3 py-2.5">
                  <span className="text-lg">{tip.icon}</span>
                  <span className={`text-sm font-semibold ${textBody}`}>{tip.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/saju/compatibility"
              className={`flex-1 rounded-2xl px-3 py-2.5 text-center text-xs font-extrabold transition hover:brightness-105 ${
                isNight ? "border border-white/25 bg-[#6b4a82] text-white" : "bg-white/85 text-channel-saju"
              }`}
            >
              {isKo ? "펫 궁합 보러가기" : "Pet compatibility"}
            </Link>
          </div>

          <PetFortuneShareRow pet={selectedPet} fortune={fortune} isKo={isKo} isNight={isNight} />

          <p className={`text-center text-xs font-semibold ${textMuted}`}>{fortune.disclaimer}</p>
        </div>
      )}
    </div>
  );
}

export type FortuneTodayState =
  | {
      mode: "common";
      hasRegisteredPets: boolean;
      fortune: CommonPetDailyFortune;
    }
  | {
      mode: "personalized";
      hasRegisteredPets: true;
      petId: string;
      pets: PetFortunePetMeta[];
      fortune: PetDailyFortune;
    };

export function PetDailyFortunePanel({
  data,
  isKo,
  isNight = false,
  variant = "default",
  onSelectPet,
}: {
  data: FortuneTodayState;
  isKo: boolean;
  isNight?: boolean;
  variant?: PetFortuneVisualVariant;
  onSelectPet?: (petId: string) => void;
}) {
  if (data.mode === "common") {
    return (
      <CommonFortunePanel
        fortune={data.fortune}
        isKo={isKo}
        variant={variant}
        isNight={isNight}
        showRegisterCta={data.hasRegisteredPets === false}
      />
    );
  }

  return (
    <PersonalizedFortunePanel
      pets={data.pets}
      fortune={data.fortune}
      selectedPetId={data.petId}
      isKo={isKo}
      variant={variant}
      isNight={isNight}
      onSelectPet={onSelectPet ?? (() => undefined)}
    />
  );
}
