"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import { compressImageForUpload } from "@/lib/images/upload-compression";
import { useLocale } from "next-intl";
import { useRef, useState } from "react";

interface PetShowComposerProps {
  onPosted?: () => void;
}

type PetShowSpecies = "dog" | "cat" | "other";

export function PetShowComposer({ onPosted }: PetShowComposerProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { ready, accessToken, configured, isAnonymous } = useSupabaseSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [petSpecies, setPetSpecies] = useState<PetShowSpecies | "">("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    try {
      const compressed = await compressImageForUpload(picked);
      setFile(compressed);
      setPreview(URL.createObjectURL(compressed));
      setError(null);
    } catch {
      setFile(null);
      setPreview(null);
      setError(isKo ? "이미지를 1MB 이하 WebP로 압축할 수 없어요." : "Could not compress the image under 1MB WebP.");
      if (fileRef.current) fileRef.current.value = "";
    }
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
    if (!petSpecies) {
      setError(isKo ? "반려동물 분류를 선택해 주세요." : "Please choose a pet category.");
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
          petSpecies,
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
      setPetSpecies("");
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

  if (configured && ready && isAnonymous) {
    return (
      <section className="pastel-card border-dashed border-channel-community/30 p-8 text-center">
        <h2 className="text-2xl font-extrabold text-primary">
          📷 {isKo ? "우리아이 자랑 올리기" : "Post to Pet Show"}
        </h2>
        <p className="mt-2 text-sm text-plum/65">
          {isKo ? "사진을 업로드하려면 로그인이 필요해요." : "Please log in to upload photos."}
        </p>
        <Link
          href="/login"
          className="mt-4 inline-flex rounded-full bg-channel-community px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105"
        >
          {isKo ? "로그인하기" : "Log in"}
        </Link>
      </section>
    );
  }

  return (
    <section className="pastel-card p-6 shadow-sm md:p-10">
      <h2 className="text-2xl font-extrabold text-primary">📷 {isKo ? "우리 아이 자랑하기" : "Post to Pet Show"}</h2>
      <p className="mt-2 text-sm leading-6 text-plum/60">
        {isKo
          ? "펫사진은 개인정보 동의 범위 내에서 프로필·스냅존에 사용됩니다."
          : "Pet photos are used for profiles and Snapzone within your privacy consent."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section>
          <label className="text-sm font-extrabold text-primary">{isKo ? "사진 업로드" : "Photo upload"}</label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group mt-4 flex min-h-[280px] w-full items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed border-outline/25 bg-white/35 text-center transition hover:bg-white/55"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full max-h-[420px] w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center px-6">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-lavender text-4xl transition group-hover:scale-110">📷</span>
                <span className="mt-4 text-lg font-extrabold text-primary">{isKo ? "사진 선택하기" : "Choose a photo"}</span>
                <span className="mt-2 text-sm text-plum/50">{isKo ? "권장 사이즈: 4:3 또는 1:1, 최대 10MB" : "Recommended: 4:3 or 1:1, max 10MB"}</span>
              </span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => void onFileChange(e)}
          />
        </section>

        <section>
          <p className="text-sm font-extrabold text-primary">{isKo ? "카테고리" : "Category"}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {([
              ["dog", isKo ? "강아지" : "Dog", "🐕"],
              ["cat", isKo ? "고양이" : "Cat", "🐈"],
              ["other", isKo ? "렙타일(다른동물)" : "Other animal", "🐾"],
            ] as const).map(([value, label, emoji]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPetSpecies(value)}
                className={
                  petSpecies === value
                    ? "rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-white shadow-sm"
                    : "rounded-full border border-primary/15 bg-white/55 px-6 py-3 text-sm font-extrabold text-primary transition hover:bg-lavender/45"
                }
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <label className="text-sm font-extrabold text-primary">{isKo ? "제목" : "Title"}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isKo ? "아이의 매력을 한 줄로 소개해주세요!" : "Introduce your pet in one line!"}
              className="pastel-input p-4"
              maxLength={80}
              required
            />
          </div>
          <div>
            <label className="text-sm font-extrabold text-primary">{isKo ? "이야기" : "Story"}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isKo ? "아이의 소중한 순간에 대한 이야기를 들려주세요." : "Tell the story behind this special moment."}
              className="pastel-input min-h-32 resize-y p-4"
              maxLength={300}
            />
          </div>
        </section>

        {error && (
          <p className="text-sm text-red-700/80" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm font-medium text-channel-community" role="status">
            {isKo ? "🎉 올렸어요! 스냅존에 반영됩니다." : "🎉 Posted! It will appear in Snapzone."}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary py-4 text-base font-extrabold text-white shadow-md transition hover:scale-[1.01] hover:brightness-105 disabled:opacity-60"
        >
          {loading ? (isKo ? "업로드 중…" : "Uploading…") : isKo ? "자랑하기" : "Post"}
        </button>
      </form>
    </section>
  );
}
