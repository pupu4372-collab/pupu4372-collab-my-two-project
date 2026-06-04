"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import { COUNTRY_OPTIONS, getCountryLabel, normalizeCountryCode } from "@/lib/i18n/countries";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import { clearSupabaseBrowserSession } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";
import { GlassCard } from "@/components/layout/StitchLayout";
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
const AVATAR_SPRITE_SIZE = { width: 1024, height: 685 };
const AVATAR_FRAME_SIZE = 140;

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

  return (
    <span
      aria-hidden
      className={`relative block h-full w-full overflow-hidden rounded-full bg-white ${className}`}
    >
      <span
        className="absolute bg-no-repeat"
        style={{
          backgroundImage: `url(${AVATAR_SPRITE_URL})`,
          backgroundSize: "100% 100%",
          height: `${(AVATAR_SPRITE_SIZE.height / AVATAR_FRAME_SIZE) * 100}%`,
          left: `${-(preset.x / AVATAR_FRAME_SIZE) * 100}%`,
          top: `${-(preset.y / AVATAR_FRAME_SIZE) * 100}%`,
          width: `${(AVATAR_SPRITE_SIZE.width / AVATAR_FRAME_SIZE) * 100}%`,
        }}
      />
    </span>
  );
}

interface UserProfileCardProps {
  showEditor?: boolean;
  presentation?: "default" | "hero" | "settings";
  onEdit?: () => void;
}

export function UserProfileCard({
  showEditor = false,
  presentation = "default",
  onEdit,
}: UserProfileCardProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { ready, accessToken, configured, isAnonymous, email, provider, refresh } = useSupabaseSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileLocale, setProfileLocale] = useState<"ko" | "en">("ko");
  const [timezone, setTimezone] = useState("Asia/Seoul");
  const [countryCode, setCountryCode] = useState("");
  const [showCountry, setShowCountry] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
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
          setCountryCode(normalizeCountryCode(nextProfile.country_code) ?? "");
          setShowCountry(nextProfile.show_country ?? true);
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
          countryCode: countryCode || null,
          showCountry,
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
      setCountryCode(normalizeCountryCode(nextProfile.country_code) ?? "");
      setShowCountry(nextProfile.show_country ?? true);
      setShowAvatarPicker(false);
      setMessage(isKo ? "프로필이 저장됐어요." : "Profile saved.");
      await refresh();
    } catch {
      setError(isKo ? "네트워크 오류" : "Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!accessToken || deletingAccount) return;

    const ok = window.confirm(
      isKo
        ? "정말 탈퇴할까요?\n프로필, 반려동물, 사주 결과, 작성한 게시글이 함께 삭제되며 복구할 수 없습니다."
        : "Delete your account?\nYour profile, pets, saju results, and posts will be deleted and cannot be restored."
    );
    if (!ok) return;

    setDeletingAccount(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? (isKo ? "탈퇴 처리에 실패했어요." : "Could not delete account."));
      }

      clearSupabaseBrowserSession();
      window.location.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : isKo ? "탈퇴 처리에 실패했어요." : "Could not delete account.");
      setDeletingAccount(false);
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
      <GlassCard className="border border-dashed border-plum/20 text-center">
        <p className="text-3xl" aria-hidden>
          👤
        </p>
        <h3 className="mt-2 text-lg font-bold text-primary">{isKo ? "게스트로 이용 중" : "Using as Guest"}</h3>
        <p className="mt-2 text-sm leading-relaxed text-plum/65">
          {isKo
            ? "로그인하면 사주 결과와 펫 프로필을 계정에 안전하게 저장할 수 있어요."
            : "Log in to save saju results and pet profiles safely to your account."}
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105"
        >
          {isKo ? "로그인 / 가입하기" : "Log in / Sign up"}
        </Link>
      </GlassCard>
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
  const shownCountry = profile?.show_country ? getCountryLabel(profile.country_code, locale) : null;
  const joinedLabel = profile
    ? new Date(profile.created_at).toLocaleDateString(isKo ? "ko-KR" : "en-US")
    : null;

  const avatarButton = (size: "md" | "lg") => {
    const dim = size === "lg" ? "h-24 w-24 text-3xl" : "h-14 w-14 text-2xl";
    return (
      <button
        type="button"
        onClick={() => showEditor && setShowAvatarPicker((open) => !open)}
        disabled={!showEditor}
        className={`relative flex ${dim} shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-lavender/40 shadow-lg ${
          showEditor ? "transition hover:ring-4 hover:ring-channel-saju/25" : ""
        }`}
        aria-label={showEditor ? (isKo ? "이미지 선택 열기" : "Open image picker") : undefined}
      >
        {shownAvatarPresetIndex !== null ? (
          <AvatarPresetVisual index={shownAvatarPresetIndex} />
        ) : shownAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={supabaseImageTransformUrl(shownAvatarUrl, { width: size === "lg" ? 192 : 112, height: size === "lg" ? 192 : 112 })}
            alt=""
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span aria-hidden>👤</span>
        )}
        {showEditor && (
          <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-xs text-white shadow-sm">
            ✎
          </span>
        )}
      </button>
    );
  };

  const editorForm = showEditor ? (
    <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <p className="text-[11px] text-plum/45">
          {isKo ? "프로필 이미지를 클릭하면 준비된 이미지를 선택할 수 있어요." : "Click your profile image to choose a prepared avatar."}
        </p>
        {showAvatarPicker && (
          <div className="mt-3 rounded-2xl bg-surface-container-low/80 p-3">
            <p className="text-xs font-medium text-plum/70">{isKo ? "이미지 선택" : "Choose image"}</p>
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
                        ? "h-12 w-12 rounded-full border-2 border-primary p-0.5 shadow-sm"
                        : "h-12 w-12 rounded-full border border-white/80 p-0.5 opacity-80 transition hover:opacity-100 hover:ring-2 hover:ring-primary/25"
                    }
                    aria-label={isKo ? `이미지 ${index + 1}` : `Image ${index + 1}`}
                  >
                    <AvatarPresetVisual index={index} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant sm:col-span-2">
        {isKo ? "닉네임" : "Display name"}
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="pastel-input mt-2 bg-sand/50"
          minLength={2}
          maxLength={32}
          required
        />
      </label>
      <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant">
        {isKo ? "언어" : "Language"}
        <select
          value={profileLocale}
          onChange={(e) => setProfileLocale(e.target.value === "en" ? "en" : "ko")}
          className="pastel-input mt-2 bg-sand/50"
        >
          <option value="ko">{isKo ? "한국어" : "Korean"}</option>
          <option value="en">English</option>
        </select>
      </label>
      <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant">
        {isKo ? "시간대" : "Timezone"}
        <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="pastel-input mt-2 bg-sand/50">
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant">
        {isKo ? "국가" : "Country"}
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="pastel-input mt-2 bg-sand/50"
        >
          <option value="">{isKo ? "선택 안 함" : "Not selected"}</option>
          {COUNTRY_OPTIONS.map((country) => (
            <option key={country.code} value={country.code}>
              {country.emoji} {isKo ? country.ko : country.en}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-3 rounded-2xl bg-sand/45 px-4 py-3 text-xs font-bold text-on-surface-variant">
        <input
          type="checkbox"
          checked={showCountry}
          onChange={(e) => setShowCountry(e.target.checked)}
          className="h-4 w-4 rounded border-outline/40 text-primary focus:ring-primary/30"
        />
        <span>{isKo ? "작성글/사진에 국가 표시" : "Show country on posts/photos"}</span>
      </label>
      {email && (
        <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant sm:col-span-2">
          {isKo ? "이메일" : "Email"}
          <input value={email} readOnly className="pastel-input mt-2 cursor-not-allowed bg-surface-container text-on-surface-variant opacity-70" />
        </label>
      )}
      {message && <p className="text-xs font-medium text-channel-community sm:col-span-2">{message}</p>}
      {error && <p className="text-xs text-red-700/80 sm:col-span-2">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:brightness-110 disabled:opacity-60 sm:col-span-2"
      >
        {saving ? (isKo ? "저장 중…" : "Saving…") : isKo ? "변경사항 저장" : "Save changes"}
      </button>
    </form>
  ) : null;

  const deleteAccountBlock =
    showEditor && profile?.role !== "admin" ? (
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => void handleDeleteAccount()}
          disabled={deletingAccount}
          className="inline-flex items-center gap-1 text-sm text-on-surface-variant transition hover:text-error disabled:opacity-60"
        >
          {deletingAccount ? (isKo ? "탈퇴 처리 중…" : "Deleting…") : isKo ? "회원 탈퇴" : "Delete account"}
        </button>
      </div>
    ) : null;

  if (presentation === "hero") {
    return (
      <GlassCard className="relative flex flex-col items-center overflow-hidden text-center">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl" aria-hidden />
        <div className="relative mb-4">{avatarButton("lg")}</div>
        <h2 className="text-2xl font-bold text-primary">{shownName}</h2>
        {email && <p className="mt-1 text-sm text-plum/65">{email}</p>}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {joinedLabel && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {isKo ? `가입일: ${joinedLabel}` : `Joined: ${joinedLabel}`}
            </span>
          )}
          <span className="rounded-full bg-mint/50 px-3 py-1 text-xs font-bold text-channel-community">
            {providerLabel}
          </span>
          {shownCountry && (
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-plum/70">
              {shownCountry}
            </span>
          )}
        </div>
        {profile?.role === "admin" && (
          <Link href="/admin" className="mt-3 text-sm font-semibold text-primary underline">
            {isKo ? "관리자 대시보드" : "Admin dashboard"} →
          </Link>
        )}
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
          >
            {isKo ? "프로필 편집" : "Edit profile"}
          </button>
        )}
        {(message || error) && (
          <div className="mt-4 w-full rounded-2xl bg-white/55 px-4 py-2 text-xs">
            {message && <p className="font-medium text-channel-community">{message}</p>}
            {error && <p className="text-red-700/80">{error}</p>}
          </div>
        )}
      </GlassCard>
    );
  }

  if (presentation === "settings") {
    return (
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <GlassCard className="sticky top-24 text-center">
            <div className="mb-4 flex justify-center">{avatarButton("lg")}</div>
            <h2 className="text-xl font-bold text-primary">{shownName}</h2>
            {email && <p className="mt-1 text-sm text-plum/65">{email}</p>}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{providerLabel}</span>
              {shownCountry && (
                <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-plum/70">
                  {shownCountry}
                </span>
              )}
              {profile?.role === "admin" && (
                <span className="rounded-full bg-channel-saju/15 px-3 py-1 text-xs font-bold text-channel-saju">
                  {isKo ? "관리자" : "Admin"}
                </span>
              )}
            </div>
          </GlassCard>
        </aside>
        <div className="space-y-6 lg:col-span-8">
          <GlassCard>
            <div className="mb-6 flex items-center gap-2">
              <span aria-hidden>👤</span>
              <h3 className="text-lg font-semibold text-primary">{isKo ? "개인정보 설정" : "Personal info"}</h3>
            </div>
            {editorForm}
          </GlassCard>
          {deleteAccountBlock}
        </div>
      </div>
    );
  }

  return (
    <article className="rounded-2xl border border-plum/15 bg-white/50 px-5 py-4">
      <div className="flex items-start gap-4">
        {avatarButton("md")}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-plum">{shownName}</h3>
          {email && <p className="mt-0.5 text-sm text-plum/65">{email}</p>}
          <p className="mt-1 text-sm text-plum/65">
            {isKo ? "로그인" : "Login"}: {providerLabel}
            {profile?.role === "admin" ? (isKo ? " · 관리자" : " · Admin") : ""}
          </p>
          {shownCountry && <p className="mt-1 text-sm font-semibold text-plum/65">{shownCountry}</p>}
          {profile?.role === "admin" && (
            <Link href="/admin" className="mt-2 inline-flex text-sm font-semibold text-plum underline">
              {isKo ? "관리자 대시보드" : "Admin dashboard"} →
            </Link>
          )}
          {profile && joinedLabel && (
            <p className="mt-2 text-xs text-plum/55">
              {isKo ? "가입 " : "Joined "}
              {joinedLabel}
            </p>
          )}
        </div>
      </div>
      {(message || error) && !showEditor && (
        <div className="mt-3 rounded-2xl bg-white/55 px-4 py-2 text-xs">
          {message && <p className="font-medium text-channel-community">{message}</p>}
          {error && <p className="text-red-700/80">{error}</p>}
        </div>
      )}
      {editorForm && <div className="mt-5 rounded-2xl bg-white/45 p-4">{editorForm}</div>}
      {showEditor && profile?.role !== "admin" && (
        <div className="mt-5 rounded-2xl border border-red-200/70 bg-red-50/60 p-4">
          <p className="text-sm font-bold text-red-800">{isKo ? "계정 탈퇴" : "Delete account"}</p>
          <p className="mt-1 text-xs leading-relaxed text-red-700/75">
            {isKo
              ? "탈퇴하면 계정과 저장된 반려동물, 사주 결과, 작성한 게시글이 삭제됩니다."
              : "Deleting your account removes your saved pets, saju results, and posts."}
          </p>
          <button
            type="button"
            onClick={() => void handleDeleteAccount()}
            disabled={deletingAccount}
            className="mt-3 rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:brightness-105 disabled:opacity-60"
          >
            {deletingAccount ? (isKo ? "탈퇴 처리 중…" : "Deleting…") : isKo ? "탈퇴하기" : "Delete account"}
          </button>
        </div>
      )}
    </article>
  );
}
