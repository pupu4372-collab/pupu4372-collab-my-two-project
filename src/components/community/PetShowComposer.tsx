"use client";

import { COMMUNITY_SOLID_SURFACE_CLASS } from "@/components/community/CommunityDetailSurface";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import { compressImageForUpload } from "@/lib/images/upload-compression";
import { isNativeImagePickerAvailable, pickNativeImage } from "@/lib/mobile/native-image-picker";
import type { PetShowSpecies } from "@/lib/supabase/types";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

interface PetShowComposerProps {
  onPosted?: () => void;
}

export function PetShowComposer({ onPosted }: PetShowComposerProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const tSpecies = useTranslations("petSpecies");
  const { ready, accessToken, configured, isAnonymous } = useSupabaseSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [petSpecies, setPetSpecies] = useState<PetShowSpecies | "">("");
  const [isFails, setIsFails] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [nativePickerAvailable, setNativePickerAvailable] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setNativePickerAvailable(isNativeImagePickerAvailable());
  }, []);

  function clearPreview() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function setPickedImage(picked: File | null) {
    if (!picked) return;
    try {
      const compressed = await compressImageForUpload(picked);
      setFile(compressed);
      setPreview(URL.createObjectURL(compressed));
      setError(null);
      setShowImageOptions(false);
    } catch {
      setFile(null);
      setPreview(null);
      setError(isKo ? "이미지를 1MB 이하 WebP로 압축할 수 없어요." : "Could not compress the image under 1MB WebP.");
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    await setPickedImage(e.target.files?.[0] ?? null);
  }

  async function chooseNativeImage(source: "camera" | "photos") {
    try {
      const picked = await pickNativeImage(source);
      await setPickedImage(picked);
    } catch (err) {
      if (source === "photos") fileRef.current?.click();
      if (err instanceof Error && err.message === "No image was selected.") return;
      setError(
        source === "camera"
          ? isKo
            ? "카메라를 열 수 없어요. 앨범 선택을 이용해 주세요."
            : "Could not open the camera. Please choose from your album."
          : isKo
            ? "앨범을 열 수 없어 파일 선택으로 전환합니다."
            : "Could not open the album. Falling back to file picker."
      );
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
          tags: isFails ? ["fails"] : [],
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
      setIsFails(false);
      if (preview) URL.revokeObjectURL(preview);
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

  if (!configured || !ready) {
    return (
      <section className={`${COMMUNITY_SOLID_SURFACE_CLASS} border border-dashed border-channel-community/20 p-8 text-center`}>
        <h2 className="text-2xl font-extrabold text-primary">
          📷 {isKo ? "우리아이 자랑 올리기" : "Post to Pet Show"}
        </h2>
        <div className="mx-auto mt-6 h-10 w-10 animate-spin rounded-full border-4 border-channel-community/20 border-t-channel-community" />
        <p className="mt-4 text-sm text-plum/65">
          {isKo ? "로그인 상태를 확인하는 중이에요." : "Checking your login status."}
        </p>
      </section>
    );
  }

  if (isAnonymous) {
    return (
      <section className={`${COMMUNITY_SOLID_SURFACE_CLASS} border border-dashed border-channel-community/30 p-8 text-center`}>
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
    <section className={`${COMMUNITY_SOLID_SURFACE_CLASS} p-6 md:p-10`}>
      <h2 className="text-2xl font-extrabold text-primary">📷 {isKo ? "우리 아이 자랑하기" : "Post to Pet Show"}</h2>
      <p className="mt-2 text-sm leading-6 text-plum/60">
        {isKo
          ? "펫사진은 개인정보 동의 범위 내에서 프로필·스냅존에 사용됩니다."
          : "Pet photos are used for profiles and Snapzone within your privacy consent."}
      </p>
      <p className="mt-3 rounded-2xl bg-[#ffd7ff]/40 px-4 py-3 text-sm font-semibold leading-6 text-primary">
        {isKo
          ? "웃긴 실패 사진이면 제목에 ‘실패샷’ 또는 ‘웃긴 사진’을 넣어 올려보세요."
          : "For funny fails, add “fail” or “funny” to the title."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section>
          <label className="text-sm font-extrabold text-primary">{isKo ? "사진 업로드" : "Photo upload"}</label>
          <div className="relative mt-4">
            <button
              type="button"
              onClick={() => {
                if (nativePickerAvailable) {
                  setShowImageOptions((value) => !value);
                  return;
                }
                fileRef.current?.click();
              }}
              className="group flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed border-outline/25 bg-white text-center transition hover:bg-sand/40"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center px-6">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-lavender text-4xl transition group-hover:scale-110">📷</span>
                  <span className="mt-4 text-lg font-extrabold text-primary">{isKo ? "사진 선택하기" : "Choose a photo"}</span>
                  <span className="mt-2 text-sm text-plum/50">
                    {isKo ? "권장 비율: 4:5 (세로), 최대 10MB" : "Recommended: 4:5 portrait, max 10MB"}
                  </span>
                </span>
              )}
            </button>
            {preview && (
              <button
                type="button"
                onClick={clearPreview}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-lg font-bold text-white shadow-sm backdrop-blur-sm transition hover:bg-black/70"
                aria-label={isKo ? "선택한 사진 취소" : "Remove selected photo"}
              >
                ✕
              </button>
            )}
          </div>
          {nativePickerAvailable && showImageOptions && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void chooseNativeImage("camera")}
                className="rounded-full bg-primary px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:brightness-105"
              >
                {isKo ? "카메라로 촬영" : "Take photo"}
              </button>
              <button
                type="button"
                onClick={() => void chooseNativeImage("photos")}
                className="rounded-full border border-primary/15 bg-white px-5 py-3 text-sm font-extrabold text-primary transition hover:bg-sand/40"
              >
                {isKo ? "앨범에서 선택" : "Choose from album"}
              </button>
            </div>
          )}
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
              ["dog", tSpecies("dog"), "🐕"],
              ["cat", tSpecies("cat"), "🐈"],
              ["reptile", tSpecies("reptile"), "🦎"],
              ["other", tSpecies("otherFriends"), "🐾"],
            ] as const).map(([value, label, emoji]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPetSpecies(value)}
                className={
                  petSpecies === value
                    ? "rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-white shadow-sm"
                    : "rounded-full border border-primary/15 bg-white px-6 py-3 text-sm font-extrabold text-primary transition hover:bg-sand/50"
                }
              >
                {emoji} {label}
              </button>
            ))}
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isFails}
              onChange={(e) => setIsFails(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm font-bold text-plum">
              {isKo ? "😂 웃긴 실패 사진으로 올리기" : "😂 Post as Funny Fail"}
            </span>
          </label>
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
