"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
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
  const [uploading, setUploading] = useState(false);

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
      setMessage(isKo ? "프로필이 저장됐어요." : "Profile saved.");
      await refresh();
    } catch {
      setError(isKo ? "네트워크 오류" : "Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleOwnerImageUpload(file: File | null) {
    if (!file || !accessToken) return;

    setUploading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", "owner");

    try {
      const res = await fetch("/api/profile/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? (isKo ? "사진 업로드에 실패했어요." : "Could not upload photo."));
        return;
      }
      setAvatarUrl(data.imageUrl);
      setMessage(isKo ? "사진이 업로드됐어요. 저장 버튼을 눌러 반영해 주세요." : "Photo uploaded. Press save to apply it.");
    } catch {
      setError(isKo ? "네트워크 오류" : "Network error");
    } finally {
      setUploading(false);
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

  return (
    <article className="rounded-2xl border border-plum/15 bg-white/50 px-5 py-4">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-lavender/40 text-2xl">
          {(avatarUrl ?? profile?.avatar_url) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={(avatarUrl ?? profile?.avatar_url) as string}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span aria-hidden>👤</span>
          )}
        </div>
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
      {showEditor && (
        <form onSubmit={handleSave} className="mt-5 grid gap-3 rounded-2xl bg-white/45 p-4 sm:grid-cols-2">
          <div className="block text-xs font-medium text-plum/70 sm:col-span-2">
            <p>{isKo ? "내 사진" : "My photo"}</p>
            <input
              id="owner-profile-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => void handleOwnerImageUpload(e.target.files?.[0] ?? null)}
              className="sr-only"
              disabled={uploading}
            />
            <label
              htmlFor="owner-profile-photo"
              className="mt-2 inline-flex cursor-pointer rounded-full bg-mint/50 px-4 py-2 text-xs font-semibold text-plum transition hover:bg-mint/70"
            >
              {isKo ? "사진 선택" : "Choose photo"}
            </label>
            <span className="mt-1 block text-[11px] text-plum/45">
              {uploading
                ? isKo
                  ? "업로드 중..."
                  : "Uploading..."
                : isKo
                  ? "사진 선택 후 프로필 저장을 눌러주세요."
                  : "Choose a photo, then press Save profile."}
            </span>
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
