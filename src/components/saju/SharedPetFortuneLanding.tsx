"use client";

import { PetFortuneShareRow } from "@/components/home/PetFortuneShareRow";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import type { PetDailyFortune, PetFortunePetMeta } from "@/lib/saju/pet-daily-fortune";
import { Link } from "@/i18n/navigation";

function starsString(count: number) {
  return "★".repeat(count) + "☆".repeat(5 - count);
}

export function SharedPetFortuneLanding({
  pet,
  fortune,
  isKo,
}: {
  pet: PetFortunePetMeta;
  fortune: PetDailyFortune;
  isKo: boolean;
}) {
  const heroIcon = fortune.overall >= 4 ? "🌟" : fortune.overall === 3 ? "☁️" : "🌙";
  const cardBg = "border border-lavender/35 bg-white/72";
  const innerCardBg = "border border-lavender/20 bg-white/80";

  return (
    <div className="mx-auto max-w-lg space-y-3">
      <div className={`rounded-[1.5rem] p-5 text-center ${cardBg}`}>
        <span className="inline-block rounded-full bg-channel-saju/12 px-3 py-1 text-[11px] font-extrabold text-channel-saju">
          {fortune.dateLabel}
        </span>
        <div className="mt-4">
          {pet.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={supabaseImageTransformUrl(pet.profileImageUrl, { width: 96, height: 96 })}
              alt=""
              className="mx-auto h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="text-5xl">{pet.icon}</div>
          )}
          <div className="mt-3 text-4xl">{heroIcon}</div>
          <h1 className="mt-3 text-xl font-extrabold text-primary">{fortune.title}</h1>
          <p className="mt-1 text-sm font-semibold text-plum/70">
            {pet.name} · {pet.speciesLabel} · {pet.dayBranchSign} {starsString(fortune.overall)}
          </p>
          <p className="mt-2 text-sm font-semibold text-plum/75">{fortune.subtitle}</p>
        </div>
      </div>

      <div className={`rounded-[1.5rem] p-4 ${cardBg}`}>
        <p className="text-xs font-extrabold text-plum/70">{isKo ? "항목별 운세" : "Category scores"}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {fortune.categories.map((cat) => (
            <div key={cat.label} className={`rounded-2xl p-3 text-center ${innerCardBg}`}>
              <div className="text-xl">{cat.icon}</div>
              <p className="mt-1 text-[11px] font-bold text-plum/70">{cat.label}</p>
              <p className="mt-1 text-base font-extrabold" style={{ color: cat.color }}>
                {cat.score}
                {isKo ? "점" : ""}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className={`rounded-[1.5rem] p-4 ${cardBg}`}>
        <p className="text-xs font-extrabold text-plum/70">{isKo ? "오늘의 메시지" : "Today's messages"}</p>
        <div className="mt-3 space-y-2">
          {fortune.messages.map((msg) => (
            <div key={msg.label} className={`rounded-2xl p-3.5 ${innerCardBg}`}>
              <div className="flex items-center gap-2">
                <span>{msg.icon}</span>
                <span className="text-xs font-extrabold text-plum/70">{msg.label}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-plum/85">{msg.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`rounded-[1.5rem] p-4 ${cardBg}`}>
        <p className="text-xs font-extrabold text-plum/70">{isKo ? "오늘의 럭키 아이템" : "Lucky items"}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {fortune.lucky.map((item) => (
            <span
              key={item.text}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${
                item.type === "color"
                  ? "bg-channel-saju/15 text-channel-saju"
                  : item.type === "food"
                    ? "bg-mint/55 text-emerald-900"
                    : "bg-petal/55 text-rose-900"
              }`}
            >
              {item.icon} {item.text}
            </span>
          ))}
        </div>
      </div>

      <PetFortuneShareRow pet={pet} fortune={fortune} isKo={isKo} isNight={false} />

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href="/saju"
          className="flex-1 rounded-2xl bg-channel-saju px-4 py-3 text-center text-sm font-extrabold text-white transition hover:brightness-105"
        >
          {isKo ? "내 아이 사주 보기" : "Get your pet's saju"}
        </Link>
        <Link
          href="/"
          className="flex-1 rounded-2xl border border-lavender/40 bg-white/85 px-4 py-3 text-center text-sm font-extrabold text-primary transition hover:bg-white"
        >
          {isKo ? "홈으로" : "Home"}
        </Link>
      </div>

      <p className="text-center text-xs font-semibold text-plum/60">{fortune.disclaimer}</p>
    </div>
  );
}
