"use client";

import {
  PetDailyFortunePanel,
  type FortuneTodayState,
} from "@/components/home/PetDailyFortunePanel";
import { JigFortuneOrnateCorners } from "@/components/home/jig-fortune/JigFortuneDecor";
import type { PetDailyFortune, PetFortunePetMeta } from "@/lib/saju/pet-daily-fortune";
import { Link } from "@/i18n/navigation";

export function SharedPetFortuneLanding({
  pet,
  fortune,
  isKo,
}: {
  pet: PetFortunePetMeta;
  fortune: PetDailyFortune;
  isKo: boolean;
}) {
  const data: FortuneTodayState = {
    mode: "personalized",
    hasRegisteredPets: true,
    petId: pet.id,
    pets: [pet],
    fortune,
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="pet-fortune-jigwanjae relative overflow-visible p-4 shadow-lg md:p-5">
        <div className="jig-fortune-body">
          <JigFortuneOrnateCorners />

          <div className="relative z-[2] mb-2 text-center">
            <p className="human-premium-label-caps text-[var(--jig-seal)] tracking-widest">
              {isKo ? "지관재 (知觀齋)" : "Jigwanjae (知觀齋)"}
            </p>
            <h2 className="human-premium-serif mt-1.5 text-2xl font-bold text-[var(--jig-ink)] md:text-3xl">
              {isKo ? `${pet.name}의 오늘 운세` : `${pet.name}'s fortune today`}
            </h2>
            <div className="mx-auto my-2 h-0.5 w-10 bg-[var(--jig-ink)]/20" />
          </div>

          <div className="relative z-[2]">
            <PetDailyFortunePanel
              data={data}
              isKo={isKo}
              variant="jigwanjae"
              initialRevealed
              hideFold
            />
          </div>

          <div className="relative z-[2] mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/saju"
              className="jig-fortune-reveal-btn mx-auto flex flex-1 items-center justify-center bg-[var(--jig-ink)] px-4 py-3 text-white transition hover:opacity-90"
            >
              <span className="human-premium-label-caps text-sm tracking-widest">
                {isKo ? "내 아이 사주 보기" : "Get your pet's saju"}
              </span>
            </Link>
            <Link
              href="/"
              className="flex-1 rounded-sm border border-[var(--jig-ink)]/15 bg-white/85 px-4 py-3 text-center text-sm font-extrabold text-[var(--jig-ink)] transition hover:bg-white"
            >
              {isKo ? "홈으로" : "Home"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
