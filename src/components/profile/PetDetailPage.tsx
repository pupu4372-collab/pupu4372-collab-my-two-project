"use client";

import { GlassCard, SectionHeader } from "@/components/layout/StitchLayout";
import { EmptyStatePanel, getEmptyStatePreset } from "@/components/ui/EmptyStatePanel";
import { PetCareCalendar } from "@/components/profile/PetCareCalendar";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import { petAvatarImageProps } from "@/lib/pets/pet-avatar";
import type { CommunityPost } from "@/lib/supabase/types";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";

interface SajuReading {
  id: string;
  title: string | null;
  saju_type: "basic" | "zodiac" | "compatibility" | "character_card" | "premium";
  typeLabel: string;
  created_at: string;
}

interface PetRow {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  gender: string | null;
  birth_date: string;
  birth_time: string | null;
  birth_time_unknown: boolean;
  birth_timezone: string;
  profile_image_url: string | null;
  photo_url: string | null;
  personality_tags: string[];
  created_at: string;
  latestSaju: SajuReading | null;
  readings: SajuReading[];
}

interface PetDetailPageProps {
  petId: string;
}

const TYPE_LABELS = {
  ko: {
    basic: "기본 사주",
    zodiac: "별자리 운세",
    compatibility: "궁합",
    character_card: "캐릭터 카드",
    premium: "Premium",
  },
  en: {
    basic: "Basic saju",
    zodiac: "Zodiac fortune",
    compatibility: "Compatibility",
    character_card: "Character card",
    premium: "Premium",
  },
} as const;

function ageLabel(birthDate: string, isKo: boolean) {
  const birth = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return birthDate;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return isKo ? `${Math.max(age, 0)}세` : `${Math.max(age, 0)} yr`;
}

function petQuery(pet: PetRow, locale: string) {
  return new URLSearchParams({
    petId: pet.id,
    petName: pet.name,
    species: pet.species,
    birthDate: pet.birth_date,
    birthTime: pet.birth_time_unknown ? "unknown" : pet.birth_time ?? "unknown",
    timezone: pet.birth_timezone,
    locale,
  }).toString();
}

function speciesLabel(species: string, isKo: boolean) {
  if (species === "dog") return isKo ? "강아지" : "Dog";
  if (species === "cat") return isKo ? "고양이" : "Cat";
  return isKo ? "다른 동물" : "Other pet";
}

function speciesEmoji(species: string) {
  if (species === "dog") return "🐶";
  if (species === "cat") return "🐱";
  return "🐾";
}

export function PetDetailPage({ petId }: PetDetailPageProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { ready, accessToken, configured, isAnonymous } = useSupabaseSession();
  const [pets, setPets] = useState<PetRow[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!configured || !ready || !accessToken || isAnonymous) {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [petsRes, postsRes] = await Promise.all([
          fetch("/api/profile/pets", { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch("/api/profile/pet-show-posts", { headers: { Authorization: `Bearer ${accessToken}` } }),
        ]);
        const petsData = await petsRes.json();
        const postsData = await postsRes.json();
        if (!petsRes.ok) {
          setError(petsData.error ?? (isKo ? "펫 정보를 불러오지 못했어요." : "Could not load pet profile."));
          return;
        }
        setPets((petsData.pets ?? []) as PetRow[]);
        if (postsRes.ok) setPosts((postsData.posts ?? []) as CommunityPost[]);
      } catch {
        setError(isKo ? "네트워크 오류" : "Network error");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [configured, ready, accessToken, isAnonymous, isKo]);

  const pet = pets.find((item) => item.id === petId) ?? null;
  const petPosts = useMemo(() => posts.filter((post) => post.pet_id === petId), [posts, petId]);

  if (!configured) {
    return <GlassCard className="text-sm text-plum/70">Supabase 설정 후 펫 상세를 볼 수 있어요.</GlassCard>;
  }

  if (isAnonymous) {
    return (
      <GlassCard className="text-center">
        <p className="text-sm text-plum/70">{isKo ? "펫 상세를 보려면 로그인이 필요해요." : "Please log in to view pet details."}</p>
        <Link href="/login" className="mt-4 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-white">
          {isKo ? "로그인하기" : "Log in"}
        </Link>
      </GlassCard>
    );
  }

  if (loading || !ready) {
    return <p className="text-sm text-white/75">{isKo ? "펫 상세 불러오는 중..." : "Loading pet detail..."}</p>;
  }

  if (error) {
    return <GlassCard className="text-sm text-red-700/80">{error}</GlassCard>;
  }

  if (!pet) {
    return <EmptyStatePanel {...getEmptyStatePreset("petDetail", isKo)} />;
  }

  const q = petQuery(pet, locale);
  const typeLabels = TYPE_LABELS[isKo ? "ko" : "en"];
  const petSpeciesLabel = speciesLabel(pet.species, isKo);
  const genderLabel =
    pet.gender === "male" ? (isKo ? "수" : "Male") : pet.gender === "female" ? (isKo ? "암" : "Female") : isKo ? "미상" : "Unknown";
  const totalLikes = petPosts.reduce((sum, post) => sum + post.like_count, 0);
  const moodScore = Math.min(98, 70 + pet.readings.length * 5 + petPosts.length * 2);

  return (
    <div className="space-y-8">
      <section className="flex flex-col items-center text-center">
        <div className="relative mb-6 h-40 w-40 md:h-56 md:w-56">
          <div className="absolute inset-0 animate-pulse rounded-full bg-white/10" aria-hidden />
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-white/85 bg-[#f4f1ea]/90 text-6xl shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
            {(() => {
              const avatar = petAvatarImageProps(pet, 448);
              return avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar.src} alt="" className="h-full w-full object-cover" />
              ) : (
                <span aria-hidden>{speciesEmoji(pet.species)}</span>
              );
            })()}
          </div>
          <span className="absolute bottom-2 right-2 rounded-full border border-[#b22222]/25 bg-[#fcf9f2]/95 px-3 py-1 text-xs font-bold text-[#222222] shadow-sm">
            {pet.latestSaju ? typeLabels[pet.latestSaju.saju_type] : isKo ? "새 사주 대기" : "Ready"}
          </span>
        </div>
        <h1 className="human-premium-serif text-3xl font-bold tracking-tight text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.25)] md:text-4xl">{pet.name}</h1>
        <p className="mt-2 text-sm font-semibold text-[#f3e8ff]">
          {petSpeciesLabel}
          {pet.breed ? ` · ${pet.breed}` : ""} · {pet.birth_date} ({ageLabel(pet.birth_date, isKo)}) · {genderLabel}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {(pet.personality_tags.length ? pet.personality_tags : [isKo ? "사주대기" : "Ready", isKo ? "집사바라기" : "Pet parent bond"]).map((tag) => (
            <span key={tag} className="rounded-full border border-white/35 bg-white/14 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
              #{tag}
            </span>
          ))}
        </div>
      </section>

      <GlassCard variant="solid" className="text-primary">
        <PetCareCalendar petId={pet.id} petName={pet.name} isKo={isKo} accessToken={accessToken} />
      </GlassCard>

      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard variant="solid" className="flex flex-col justify-between text-primary">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-primary">{isKo ? "사주 리포트 요약" : "Saju summary"}</h2>
            <span className="text-2xl" aria-hidden>
              ✨
            </span>
          </div>
          <p className="mt-5 text-sm leading-6 text-plum/85">
            {pet.latestSaju
              ? isKo
                ? `${pet.name}의 최근 ${typeLabels[pet.latestSaju.saju_type]} 리포트가 저장되어 있어요. 리포트 보관함에서 다시 확인할 수 있습니다.`
                : `${pet.name}'s latest ${typeLabels[pet.latestSaju.saju_type]} report is saved in your vault.`
              : isKo
                ? "아직 저장된 리포트가 없어요. 기본 사주부터 확인해 보세요."
                : "No saved report yet. Start with a basic saju reading."}
          </p>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wide text-plum/75">
              <span>{isKo ? "리포트 누적" : "Saved reports"}</span>
              <span>{pet.readings.length}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#e9e5d9]">
              <div className="h-full rounded-full bg-[#b22222]" style={{ width: `${Math.min(100, pet.readings.length * 25)}%` }} />
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="solid" className="text-primary">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary">{isKo ? "오늘의 펫 지수" : "Today's pet index"}</h2>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b22222] text-sm font-bold text-white">{moodScore}</div>
          </div>
          <div className="space-y-4">
            {[
              { title: isKo ? "케어 운" : "Care luck", value: `${moodScore}%`, body: isKo ? "오늘은 교감 루틴을 이어가기 좋아요." : "A good day to continue bonding routines.", icon: "💚" },
              { title: isKo ? "Pet Show 반응" : "Pet Show reaction", value: String(totalLikes), body: isKo ? "받은 좋아요를 기준으로 한 모먼트 지수예요." : "Moment score from received likes.", icon: "📸" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 rounded-2xl border border-[#222222]/10 bg-[#fcf9f2] p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary-fixed text-xl">{item.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between gap-3">
                    <span className="font-bold text-primary">{item.title}</span>
                    <span className="font-bold text-[#b22222]">{item.value}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-plum/80">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard variant="solid" className="text-primary">
          <h2 className="mb-5 text-2xl font-bold text-primary">{isKo ? "사주 이어보기" : "Continue reading"}</h2>
          <div className="grid gap-3">
            <Link href={`/saju/zodiac?${q}`} className="rounded-2xl bg-channel-saju/10 px-4 py-3 text-sm font-bold text-channel-saju transition hover:bg-channel-saju/20">
              ⭐ {isKo ? "별자리 운세 보기" : "Read zodiac fortune"}
            </Link>
            <Link href={`/saju/compatibility?${q}`} className="rounded-2xl bg-petal/45 px-4 py-3 text-sm font-bold text-primary transition hover:bg-petal/70">
              💞 {isKo ? "펫과 집사 궁합 보기" : "Check pet-parent bond"}
            </Link>
            <Link href="/reports" className="rounded-2xl bg-mint/45 px-4 py-3 text-sm font-bold text-ink transition hover:brightness-105">
              📁 {isKo ? "리포트 보관함" : "Report vault"}
            </Link>
          </div>
        </GlassCard>

        <GlassCard variant="solid" className="text-primary">
          <SectionHeader
            title={isKo ? "마이 모먼트" : "My moments"}
            subtitle={isKo ? "이 펫으로 올린 Pet Show 사진" : "Pet Show photos connected to this pet"}
            action={
              <Link href="/community/pet-show/upload" className="text-sm font-bold text-channel-saju underline">
                {isKo ? "올리기" : "Upload"}
              </Link>
            }
          />
          {petPosts.length === 0 ? (
            <p className="mt-5 rounded-2xl bg-[#f5f3ef] px-4 py-5 text-sm text-plum/80">
              {isKo ? "아직 연결된 Pet Show 사진이 없어요." : "No connected Pet Show photos yet."}
            </p>
          ) : (
            <div className="mt-5 grid h-[240px] grid-cols-2 gap-3">
              {petPosts.slice(0, 3).map((post, index) => (
                <Link
                  key={post.id}
                  href={`/community/pet-show/${post.id}`}
                  className={`relative overflow-hidden rounded-2xl bg-surface-container ${index === 0 ? "row-span-2" : ""}`}
                >
                  {post.image_urls[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={supabaseImageTransformUrl(post.image_urls[0], { width: 480, height: 480 })} alt="" className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-3xl">🐾</span>
                  )}
                  <span className="absolute bottom-2 left-2 rounded-full bg-black/25 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
                    ♥ {post.like_count}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
