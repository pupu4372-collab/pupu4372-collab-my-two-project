"use client";

import { EmptyStatePanel, getEmptyStatePreset } from "@/components/ui/EmptyStatePanel";
import { PetPhotoUploadField } from "@/components/pet/PetPhotoUploadField";
import { petAvatarImageProps } from "@/lib/pets/pet-avatar";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import { uploadPetFortunePhotoClient } from "@/lib/pets/photo-upload-client";
import { compressImageForUpload } from "@/lib/images/upload-compression";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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
  photo_consent_secondary_use: boolean;
  personality_tags: string[];
  created_at: string;
  latestSaju: SajuReading | null;
  readings: SajuReading[];
}

type PetEditDraft = {
  name: string;
  species: "dog" | "cat" | "reptile" | "other";
  gender: "male" | "female" | "unknown";
  birthDate: string;
  birthTime: string;
  birthTimeUnknown: boolean;
  timezone: string;
  profileImageUrl: string | null;
};

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

function speciesBadgeClass(species: string) {
  if (species === "dog") return "bg-sky/45 text-channel-dog ring-1 ring-channel-dog/15";
  if (species === "cat") return "bg-blush/90 text-channel-cat ring-1 ring-channel-cat/15";
  if (species === "reptile") return "bg-mint/70 text-mok-green ring-1 ring-mok-green/15";
  return "bg-lavender/55 text-channel-saju ring-1 ring-channel-saju/15";
}

const PET_PROFILE_CARD =
  "pet-profile-card rounded-[2rem] p-5 text-ink transition active:scale-[0.99]";

function speciesLabel(species: string, labels: { dog: string; cat: string; reptile: string; otherFriends: string }) {
  if (species === "dog") return labels.dog;
  if (species === "cat") return labels.cat;
  if (species === "reptile") return labels.reptile;
  return labels.otherFriends;
}

function speciesEmoji(species: string) {
  if (species === "dog") return "🐕";
  if (species === "cat") return "🐈";
  if (species === "reptile") return "🦎";
  return "🐾";
}

function normalizeSpecies(species: string): PetEditDraft["species"] {
  if (species === "cat" || species === "reptile" || species === "other") return species;
  return "dog";
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

function draftFromPet(pet: PetRow): PetEditDraft {
  return {
    name: pet.name,
    species: normalizeSpecies(pet.species),
    gender: pet.gender === "male" || pet.gender === "female" ? pet.gender : "unknown",
    birthDate: pet.birth_date,
    birthTime: pet.birth_time?.slice(0, 5) ?? "12:00",
    birthTimeUnknown: pet.birth_time_unknown,
    timezone: pet.birth_timezone || "Asia/Seoul",
    profileImageUrl: pet.profile_image_url,
  };
}

export function PetProfilesList({
  editable = false,
  compact = false,
  cardStyle = "default",
}: {
  editable?: boolean;
  compact?: boolean;
  cardStyle?: "default" | "glass";
}) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const tSpecies = useTranslations("petSpecies");
  const tSaju = useTranslations("saju");
  const speciesLabels = {
    dog: tSpecies("dog"),
    cat: tSpecies("cat"),
    reptile: tSpecies("reptile"),
    otherFriends: tSpecies("otherFriends"),
  };
  const { ready, accessToken, configured, isAnonymous, isFullMember } = useSupabaseSession();
  const [pets, setPets] = useState<PetRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, PetEditDraft>>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingPetId, setSavingPetId] = useState<string | null>(null);
  const [uploadingPetId, setUploadingPetId] = useState<string | null>(null);
  const [uploadingFortunePhotoId, setUploadingFortunePhotoId] = useState<string | null>(null);
  const [fortunePhotoFiles, setFortunePhotoFiles] = useState<Record<string, File | null>>({});
  const [fortunePhotoConsents, setFortunePhotoConsents] = useState<Record<string, boolean>>({});
  const [fortunePhotoErrors, setFortunePhotoErrors] = useState<Record<string, string | null>>({});
  const [deletingPetId, setDeletingPetId] = useState<string | null>(null);

  useEffect(() => {
    if (!configured || !ready || !accessToken) return;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/profile/pets", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? (isKo ? "펫 프로필을 불러오지 못했어요." : "Could not load pet profiles."));
          return;
        }
        const nextPets = (data.pets ?? []) as PetRow[];
        setPets(nextPets);
        setDrafts(Object.fromEntries(nextPets.map((pet) => [pet.id, draftFromPet(pet)])));
        setFortunePhotoConsents(
          Object.fromEntries(
            nextPets.map((pet) => [pet.id, Boolean(pet.photo_consent_secondary_use)])
          )
        );
      } catch {
        setError(isKo ? "네트워크 오류" : "Network error");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [configured, ready, accessToken, isAnonymous, isKo]);

  function updateDraft(petId: string, patch: Partial<PetEditDraft>) {
    setDrafts((prev) => ({
      ...prev,
      [petId]: {
        ...prev[petId],
        ...patch,
      },
    }));
  }

  async function savePet(pet: PetRow) {
    if (!accessToken) return;
    if (!isFullMember) {
      setError(tSaju("guestPetEditForbidden"));
      return;
    }

    const draft = drafts[pet.id];
    if (!draft) return;

    setSavingPetId(pet.id);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/profile/pets", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: pet.id,
          name: draft.name,
          species: draft.species,
          gender: draft.gender,
          birthDate: draft.birthDate,
          birthTime: draft.birthTimeUnknown ? null : draft.birthTime,
          birthTimeUnknown: draft.birthTimeUnknown,
          timezone: draft.timezone,
          profileImageUrl: draft.profileImageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? (isKo ? "펫 프로필 저장에 실패했어요." : "Could not save pet profile."));
        return;
      }

      const updatedPet = data.pet as PetRow;
      setPets((prev) =>
        prev.map((item) =>
          item.id === pet.id
            ? {
                ...item,
                ...updatedPet,
              }
            : item
        )
      );
      setDrafts((prev) => ({ ...prev, [pet.id]: draftFromPet(updatedPet) }));
      setMessage(isKo ? "펫 프로필이 저장됐어요." : "Pet profile saved.");
    } catch {
      setError(isKo ? "네트워크 오류" : "Network error");
    } finally {
      setSavingPetId(null);
    }
  }

  async function uploadPetImage(petId: string, file: File | null) {
    if (!file || !accessToken) return;

    setUploadingPetId(petId);
    setError(null);
    setMessage(null);

    try {
      const compressed = await compressImageForUpload(file);
      const formData = new FormData();
      formData.append("file", compressed);
      formData.append("kind", "pet");

      const res = await fetch("/api/profile/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? (isKo ? "펫 사진 업로드에 실패했어요." : "Could not upload pet photo."));
        return;
      }
      const nextImageUrl = data.imageUrl as string;
      const pet = pets.find((item) => item.id === petId);
      const draft = drafts[petId] ?? (pet ? draftFromPet(pet) : null);
      if (!pet || !draft) return;

      const saveRes = await fetch("/api/profile/pets", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: petId,
          name: draft.name,
          species: draft.species,
          gender: draft.gender,
          birthDate: draft.birthDate,
          birthTime: draft.birthTimeUnknown ? null : draft.birthTime,
          birthTimeUnknown: draft.birthTimeUnknown,
          timezone: draft.timezone,
          profileImageUrl: nextImageUrl,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) {
        setError(saveData.error ?? (isKo ? "펫 사진 저장에 실패했어요." : "Could not save pet photo."));
        return;
      }

      const updatedPet = saveData.pet as PetRow;
      setPets((prev) => prev.map((item) => (item.id === petId ? { ...item, ...updatedPet } : item)));
      setDrafts((prev) => ({ ...prev, [petId]: draftFromPet(updatedPet) }));
      setMessage(isKo ? "펫 사진이 변경됐어요." : "Pet photo updated.");
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("1MB")
          ? isKo
            ? "이미지를 1MB 이하 WebP로 압축할 수 없어요."
            : "Could not compress the image under 1MB WebP."
          : isKo
            ? "네트워크 오류"
            : "Network error"
      );
    } finally {
      setUploadingPetId(null);
    }
  }

  async function uploadFortunePhoto(
    petId: string,
    file: File,
    photoConsentSecondaryUse: boolean
  ) {
    if (!accessToken) return;

    setUploadingFortunePhotoId(petId);
    setError(null);
    setMessage(null);

    try {
      const { photoUrl } = await uploadPetFortunePhotoClient(
        accessToken,
        petId,
        file,
        photoConsentSecondaryUse
      );
      setPets((prev) =>
        prev.map((item) =>
          item.id === petId
            ? { ...item, photo_url: photoUrl, photo_consent_secondary_use: photoConsentSecondaryUse }
            : item
        )
      );
      setFortunePhotoFiles((prev) => ({ ...prev, [petId]: null }));
      setMessage(
        isKo ? "운세 카드용 사진이 등록됐어요." : "Daily fortune card photo saved."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isKo
            ? "사진 업로드에 실패했어요."
            : "Could not upload photo."
      );
    } finally {
      setUploadingFortunePhotoId(null);
    }
  }

  async function handleFortunePhotoChange(
    petId: string,
    file: File | null,
    fileError: string | null,
    consent: boolean
  ) {
    setFortunePhotoFiles((prev) => ({ ...prev, [petId]: file }));
    setFortunePhotoErrors((prev) => ({ ...prev, [petId]: fileError }));
    setFortunePhotoConsents((prev) => ({ ...prev, [petId]: consent }));
    if (!file || fileError) return;
    await uploadFortunePhoto(petId, file, consent);
  }

  async function deletePet(pet: PetRow) {
    if (!accessToken || deletingPetId) return;

    const ok = window.confirm(
      isKo
        ? `${pet.name} 프로필을 삭제할까요?\n저장된 사주 결과도 함께 삭제되며 복구할 수 없습니다.`
        : `Delete ${pet.name}'s profile?\nSaved saju results will also be deleted and cannot be restored.`
    );
    if (!ok) return;

    setDeletingPetId(pet.id);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/profile/pets", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: pet.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? (isKo ? "펫 프로필 삭제에 실패했어요." : "Could not delete pet profile."));
      }

      setPets((prev) => prev.filter((item) => item.id !== pet.id));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[pet.id];
        return next;
      });
      setMessage(isKo ? "펫 프로필을 삭제했어요." : "Pet profile deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : isKo ? "펫 프로필 삭제에 실패했어요." : "Could not delete pet profile.");
    } finally {
      setDeletingPetId(null);
    }
  }

  if (!configured) {
    return (
      <p className="text-sm text-white/75">
        {isKo
          ? "Supabase 연동 후 저장된 펫 프로필이 여기에 표시됩니다."
          : "Saved pet profiles will appear here after Supabase is connected."}
      </p>
    );
  }

  if (isAnonymous) {
    return (
      <p className="text-sm text-white/75">
        {isKo
          ? "로그인 후 사주를 보면 펫 프로필이 여기에 저장돼요."
          : "After logging in, pet profiles are saved here when you read saju."}{" "}
        <Link href="/login" className="font-medium text-[#ffd7ff] underline hover:text-white">
          {isKo ? "로그인하기" : "Log in"}
        </Link>
      </p>
    );
  }

  if (!ready || loading) {
    return <p className="text-sm text-white/70">{isKo ? "펫 프로필 불러오는 중…" : "Loading pet profiles…"}</p>;
  }

  if (error && pets.length === 0) {
    return <p className="rounded-2xl bg-red-50/95 px-4 py-3 text-sm text-red-800">{error}</p>;
  }

  if (pets.length === 0) {
    return <EmptyStatePanel {...getEmptyStatePreset("pets", isKo)} />;
  }

  const totalReadings = pets.reduce((sum, pet) => sum + pet.readings.length, 0);

  const canEdit = editable && isFullMember;
  const isCompactView = compact && !canEdit;
  const useGlassCards = cardStyle === "glass" && isCompactView;

  return (
    <div className={isCompactView ? "space-y-2" : "space-y-4"}>
      {(message || error) && (
        <div className={`rounded-2xl bg-white/90 text-sm shadow-sm ${isCompactView ? "px-3 py-2 text-xs" : "px-4 py-3"}`}>
          {message && <p className="font-medium text-channel-community">{message}</p>}
          {error && <p className="text-red-700/80">{error}</p>}
        </div>
      )}

      {!useGlassCards && (
      <div
        className={
          isCompactView
            ? "flex flex-wrap items-center gap-2 text-[11px]"
            : "grid gap-3 sm:grid-cols-3"
        }
      >
        <div className={isCompactView ? "rounded-xl border border-white/20 bg-white/90 px-2.5 py-1.5 shadow-sm" : "glass-card rounded-2xl px-4 py-3"}>
          <p className="text-xs font-semibold text-plum/60">{isKo ? "저장된 펫" : "Saved pets"}</p>
          <p className={isCompactView ? "font-bold text-primary" : "mt-1 text-2xl font-bold text-primary"}>
            {pets.length}
          </p>
          {!isCompactView && (
            <p className="mt-1 text-[11px] text-plum/50">
              {isKo ? "등록된 반려동물" : "Registered pets"}
            </p>
          )}
        </div>
        <div className={isCompactView ? "rounded-xl border border-white/20 bg-white/90 px-2.5 py-1.5 shadow-sm" : "glass-card rounded-2xl px-4 py-3"}>
          <p className="text-xs font-semibold text-plum/60">{isKo ? "사주 결과" : "Saju results"}</p>
          <p className={isCompactView ? "font-bold text-primary" : "mt-1 text-2xl font-bold text-primary"}>{totalReadings}</p>
        </div>
        <Link
          href="/saju"
          className={
            isCompactView
              ? "rounded-xl border border-white/20 bg-white/90 px-2.5 py-1.5 font-bold text-primary shadow-sm transition hover:bg-white"
              : "glass-card rounded-2xl px-4 py-3 text-sm font-bold text-primary transition hover:bg-white/80"
          }
        >
          {isKo ? "새 펫 사주" : "New pet saju"}
          {!isCompactView && (
            <span className="mt-1 block text-xs font-medium text-plum/60">
              {isKo ? "사주 입력 후 자동 저장" : "Saved after saju reading"}
            </span>
          )}
        </Link>
      </div>
      )}

      <ul
        className={
          useGlassCards
            ? "grid gap-3"
            : isCompactView
              ? "grid grid-cols-2 gap-2 sm:grid-cols-3"
              : "grid gap-3 lg:grid-cols-2"
        }
      >
        {pets.map((pet) => {
          const q = petQuery(pet, locale);
          const typeLabels = TYPE_LABELS[isKo ? "ko" : "en"];
          const gender =
            pet.gender === "male"
              ? isKo
                ? "수"
                : "Male"
              : pet.gender === "female"
                ? isKo
                  ? "암"
                  : "Female"
                : isKo
                  ? "미상"
                  : "Unknown";
          return (
            <li
              key={pet.id}
              className={
                useGlassCards
                  ? PET_PROFILE_CARD
                  : isCompactView
                    ? "rounded-xl border border-white/20 bg-white/90 px-2 py-2 shadow-sm"
                    : "glass-card rounded-[2rem] p-5 text-primary"
              }
            >
              <div className={`flex items-center ${useGlassCards ? "w-full gap-4" : `items-start ${isCompactView ? "gap-2" : "gap-2.5"}`}`}>
                <div
                  className={`relative flex shrink-0 items-center justify-center overflow-hidden ${
                    useGlassCards
                      ? "h-16 w-16 rounded-[2rem] bg-white ring-2 ring-white text-2xl shadow-sm"
                      : isCompactView
                        ? "h-8 w-8 rounded-lg bg-lavender/30 text-sm"
                        : "h-14 w-14 rounded-2xl bg-lavender/30 text-2xl"
                  }`}
                >
                  {(() => {
                    const avatar = petAvatarImageProps(
                      {
                        photo_url: pet.photo_url,
                        profileImageUrl: canEdit ? drafts[pet.id]?.profileImageUrl : pet.profile_image_url,
                      },
                      isCompactView ? 64 : 112
                    );
                    return avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatar.src} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span aria-hidden>{speciesEmoji(pet.species)}</span>
                    );
                  })()}
                  {canEdit && (
                    <>
                      <input
                        id={`pet-profile-photo-${pet.id}`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => void uploadPetImage(pet.id, e.target.files?.[0] ?? null)}
                        className="sr-only"
                        disabled={uploadingPetId === pet.id}
                      />
                      <label
                        htmlFor={`pet-profile-photo-${pet.id}`}
                        title={isKo ? "펫 사진 변경" : "Change pet photo"}
                        className={`absolute bottom-0 right-0 flex cursor-pointer items-center justify-center rounded-full border border-white bg-channel-saju text-white shadow-sm transition hover:brightness-105 ${
                          isCompactView ? "h-4 w-4 text-[8px]" : "bottom-1 right-1 h-6 w-6 text-[10px]"
                        }`}
                        aria-label={isKo ? "펫 사진 변경" : "Change pet photo"}
                      >
                        {uploadingPetId === pet.id ? "…" : "📷"}
                      </label>
                    </>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`flex flex-wrap items-center gap-2 ${useGlassCards ? "mb-0.5" : ""}`}>
                    <p
                    className={`truncate font-bold ${useGlassCards ? "text-base text-ink" : isCompactView ? "text-xs text-plum" : "text-sm text-plum"}`}
                    >
                      {pet.name}
                    </p>
                    {useGlassCards && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${speciesBadgeClass(pet.species)}`}>
                        {speciesLabel(pet.species, speciesLabels)}
                      </span>
                    )}
                  </div>
                  <p
                    className={`${useGlassCards ? "text-sm text-plum/85" : "text-plum/75"} ${useGlassCards ? "" : isCompactView ? "text-[10px] leading-snug" : "text-[11px]"}`}
                  >
                    {speciesLabel(pet.species, speciesLabels)} · {gender}
                    {isCompactView ? (
                      <>
                        {" · "}
                        {pet.birth_date}
                        {pet.birth_time_unknown
                          ? isKo
                            ? " · 시간 미상"
                            : " · ?"
                          : pet.birth_time
                            ? ` · ${pet.birth_time.slice(0, 5)}`
                            : ""}
                      </>
                    ) : (
                      <>
                        <span className="mt-0.5 block">
                          {isKo ? "생일" : "Birthday"} {pet.birth_date}
                          {pet.birth_time_unknown
                            ? isKo
                              ? " · 시간 미상"
                              : " · Time unknown"
                            : pet.birth_time
                              ? ` · ${pet.birth_time.slice(0, 5)}`
                              : ""}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-plum/45">{pet.birth_timezone}</span>
                      </>
                    )}
                  </p>
                </div>
                {useGlassCards && !canEdit && (
                  <span className="shrink-0 text-xl text-channel-saju/45" aria-hidden>
                    ›
                  </span>
                )}
              </div>

              {useGlassCards && !canEdit && (
                <Link
                  href={`/profile/pets/${pet.id}`}
                  className="mt-4 block rounded-2xl bg-petal px-4 py-2.5 text-center text-xs font-extrabold text-plum shadow-sm ring-1 ring-white/80 transition hover:bg-white hover:shadow-md"
                >
                  {isKo ? "상세 프로필 보기" : "View pet profile"}
                </Link>
              )}

              {canEdit && drafts[pet.id] && (
                <div className="mt-4 grid gap-3 rounded-2xl border border-petal/50 bg-white p-4 sm:grid-cols-2">
                  <label className="block text-xs font-medium text-plum/80 sm:col-span-2">
                    {isKo ? "펫 이름" : "Pet name"}
                    <input
                      value={drafts[pet.id].name}
                      onChange={(e) => updateDraft(pet.id, { name: e.target.value })}
                      className="pastel-input"
                      maxLength={40}
                      required
                    />
                  </label>

                  <label className="block text-xs font-medium text-plum/80">
                    {isKo ? "종류" : "Species"}
                    <select
                      value={drafts[pet.id].species}
                      onChange={(e) =>
                        updateDraft(pet.id, {
                          species: normalizeSpecies(e.target.value),
                        })
                      }
                      className="pastel-input"
                    >
                      <option value="dog">{speciesLabels.dog}</option>
                      <option value="cat">{speciesLabels.cat}</option>
                      <option value="reptile">{speciesLabels.reptile}</option>
                      <option value="other">{speciesLabels.otherFriends}</option>
                    </select>
                  </label>

                  <label className="block text-xs font-medium text-plum/80">
                    {isKo ? "성별" : "Gender"}
                    <select
                      value={drafts[pet.id].gender}
                      onChange={(e) =>
                        updateDraft(pet.id, {
                          gender:
                            e.target.value === "male" || e.target.value === "female"
                              ? e.target.value
                              : "unknown",
                        })
                      }
                      className="pastel-input"
                    >
                      <option value="female">{isKo ? "암" : "Female"}</option>
                      <option value="male">{isKo ? "수" : "Male"}</option>
                      <option value="unknown">{isKo ? "미상" : "Unknown"}</option>
                    </select>
                  </label>

                  <label className="block text-xs font-medium text-plum/80">
                    {isKo ? "생일" : "Birthday"}
                    <input
                      type="date"
                      value={drafts[pet.id].birthDate}
                      onChange={(e) => updateDraft(pet.id, { birthDate: e.target.value })}
                      className="pastel-input"
                      required
                    />
                  </label>

                  <label className="block text-xs font-medium text-plum/80">
                    {isKo ? "태어난 시간" : "Birth time"}
                    <input
                      type="time"
                      value={drafts[pet.id].birthTime}
                      onChange={(e) => updateDraft(pet.id, { birthTime: e.target.value })}
                      className="pastel-input"
                      disabled={drafts[pet.id].birthTimeUnknown}
                      required={!drafts[pet.id].birthTimeUnknown}
                    />
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-plum/70">
                    <input
                      type="checkbox"
                      checked={drafts[pet.id].birthTimeUnknown}
                      onChange={(e) => updateDraft(pet.id, { birthTimeUnknown: e.target.checked })}
                      className="h-4 w-4 rounded border-plum/20"
                    />
                    {isKo ? "태어난 시간 모름" : "Birth time unknown"}
                  </label>

                  <label className="block text-xs font-medium text-plum/80">
                    {isKo ? "시간대" : "Timezone"}
                    <select
                      value={drafts[pet.id].timezone}
                      onChange={(e) => updateDraft(pet.id, { timezone: e.target.value })}
                      className="pastel-input"
                    >
                      {COMMON_TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="sm:col-span-2">
                    <PetPhotoUploadField
                      locale={isKo ? "ko" : "en"}
                      petName={drafts[pet.id].name}
                      disabled={savingPetId === pet.id || uploadingFortunePhotoId === pet.id}
                      file={fortunePhotoFiles[pet.id] ?? null}
                      consent={fortunePhotoConsents[pet.id] ?? false}
                      fileError={fortunePhotoErrors[pet.id] ?? null}
                      currentPhotoUrl={pet.photo_url}
                      onFileChange={(file, fileError) => {
                        const consent = fortunePhotoConsents[pet.id] ?? false;
                        void handleFortunePhotoChange(pet.id, file, fileError, consent);
                      }}
                      onConsentChange={(consent) => {
                        setFortunePhotoConsents((prev) => ({ ...prev, [pet.id]: consent }));
                        const pending = fortunePhotoFiles[pet.id];
                        if (pending && !fortunePhotoErrors[pet.id]) {
                          void uploadFortunePhoto(pet.id, pending, consent);
                        }
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => void savePet(pet)}
                    disabled={savingPetId === pet.id || deletingPetId === pet.id}
                    className="rounded-full bg-channel-saju px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-60"
                  >
                    {savingPetId === pet.id
                      ? isKo
                        ? "저장 중..."
                        : "Saving..."
                      : isKo
                        ? "펫 프로필 저장"
                        : "Save pet profile"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void deletePet(pet)}
                    disabled={deletingPetId === pet.id || savingPetId === pet.id}
                    className="rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                  >
                    {deletingPetId === pet.id
                      ? isKo
                        ? "삭제 중..."
                        : "Deleting..."
                      : isKo
                        ? "펫 삭제"
                        : "Delete pet"}
                  </button>
                </div>
              )}

              {!isCompactView && pet.readings.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {pet.readings.map((reading) => (
                    <span
                      key={reading.id}
                      className="rounded-full bg-channel-saju/12 px-2.5 py-1 text-[11px] font-medium text-channel-saju"
                      title={reading.title ?? undefined}
                    >
                      {typeLabels[reading.saju_type] ?? reading.typeLabel}
                    </span>
                  ))}
                </div>
              )}
              {isCompactView && pet.readings.length > 0 && (
                <p className="mt-1 text-[10px] font-bold text-channel-saju">
                  {isKo ? `사주 ${pet.readings.length}개` : `${pet.readings.length} saju`}
                </p>
              )}
              {pet.latestSaju && (
                <p
                  className={
                    isCompactView
                      ? "mt-1 line-clamp-1 text-[10px] text-ink/75"
                      : "mt-3 line-clamp-2 text-xs leading-relaxed text-plum/80"
                  }
                >
                  {isKo ? "최근" : "Latest"}: {pet.latestSaju.title ?? (isKo ? "K-Saju 결과" : "K-Saju result")}
                </p>
              )}
              <div className={isCompactView ? "mt-1.5 flex flex-wrap gap-1" : "mt-4 flex flex-wrap gap-2"}>
                <Link
                  href={`/saju/zodiac?${q}`}
                  className={
                    isCompactView
                      ? "rounded-full bg-sky/50 px-2 py-0.5 text-[10px] font-semibold text-channel-saju ring-1 ring-channel-saju/15"
                      : "rounded-full bg-sky/50 px-3 py-1.5 text-xs font-semibold text-channel-saju ring-1 ring-channel-saju/15 transition hover:bg-sky/70"
                  }
                >
                  {isKo ? "별자리" : "Zodiac"}
                </Link>
                <Link
                  href={`/saju/compatibility?${q}`}
                  className={
                    isCompactView
                      ? "rounded-full bg-petal px-2 py-0.5 text-[10px] font-semibold text-plum ring-1 ring-petal/80"
                      : "rounded-full bg-petal px-3 py-1.5 text-xs font-semibold text-plum ring-1 ring-petal/80 transition hover:bg-white"
                  }
                >
                  {isKo ? "궁합" : "Match"}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
