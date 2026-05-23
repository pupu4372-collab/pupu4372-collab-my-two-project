"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useLocale } from "next-intl";
import { useEffect, useRef, useState } from "react";

interface PetShowComposerProps {
  onPosted?: () => void;
}

interface PetOption {
  id: string;
  name: string;
  species: "dog" | "cat";
}

export function PetShowComposer({ onPosted }: PetShowComposerProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { ready, accessToken, configured } = useSupabaseSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pets, setPets] = useState<PetOption[]>([]);
  const [petId, setPetId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!configured || !ready || !accessToken) return;

    async function loadPets() {
      try {
        const res = await fetch("/api/profile/pets", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (!res.ok) return;

        const nextPets = (data.pets ?? []) as PetOption[];
        setPets(nextPets.map((pet) => ({ id: pet.id, name: pet.name, species: pet.species })));
        setPetId((current) => current || nextPets[0]?.id || "");
      } catch {
        // Posting still shows a clear validation message if no pet can be selected.
      }
    }

    void loadPets();
  }, [configured, ready, accessToken]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!configured) {
      setError(isKo ? "Supabase 설정 후 업로드할 수 있어요 (.env.local)" : "Uploads are available after Supabase is configured (.env.local).");
      return;
    }
    if (!ready || !accessToken) {
      setError(isKo ? "세션 준비 중이에요. 잠시 후 다시 시도해 주세요." : "Session is preparing. Please try again soon.");
      return;
    }
    if (!file) {
      setError(isKo ? "사진을 선택해 주세요." : "Please choose a photo.");
      return;
    }
    if (!petId) {
      setError(isKo ? "랭킹 배정을 위해 등록된 펫을 선택해 주세요." : "Please choose a saved pet for ranking.");
      return;
    }
    if (!title.trim()) {
      setError(isKo ? "제목을 입력해 주세요." : "Please enter a title.");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const uploadRes = await fetch("/api/community/pet-show/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setError(uploadData.error ?? (isKo ? "업로드 실패" : "Upload failed"));
        return;
      }

      const postRes = await fetch("/api/community/pet-show/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || undefined,
          imageUrl: uploadData.imageUrl,
          petId,
        }),
      });
      const postData = await postRes.json();
      if (!postRes.ok) {
        setError(postData.error ?? (isKo ? "게시 실패" : "Post failed"));
        return;
      }

      setTitle("");
      setContent("");
      setFile(null);
      setPetId(pets[0]?.id ?? "");
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      setSuccess(true);
      onPosted?.();
    } catch {
      setError(isKo ? "네트워크 오류가 발생했어요." : "Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-channel-community/25 bg-white/60 p-6">
      <h2 className="text-lg font-bold text-channel-community">📷 {isKo ? "우리아이 자랑 올리기" : "Post to Pet Show"}</h2>
      <p className="mt-1 text-xs text-plum/55">
        {isKo
          ? "펫사진은 개인정보 동의 범위 내에서 프로필·피드에 사용됩니다."
          : "Pet photos are used for profiles and feeds within your privacy consent."}
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex aspect-square w-full max-w-[140px] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-channel-community/40 bg-channel-community/10 text-3xl transition hover:bg-channel-community/20 sm:shrink-0"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>📷</span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={onFileChange}
          />
          <div className="flex-1 space-y-3">
            <select
              value={petId}
              onChange={(e) => setPetId(e.target.value)}
              className="pastel-input"
              required
            >
              <option value="">
                {isKo ? "랭킹에 올릴 펫 선택" : "Choose a pet for ranking"}
              </option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.species === "dog" ? "🐕" : "🐈"} {pet.name}
                </option>
              ))}
            </select>
            {pets.length === 0 && (
              <p className="text-xs text-plum/50">
                {isKo
                  ? "펫 프로필이 있어야 강아지/고양이 주간 랭킹에 배정됩니다."
                  : "A saved pet profile is required for dog/cat weekly rankings."}
              </p>
            )}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isKo ? "제목 (예: 햇살 냥이의 오후)" : "Title (e.g. Sunny cat afternoon)"}
              className="pastel-input"
              maxLength={80}
              required
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isKo ? "한 줄 소개 (선택)" : "Short caption (optional)"}
              className="pastel-input min-h-[72px] resize-y"
              maxLength={300}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-700/80" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm font-medium text-channel-community" role="status">
            {isKo ? "🎉 올렸어요! 피드에 반영됩니다." : "🎉 Posted! It will appear in the feed."}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-channel-community py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-60"
        >
          {loading ? (isKo ? "업로드 중…" : "Uploading…") : isKo ? "자랑하기" : "Post"}
        </button>
      </form>
    </section>
  );
}
