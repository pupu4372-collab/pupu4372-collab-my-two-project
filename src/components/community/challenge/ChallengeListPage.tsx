"use client";

import { AppTopNav } from "@/components/layout/AppTopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { PetShowPageHeader } from "@/components/community/PetShowPageHeader";
import { PetShowSectionTabs } from "@/components/community/PetShowSectionTabs";
import { PageContainer, NightPageShell } from "@/components/layout/StitchLayout";
import { Link } from "@/i18n/navigation";
import { localizeChallenges } from "@/lib/community/challenge-localize";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import type { Challenge, ChallengeChannel } from "@/lib/supabase/types";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

const CHANNEL_TABS: Array<{ id: ChallengeChannel | "all"; ko: string; en: string }> = [
  { id: "all", ko: "전체", en: "All" },
  { id: "dog", ko: "강아지", en: "Dogs" },
  { id: "cat", ko: "고양이", en: "Cats" },
  { id: "reptile", ko: "렙타일", en: "Reptile" },
];

function channelLabel(channel: ChallengeChannel, isKo: boolean) {
  if (channel === "all") return isKo ? "전체" : "All";
  if (channel === "dog") return isKo ? "강아지" : "Dogs";
  if (channel === "cat") return isKo ? "고양이" : "Cats";
  return isKo ? "렙타일" : "Reptile";
}

export function ChallengeListPage() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const [channel, setChannel] = useState<ChallengeChannel | "all">("all");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (channel !== "all") params.set("channel", channel);
        const res = await fetch(`/api/community/challenge?${params.toString()}`);
        const data = (await res.json()) as { challenges?: Challenge[]; error?: string };
        if (!res.ok) {
          setError(data.error ?? (isKo ? "챌린지를 불러오지 못했어요." : "Could not load challenges."));
          setChallenges([]);
          return;
        }
        setChallenges(localizeChallenges(data.challenges ?? [], isKo ? "ko" : "en"));
      } catch {
        setError(isKo ? "네트워크 오류가 발생했어요." : "Network error.");
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [channel, isKo]);

  return (
    <NightPageShell>
      <AppTopNav active="challenge" />
      <PageContainer className="space-y-4 py-4">
        <PetShowSectionTabs />
        <PetShowPageHeader
          title={isKo ? "미션에 참여해 보세요" : "Join a mission"}
          subtitle={
            isKo
              ? "사진과 글로 미션을 인증하고 다른 집사들과 함께해요."
              : "Verify missions with photos and notes alongside other pet parents."
          }
        />

        <nav className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar" aria-label={isKo ? "채널 필터" : "Channel filter"}>
          {CHANNEL_TABS.map((tab) => {
            const active = channel === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setChannel(tab.id)}
                className={
                  active
                    ? "whitespace-nowrap rounded-full bg-primary px-5 py-2.5 text-xs font-extrabold text-white shadow-sm"
                    : "whitespace-nowrap rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-extrabold text-white/70 transition hover:bg-white/20"
                }
              >
                {isKo ? tab.ko : tab.en}
              </button>
            );
          })}
        </nav>

        {loading ? (
          <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center text-sm text-white/60 backdrop-blur-sm">
            {isKo ? "챌린지를 불러오는 중…" : "Loading challenges…"}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center text-sm text-channel-cat backdrop-blur-sm">
            {error}
          </div>
        ) : challenges.length === 0 ? (
          <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center text-sm text-white/60 backdrop-blur-sm">
            {isKo ? "진행 중인 챌린지가 없어요." : "No active challenges yet."}
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {challenges.map((challenge) => (
              <li key={challenge.id}>
                <Link
                  href={`/community/challenge/${challenge.id}`}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/15"
                >
                  {challenge.thumbnail_url ? (
                    <div className="aspect-[16/9] w-full overflow-hidden bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={supabaseImageTransformUrl(challenge.thumbnail_url, { width: 640, height: 360 })}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[16/9] items-center justify-center bg-white/5 text-4xl">
                      🏅
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <span className="w-fit rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-extrabold text-white/80">
                      {channelLabel(challenge.channel, isKo)}
                    </span>
                    <h2 className="mt-2 text-lg font-extrabold text-white">{challenge.title}</h2>
                    {challenge.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/70">{challenge.description}</p>
                    )}
                    <p className="mt-4 text-xs font-extrabold text-white/80">
                      {isKo ? "참여하기" : "Join"} →
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
      <MobileBottomNav active="challenge" />
    </NightPageShell>
  );
}
