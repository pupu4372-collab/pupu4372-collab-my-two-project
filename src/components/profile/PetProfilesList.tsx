"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import { useLocale } from "next-intl";
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
  personality_tags: string[];
  created_at: string;
  latestSaju: SajuReading | null;
  readings: SajuReading[];
}

type PetEditDraft = {
  name: string;
  species: "dog" | "cat";
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

function petQuery(pet: PetRow, locale: string) {
  return new URLSearchParams({
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
    species: pet.species === "cat" ? "cat" : "dog",
    gender: pet.gender === "male" || pet.gender === "female" ? pet.gender : "unknown",
    birthDate: pet.birth_date,
    birthTime: pet.birth_time?.slice(0, 5) ?? "12:00",
    birthTimeUnknown: pet.birth_time_unknown,
    timezone: pet.birth_timezone || "Asia/Seoul",
    profileImageUrl: pet.profile_image_url,
  };
}

export function PetProfilesList({ editable = false }: { editable?: boolean }) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { ready, accessToken, configured, isAnonymous } = useSupabaseSession();
  const [pets, setPets] = useState<PetRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, PetEditDraft>>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingPetId, setSavingPetId] = useState<string | null>(null);
  const [uploadingPetId, setUploadingPetId] = useState<string | null>(null);

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

    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", "pet");

    try {
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
      updateDraft(petId, { profileImageUrl: data.imageUrl });
      setMessage(isKo ? "펫 사진이 업로드됐어요. 저장 버튼을 눌러 반영해 주세요." : "Pet photo uploaded. Press save to apply it.");
    } catch {
      setError(isKo ? "네트워크 오류" : "Network error");
    } finally {
      setUploadingPetId(null);
    }
  }

  if (!configured) {
    return (
      <p className="text-sm text-plum/70">
        {isKo
          ? "Supabase 연동 후 저장된 펫 프로필이 여기에 표시됩니다."
          : "Saved pet profiles will appear here after Supabase is connected."}
      </p>
    );
  }

  if (isAnonymous) {
    return (
      <p className="text-sm text-plum/70">
        {isKo
          ? "로그인 후 홈에서 사주를 보면 펫 프로필이 여기에 저장돼요."
          : "After logging in, pet profiles are saved here when you read saju from Home."}{" "}
        <Link href="/login" className="font-medium text-plum underline">
          {isKo ? "로그인하기" : "Log in"}
        </Link>
      </p>
    );
  }

  if (!ready || loading) {
    return <p className="text-sm text-plum/60">{isKo ? "펫 프로필 불러오는 중…" : "Loading pet profiles…"}</p>;
  }

  if (error && pets.length === 0) {
    return <p className="text-sm text-red-700/80">{error}</p>;
  }

  if (pets.length === 0) {
    return (
      <p className="text-sm text-plum/70">
        {isKo ? "아직 저장된 펫 프로필이 없어요." : "No saved pet profiles yet."}{" "}
        <Link href="/" className="font-medium text-plum underline">
          {isKo ? "홈에서 사주 보기" : "Read saju from Home"}
        </Link>
        {isKo ? "를 하면 자동으로 저장됩니다." : " to save one automatically."}
      </p>
    );
  }

  const totalReadings = pets.reduce((sum, pet) => sum + pet.readings.length, 0);

  return (
    <div className="space-y-4">
      {(message || error) && (
        <div className="rounded-2xl bg-white/55 px-4 py-3 text-sm">
          {message && <p className="font-medium text-channel-community">{message}</p>}
          {error && <p className="text-red-700/80">{error}</p>}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-channel-saju/10 px-4 py-3">
          <p className="text-xs text-plum/55">{isKo ? "저장된 펫" : "Saved pets"}</p>
          <p className="mt-1 text-2xl font-bold text-channel-saju">{pets.length}</p>
        </div>
        <div className="rounded-2xl bg-petal/35 px-4 py-3">
          <p className="text-xs text-plum/55">{isKo ? "사주 결과" : "Saju results"}</p>
          <p className="mt-1 text-2xl font-bold text-plum">{totalReadings}</p>
        </div>
        <Link
          href="/"
          className="rounded-2xl bg-mint/45 px-4 py-3 text-sm font-bold text-ink transition hover:brightness-105"
        >
          {isKo ? "새 펫 사주 보기" : "Read a new pet"}
          <span className="mt-1 block text-xs font-medium text-ink/60">
            {isKo ? "홈에서 자동 저장" : "Saved from Home"}
          </span>
        </Link>
      </div>

      <ul className="grid gap-3 lg:grid-cols-2">
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
              className="rounded-3xl border border-plum/15 bg-white/55 px-5 py-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-lavender/30 text-2xl">
                  {(editable ? drafts[pet.id]?.profileImageUrl : pet.profile_image_url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={(editable ? drafts[pet.id]?.profileImageUrl : pet.profile_image_url) as string}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span aria-hidden>{pet.species === "dog" ? "🐕" : "🐈"}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-plum">{pet.name}</p>
                  <p className="mt-0.5 text-xs text-plum/55">
                    {pet.species === "dog" ? (isKo ? "강아지" : "Dog") : isKo ? "고양이" : "Cat"} · {gender}
                  </p>
                  <p className="mt-1 text-xs text-plum/55">
                    {isKo ? "생일" : "Birthday"} {pet.birth_date}
                    {pet.birth_time_unknown
                      ? isKo
                        ? " · 시간 미상"
                        : " · Time unknown"
                      : pet.birth_time
                        ? ` · ${pet.birth_time.slice(0, 5)}`
                        : ""}
                  </p>
                  <p className="mt-1 text-xs text-plum/45">{pet.birth_timezone}</p>
                </div>
              </div>

              {editable && drafts[pet.id] && (
                <div className="mt-4 grid gap-3 rounded-2xl bg-white/45 p-4 sm:grid-cols-2">
                  <div className="block text-xs font-medium text-plum/70 sm:col-span-2">
                    <p>{isKo ? "펫 사진" : "Pet photo"}</p>
                    <input
                      id={`pet-profile-photo-${pet.id}`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => void uploadPetImage(pet.id, e.target.files?.[0] ?? null)}
                      className="sr-only"
                      disabled={uploadingPetId === pet.id}
                    />
                    <label
                      htmlFor={`pet-profile-photo-${pet.id}`}
                      className="mt-2 inline-flex cursor-pointer rounded-full bg-mint/50 px-4 py-2 text-xs font-semibold text-plum transition hover:bg-mint/70"
                    >
                      {isKo ? "사진 선택" : "Choose photo"}
                    </label>
                    <span className="mt-1 block text-[11px] text-plum/45">
                      {uploadingPetId === pet.id
                        ? isKo
                          ? "업로드 중..."
                          : "Uploading..."
                        : isKo
                          ? "사진 선택 후 펫 프로필 저장을 눌러주세요."
                          : "Choose a photo, then press Save pet profile."}
                    </span>
                  </div>

                  <label className="block text-xs font-medium text-plum/70 sm:col-span-2">
                    {isKo ? "펫 이름" : "Pet name"}
                    <input
                      value={drafts[pet.id].name}
                      onChange={(e) => updateDraft(pet.id, { name: e.target.value })}
                      className="pastel-input"
                      maxLength={40}
                      required
                    />
                  </label>

                  <label className="block text-xs font-medium text-plum/70">
                    {isKo ? "종류" : "Species"}
                    <select
                      value={drafts[pet.id].species}
                      onChange={(e) => updateDraft(pet.id, { species: e.target.value === "cat" ? "cat" : "dog" })}
                      className="pastel-input"
                    >
                      <option value="dog">{isKo ? "강아지" : "Dog"}</option>
                      <option value="cat">{isKo ? "고양이" : "Cat"}</option>
                    </select>
                  </label>

                  <label className="block text-xs font-medium text-plum/70">
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

                  <label className="block text-xs font-medium text-plum/70">
                    {isKo ? "생일" : "Birthday"}
                    <input
                      type="date"
                      value={drafts[pet.id].birthDate}
                      onChange={(e) => updateDraft(pet.id, { birthDate: e.target.value })}
                      className="pastel-input"
                      required
                    />
                  </label>

                  <label className="block text-xs font-medium text-plum/70">
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

                  <label className="block text-xs font-medium text-plum/70">
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

                  <button
                    type="button"
                    onClick={() => void savePet(pet)}
                    disabled={savingPetId === pet.id}
                    className="rounded-full bg-channel-saju px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-60 sm:col-span-2"
                  >
                    {savingPetId === pet.id
                      ? isKo
                        ? "저장 중..."
                        : "Saving..."
                      : isKo
                        ? "펫 프로필 저장"
                        : "Save pet profile"}
                  </button>
                </div>
              )}

              {pet.readings.length > 0 && (
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
              {pet.latestSaju && (
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-plum/60">
                  {isKo ? "최근" : "Latest"}: {pet.latestSaju.title ?? (isKo ? "K-Saju 결과" : "K-Saju result")}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/saju/zodiac?${q}`}
                  className="rounded-full bg-channel-saju/15 px-3 py-1.5 text-xs font-medium text-channel-saju transition hover:bg-channel-saju/25"
                >
                  {isKo ? "별자리 운세" : "Zodiac fortune"}
                </Link>
                <Link
                  href={`/saju/compatibility?${q}`}
                  className="rounded-full bg-petal/50 px-3 py-1.5 text-xs font-medium text-plum transition hover:bg-petal/70"
                >
                  {isKo ? "궁합 보기" : "Compatibility"}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
