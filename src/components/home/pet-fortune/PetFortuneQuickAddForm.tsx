"use client";

import { PetBasicInfoFields } from "@/components/pet/PetBasicInfoFields";
import { PetPhotoUploadField } from "@/components/pet/PetPhotoUploadField";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { uploadPetFortunePhotoClient } from "@/lib/pets/photo-upload-client";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Gender, Locale, Species } from "@/lib/saju/types";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

const SPECIES_OPTIONS: { value: Species; emoji: string; labelKey: "dog" | "cat" | "reptile" | "otherFriends" }[] = [
  { value: "dog", emoji: "🐕", labelKey: "dog" },
  { value: "cat", emoji: "🐱", labelKey: "cat" },
  { value: "reptile", emoji: "🦎", labelKey: "reptile" },
  { value: "other", emoji: "🐾", labelKey: "otherFriends" },
];

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "Asia/Seoul";
  }
}

function SelectChevron() {
  return (
    <span className="pet-fortune-select-chevron" aria-hidden>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

type Props = {
  onAdded?: (petId: string) => void;
  sajuPetId?: string | null;
};

export function PetFortuneSajuGuide({ sajuPetId }: { sajuPetId?: string | null }) {
  const t = useTranslations("home.guestFortune");
  const tNav = useTranslations("nav");
  const sajuHref = sajuPetId ? `/saju?petId=${encodeURIComponent(sajuPetId)}` : "/saju";

  return (
    <div className="pet-fortune-saju-guide-box">
      <p className="pet-fortune-saju-guide-line">{t("quickAddGuideLine1")}</p>
      <p className="pet-fortune-saju-guide-line">
        {t("quickAddGuideLine2Before")}
        <Link href={sajuHref} className="pet-fortune-saju-guide-link">
          {tNav("saju")}
        </Link>
        {t("quickAddGuideLine2After")}
      </p>
    </div>
  );
}

export function PetFortuneQuickAddForm({ onAdded }: Props) {
  const locale = useLocale() as Locale;
  const isKo = locale === "ko";
  const t = useTranslations("home.guestFortune");
  const { ready, accessToken, email: sessionEmail, isFullMember, refresh } =
    useSupabaseSession();
  const sessionReady = ready && Boolean(accessToken);
  /** Guest-grade: matches server !getRegisteredUserIdFromRequest / !isFullMember. */
  const isGuestGrade = !isFullMember;
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState<Species | "">("");
  const [petGender, setPetGender] = useState<Gender>("female");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("unknown");
  const [timezone, setTimezone] = useState(detectTimezone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoConsent, setPhotoConsent] = useState(false);
  const [photoFileError, setPhotoFileError] = useState<string | null>(null);
  const [photoUploadNotice, setPhotoUploadNotice] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradePassword, setUpgradePassword] = useState("");
  const [upgradePasswordConfirm, setUpgradePasswordConfirm] = useState("");
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  function isStrongPassword(value: string) {
    return value.length >= 10 && /[A-Za-z]/.test(value) && /\d/.test(value);
  }

  async function handleUpgradeSubmit(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !sessionEmail) return;

    if (!isStrongPassword(upgradePassword)) {
      setUpgradeError(t("upgradeWeak"));
      return;
    }
    if (upgradePassword !== upgradePasswordConfirm) {
      setUpgradeError(t("upgradeMismatch"));
      return;
    }

    setUpgradeLoading(true);
    setUpgradeError(null);
    setPhotoUploadNotice(null);

    try {
      const client = getSupabaseBrowserClient();
      if (!client) {
        setUpgradeError(t("upgradeFailed"));
        return;
      }

      const { error: passwordError } = await client.auth.updateUser({
        password: upgradePassword,
      });
      if (passwordError) {
        setUpgradeError(passwordError.message || t("upgradeFailed"));
        return;
      }

      const flagRes = await fetch("/api/auth/confirm-password-set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ password: upgradePassword }),
      });
      const flagData = (await flagRes.json()) as { error?: string };
      if (!flagRes.ok) {
        setUpgradeError(
          typeof flagData.error === "string" ? flagData.error : t("upgradeFailed")
        );
        return;
      }

      await client.auth.refreshSession();
      await refresh();

      setUpgradeOpen(false);
      setUpgradePassword("");
      setUpgradePasswordConfirm("");
      setMessage(t("upgradeSuccess"));
    } catch {
      setUpgradeError(t("upgradeFailed"));
    } finally {
      setUpgradeLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!species || !accessToken || !birthDate) return;

    const birthTimeUnknown = birthTime === "unknown";
    const parsed = new Date(`${birthDate}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      setError(t("invalidDate"));
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    setPhotoUploadNotice(null);

    try {
      const res = await fetch("/api/saju/basic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          petName: petName.trim(),
          species,
          petGender,
          birthDate,
          birthTime: birthTimeUnknown ? null : birthTime,
          birthTimeUnknown,
          timezone,
          locale,
          privacyConsent: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "guest_pet_limit") {
          setError(t("guestPetLimit"));
          return;
        }
        setError(typeof data.error === "string" ? data.error : isKo ? "등록에 실패했어요." : "Could not add pet.");
        return;
      }
      if (!data.petId) {
        if (data.code === "guest_pet_limit") {
          setError(t("guestPetLimit"));
          return;
        }
        setError(
          typeof data.persistError === "string" && data.persistError
            ? data.persistError
            : isKo
              ? "로그인 후 다시 시도해 주세요."
              : "Please log in and try again."
        );
        return;
      }

      const addedName = petName.trim();
      const petId = data.petId as string;

      if (photoFile && !photoFileError) {
        try {
          await uploadPetFortunePhotoClient(accessToken, petId, photoFile, photoConsent);
        } catch {
          setPhotoUploadNotice(
            isKo
              ? "사진 등록에 실패했어요. 프로필에서 다시 시도해주세요."
              : "Photo upload failed. Please try again from your profile."
          );
        }
      }

      setPetName("");
      setSpecies("");
      setPetGender("female");
      setBirthDate("");
      setBirthTime("unknown");
      setTimezone(detectTimezone());
      setPhotoFile(null);
      setPhotoConsent(false);
      setPhotoFileError(null);
      setMessage(isKo ? `${addedName || "펫"}이(가) 추가됐어요!` : "Pet added!");
      onAdded?.(petId);
    } catch {
      setError(isKo ? "네트워크 오류가 발생했어요." : "Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pet-fortune-quick-add">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <label className="pet-fortune-field">
            <div className="pet-fortune-input pet-fortune-input--saju pet-fortune-input--compact">
              <select
                className="pet-fortune-input-field pet-fortune-select"
                value={species}
                onChange={(e) => setSpecies(e.target.value as Species | "")}
                required
                aria-label={t("labelSpecies")}
              >
                <option value="" disabled>
                  {t("quickAddSpeciesPlaceholder")}
                </option>
                {SPECIES_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.emoji} {t(opt.labelKey)}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </label>
          <label className="pet-fortune-field">
            <div className="pet-fortune-input pet-fortune-input--compact">
              <input
                className="pet-fortune-input-field"
                placeholder={t("namePlaceholder")}
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                required
                maxLength={40}
                autoComplete="off"
                aria-label={t("labelName")}
              />
            </div>
          </label>
        </div>

        <PetBasicInfoFields
          locale={locale}
          variant="compact"
          petGender={petGender}
          onPetGenderChange={setPetGender}
          birthDate={birthDate}
          onBirthDateChange={setBirthDate}
          birthTime={birthTime}
          onBirthTimeChange={setBirthTime}
          timezone={timezone}
          onTimezoneChange={setTimezone}
        />

        {error ? <p className="pet-fortune-entry-error !mt-0 !py-2">{error}</p> : null}
        {photoUploadNotice ? (
          <p
            className="rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900"
            role="status"
          >
            {photoUploadNotice}
          </p>
        ) : null}
        {message ? <p className="text-center text-xs font-semibold text-channel-community">{message}</p> : null}

        <PetPhotoUploadField
          locale={locale}
          petName={petName}
          disabled={loading || !sessionReady}
          file={photoFile}
          consent={photoConsent}
          fileError={photoFileError}
          onFileChange={(file, fileError) => {
            setPhotoFile(file);
            setPhotoFileError(fileError);
            if (!file) setPhotoConsent(false);
          }}
          onConsentChange={setPhotoConsent}
        />

        {!sessionReady ? (
          <p className="text-center text-xs font-semibold text-stone-500" role="status">
            {t("sessionPreparing")}
          </p>
        ) : null}

        <button type="submit" className="pet-fortune-quick-add-btn" disabled={loading || !sessionReady}>
          {loading ? t("loading") : t("quickAddSubmit")}
        </button>
      </form>

      {isGuestGrade && sessionEmail ? (
        <div className="mt-3 space-y-2">
          {!upgradeOpen ? (
            <button
              type="button"
              className="w-full rounded-2xl border border-channel-saju/30 bg-lavender/40 px-4 py-2.5 text-xs font-bold text-plum transition hover:bg-lavender/70"
              disabled={!sessionReady || loading}
              onClick={() => {
                setUpgradeOpen(true);
                setUpgradeError(null);
              }}
            >
              {t("upgradeOpen")}
            </button>
          ) : (
            <form
              onSubmit={(e) => void handleUpgradeSubmit(e)}
              className="space-y-2 rounded-2xl border border-stone-200/80 bg-white/80 p-3"
            >
              <label className="pet-fortune-field">
                <span className="mb-1 block text-[11px] font-semibold text-stone-600">
                  {t("upgradePassword")}
                </span>
                <div className="pet-fortune-input pet-fortune-input--compact">
                  <input
                    className="pet-fortune-input-field"
                    type="password"
                    value={upgradePassword}
                    onChange={(e) => setUpgradePassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    disabled={upgradeLoading}
                    aria-label={t("upgradePassword")}
                  />
                </div>
              </label>
              <label className="pet-fortune-field">
                <span className="mb-1 block text-[11px] font-semibold text-stone-600">
                  {t("upgradePasswordConfirm")}
                </span>
                <div className="pet-fortune-input pet-fortune-input--compact">
                  <input
                    className="pet-fortune-input-field"
                    type="password"
                    value={upgradePasswordConfirm}
                    onChange={(e) => setUpgradePasswordConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                    disabled={upgradeLoading}
                    aria-label={t("upgradePasswordConfirm")}
                  />
                </div>
              </label>
              <p className="text-[11px] font-semibold text-stone-500">{t("upgradePasswordRule")}</p>
              {upgradeError ? (
                <p className="pet-fortune-entry-error !mt-0 !py-2">{upgradeError}</p>
              ) : null}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-600"
                  disabled={upgradeLoading}
                  onClick={() => {
                    setUpgradeOpen(false);
                    setUpgradeError(null);
                    setUpgradePassword("");
                    setUpgradePasswordConfirm("");
                  }}
                >
                  {t("upgradeCancel")}
                </button>
                <button
                  type="submit"
                  className="pet-fortune-quick-add-btn flex-1 !py-2 text-xs"
                  disabled={upgradeLoading || !sessionReady}
                >
                  {upgradeLoading ? t("loading") : t("upgradeSubmit")}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
