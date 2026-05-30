"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import type { Profile } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

const PROVIDER_LABEL = {
  ko: {
    anonymous: "게스트",
    email: "이메일",
  },
  en: {
    anonymous: "Guest",
    email: "Email",
  },
} as const;

const PROVIDER_FALLBACK: Record<string, string> = {
  google: "Google",
  facebook: "Facebook",
  naver: "Naver",
  kakao: "Kakao",
};

const AVATAR_SPRITE_URL = "/images/owner-avatar-presets.png";
const AVATAR_PRESETS = [
  { x: 115, y: 92 },
  { x: 270, y: 92 },
  { x: 420, y: 92 },
  { x: 570, y: 92 },
  { x: 720, y: 92 },
  { x: 865, y: 92 },
  { x: 115, y: 255 },
  { x: 270, y: 255 },
  { x: 420, y: 255 },
  { x: 570, y: 255 },
  { x: 720, y: 255 },
  { x: 865, y: 255 },
  { x: 115, y: 414 },
  { x: 270, y: 414 },
  { x: 420, y: 414 },
  { x: 570, y: 414 },
  { x: 720, y: 414 },
  { x: 865, y: 414 },
] as const;

function avatarPresetUrl(index: number) {
  return `${AVATAR_SPRITE_URL}?preset=${index}`;
}

function avatarPresetIndexFromUrl(url: string | null | undefined) {
  if (!url?.startsWith(AVATAR_SPRITE_URL)) return null;
  const preset = new URL(url, "https://local.invalid").searchParams.get("preset");
  const index = Number(preset);
  return Number.isInteger(index) && index >= 0 && index < AVATAR_PRESETS.length ? index : null;
}

function AvatarPresetVisual({ index, className = "" }: { index: number; className?: string }) {
  const preset = AVATAR_PRESETS[index] ?? AVATAR_PRESETS[0];
  const scale = 0.4375;

  return (
    <span
      aria-hidden
      className={`block h-full w-full rounded-full bg-white bg-no-repeat ${className}`}
      style={{
        backgroundImage: `url(${AVATAR_SPRITE_URL})`,
        backgroundSize: `${1024 * scale}px ${685 * scale}px`,
        backgroundPosition: `-${preset.x * scale}px -${preset.y * scale}px`,
      }}
    />
  );
}

export function UserProfileCard({ showEditor = false }: { showEditor?: boolean }) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { ready, accessToken, configured, isAnonymous, email, provider, refresh } = useSupabaseSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileLocale, setProfileLocale] = useState<"ko" | "en">("ko");
  const [timezone, setTimezone] = useState("Asia/Seoul");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    if (!configured || !ready || !accessToken) return;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? (isKo ? "프로필을 불러오지 못했어요." : "Could not load your profile."));
          return;
        }
        const nextProfile = (data.profile ?? null) as Profile | null;
        setProfile(nextProfile);
        if (nextProfile) {
          setDisplayName(nextProfile.display_name ?? "");
          setAvatarUrl(nextProfile.avatar_url ?? null);
          setProfileLocale(nextProfile.locale === "en" ? "en" : "ko");
          setTimezone(nextProfile.timezone ?? "Asia/Seoul");
        }
      } catch {
        setError(isKo ? "네트워크 오류" : "Network error");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [configured, ready, accessToken, isAnonymous, isKo]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
          locale: profileLocale,
          timezone,
          avatarUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? (isKo ? "프로필 저장에 실패했어요." : "Could not save profile."));
        return;
      }

      const nextProfile = data.profile as Profile;
      setProfile(nextProfile);
      setDisplayName(nextProfile.display_name ?? "");
      setAvatarUrl(nextProfile.avatar_url ?? null);
      setProfileLocale(nextProfile.locale === "en" ? "en" : "ko");
      setTimezone(nextProfile.timezone ?? "Asia/Seoul");
      setShowAvatarPicker(false);
      setMessage(isKo ? "프로필이 저장됐어요." : "Profile saved.");
      await refresh();
    } catch {
      setError(isKo ? "네트워크 오류" : "Network error");
    } finally {
      setSaving(false);
    }
  }

  if (!configured) {
    return (
      <p className="text-sm text-plum/70">
        {isKo ? (
          <>
            <code>.env.local</code>에 Supabase 키를 설정하면 내 프로필이 표시됩니다.
          </>
        ) : (
          <>
            Add Supabase keys to <code>.env.local</code> to show your profile.
          </>
        )}
      </p>
    );
  }

  if (!ready || loading) {
    return <p className="text-sm text-plum/60">{isKo ? "내 정보 불러오는 중…" : "Loading my info…"}</p>;
  }

  if (isAnonymous) {
    return (
      <article className="rounded-2xl border border-dashed border-plum/20 bg-lavender/15 px-5 py-5 text-center">
        <p className="text-3xl" aria-hidden>
          👤
        </p>
        <h3 className="mt-2 text-lg font-bold text-plum">
          {isKo ? "게스트로 이용 중" : "Using as Guest"}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-plum/65">
          {isKo
            ? "로그인하면 사주 결과와 펫 프로필을 계정에 안전하게 저장할 수 있어요."
            : "Log in to save saju results and pet profiles safely to your account."}
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex rounded-full bg-channel-saju px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105"
        >
          {isKo ? "로그인 / 가입하기" : "Log in / Sign up"}
        </Link>
      </article>
    );
  }

  if (error && !profile) {
    return <p className="text-sm text-red-700/80">{error}</p>;
  }

  const providerLabel =
    PROVIDER_LABEL[isKo ? "ko" : "en"][provider as "anonymous" | "email"] ??
    PROVIDER_LABEL[isKo ? "ko" : "en"][profile?.provider as "anonymous" | "email"] ??
    PROVIDER_FALLBACK[provider ?? profile?.provider ?? ""] ??
    provider ??
    profile?.provider ??
    (isKo ? "알 수 없음" : "Unknown");

  const shownName = profile?.display_name ?? email?.split("@")[0] ?? (isKo ? "집사님" : "Pet parent");
  const shownAvatarUrl = avatarUrl ?? profile?.avatar_url ?? null;
  const shownAvatarPresetIndex = avatarPresetIndexFromUrl(shownAvatarUrl);

  return (
    <article className="rounded-2xl border border-plum/15 bg-white/50 px-5 py-4">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => showEditor && setShowAvatarPicker((open) => !open)}
          disabled={!showEditor}
          className={
            showEditor
              ? "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-lavender/40 text-2xl ring-channel-saju/0 transition hover:ring-4"
              : "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-lavender/40 text-2xl"
          }
          aria-label={showEditor ? (isKo ? "주인 이미지 선택 열기" : "Open owner image picker") : undefined}
        >
          {shownAvatarPresetIndex !== null ? (
            <AvatarPresetVisual index={shownAvatarPresetIndex} />
          ) : shownAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={supabaseImageTransformUrl(shownAvatarUrl, { width: 112, height: 112 })}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span aria-hidden>👤</span>
          )}
          {showEditor && (
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-white bg-channel-saju text-xs text-white shadow-sm">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="5" width="16" height="14" rx="2" />
                <path d="m4 16 4.5-4.5a1.5 1.5 0 0 1 2.1 0L15 16" />
                <path d="m13 14 1.5-1.5a1.5 1.5 0 0 1 2.1 0L20 16" />
                <circle cx="15.5" cy="9.5" r="1.5" />
              </svg>
            </span>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-plum">{shownName}</h3>
          {email && <p className="mt-0.5 text-sm text-plum/65">{email}</p>}
          <p className="mt-1 text-sm text-plum/65">
            {isKo ? "로그인" : "Login"}: {providerLabel}
            {profile?.role === "admin" ? (isKo ? " · 관리자" : " · Admin") : ""}
          </p>
          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className="mt-2 inline-flex text-sm font-semibold text-plum underline"
            >
              {isKo ? "관리자 대시보드" : "Admin dashboard"} →
            </Link>
          )}
          {profile && (
            <dl className="mt-3 grid gap-1 text-xs text-plum/55 sm:grid-cols-2">
              <div>
                <dt className="inline font-medium text-plum/70">{isKo ? "언어 " : "Language "}</dt>
                <dd className="inline">{profile.locale === "en" ? "English" : isKo ? "한국어" : "Korean"}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-plum/70">{isKo ? "시간대 " : "Timezone "}</dt>
                <dd className="inline">{profile.timezone}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="inline font-medium text-plum/70">{isKo ? "가입 " : "Joined "}</dt>
                <dd className="inline">
                  {new Date(profile.created_at).toLocaleDateString(isKo ? "ko-KR" : "en-US")}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </div>
      {(message || error) && !showEditor && (
        <div className="mt-3 rounded-2xl bg-white/55 px-4 py-2 text-xs">
          {message && <p className="font-medium text-channel-community">{message}</p>}
          {error && <p className="text-red-700/80">{error}</p>}
        </div>
      )}
      {showEditor && (
        <form onSubmit={handleSave} className="mt-5 grid gap-3 rounded-2xl bg-white/45 p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="mt-2 text-[11px] text-plum/45">
              {isKo ? "위 주인 이미지 칸을 클릭하면 준비된 이미지를 선택할 수 있어요." : "Click the owner image above to choose a prepared image."}
            </p>
            {showAvatarPicker && (
              <div className="mt-3 rounded-2xl bg-white/55 p-3">
                <p className="text-xs font-medium text-plum/70">
                  {isKo ? "주인 이미지 선택" : "Choose owner image"}
                </p>
                <div className="mt-2 grid grid-cols-6 gap-2 sm:grid-cols-9">
                  {AVATAR_PRESETS.map((_, index) => {
                    const selected = avatarPresetIndexFromUrl(avatarUrl) === index;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setAvatarUrl(avatarPresetUrl(index));
                          setShowAvatarPicker(false);
                        }}
                        className={
                          selected
                            ? "h-12 w-12 rounded-full border-2 border-channel-saju p-0.5 shadow-sm"
                            : "h-12 w-12 rounded-full border border-white/80 p-0.5 opacity-80 transition hover:opacity-100 hover:ring-2 hover:ring-channel-saju/25"
                        }
                        aria-label={isKo ? `주인 이미지 ${index + 1}` : `Owner image ${index + 1}`}
                      >
                        <AvatarPresetVisual index={index} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <label className="block text-xs font-medium text-plum/70 sm:col-span-2">
            {isKo ? "닉네임" : "Display name"}
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="pastel-input"
              minLength={2}
              maxLength={32}
              required
            />
          </label>
          <label className="block text-xs font-medium text-plum/70">
            {isKo ? "언어" : "Language"}
            <select
              value={profileLocale}
              onChange={(e) => setProfileLocale(e.target.value === "en" ? "en" : "ko")}
              className="pastel-input"
            >
              <option value="ko">{isKo ? "한국어" : "Korean"}</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="block text-xs font-medium text-plum/70">
            {isKo ? "시간대" : "Timezone"}
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="pastel-input">
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </label>
          {message && <p className="text-xs font-medium text-channel-community sm:col-span-2">{message}</p>}
          {error && <p className="text-xs text-red-700/80 sm:col-span-2">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-channel-saju px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-60 sm:col-span-2"
          >
            {saving ? (isKo ? "저장 중…" : "Saving…") : isKo ? "프로필 저장" : "Save profile"}
          </button>
        </form>
      )}
    </article>
  );
}
