"use client";

import { COMMUNITY_SOLID_SURFACE_CLASS } from "@/components/community/CommunityDetailSurface";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import type { CommunityBoardKind } from "@/lib/community/qa-feed";
import {
  getBoardCategories,
  getBoardSubcategories,
  getPetAnimalOptions,
  subcategoryTag,
  TIPS_DIFFICULTY_OPTIONS,
  type PetAnimalType,
} from "@/lib/community/board-categories";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

interface QaComposerProps {
  onPosted: () => void;
  board?: CommunityBoardKind;
}

export function QaComposer({ onPosted, board = "qa" }: QaComposerProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const tSpecies = useTranslations("petSpecies");
  const { accessToken, isAnonymous, configured } = useSupabaseSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [petCategory, setPetCategory] = useState<PetAnimalType | "">("");
  const [majorCategory, setMajorCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [experienceTag, setExperienceTag] = useState("experience:dog");
  const [experienceBreed, setExperienceBreed] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputClass =
    "pastel-input mt-2 w-full rounded-[2rem] border-transparent bg-sand/50 px-4 py-3.5 text-sm text-on-surface focus:ring-primary/20";
  const labelClass = "block text-sm font-bold text-primary";

  const categoryBoard = board === "tips" ? "tips" : "qa";
  const majorCategoryOptions = useMemo(() => {
    if (!petCategory || (board !== "qa" && board !== "tips")) return [];
    return getBoardCategories(categoryBoard, petCategory);
  }, [board, categoryBoard, petCategory]);
  const subCategoryOptions = useMemo(() => {
    if (!petCategory || !majorCategory || board !== "tips") return [];
    return getBoardSubcategories("tips", petCategory, majorCategory);
  }, [board, majorCategory, petCategory]);

  if (!configured) {
    return (
      <p className="text-sm text-plum/70">
        {isKo ? "Supabase 연동 후 글을 올릴 수 있어요." : "You can post after Supabase is connected."}
      </p>
    );
  }

  if (isAnonymous) {
    return (
      <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} border border-dashed border-channel-community/30 px-5 py-5 text-center`}>
        <p className="text-sm text-plum/70">{isKo ? "글을 남기려면 로그인이 필요해요." : "Please log in to post."}</p>
        <Link
          href="/login"
          className="mt-3 inline-flex rounded-full bg-channel-community px-5 py-2.5 text-sm font-semibold text-white"
        >
          {isKo ? "로그인하기" : "Log in"}
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
      const composedContent =
        board === "experience" && experienceBreed.trim()
          ? `${isKo ? "품종/종" : "Breed/species"}: ${experienceBreed.trim()}\n\n${content}`
          : content;

      const res = await fetch(`/api/community/${board}/posts`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title,
          content: composedContent,
          language: "ko",
          ...(board === "experience"
            ? { tags: [experienceTag] }
            : board === "qa" || board === "tips"
              ? {
                  animalType: petCategory,
                  category: majorCategory,
                  ...(board === "tips" && subCategory
                    ? { subCategory, tags: [subcategoryTag(subCategory)] }
                    : {}),
                  ...(board === "tips"
                    ? { difficulty }
                    : {}),
                }
              : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? (isKo ? "등록 실패" : "Post failed"));

      setTitle("");
      setContent("");
      setPetCategory("");
      setMajorCategory("");
      setSubCategory("");
      setDifficulty("");
      setExperienceTag("experience:dog");
      setExperienceBreed("");
      onPosted();
    } catch (err) {
      setError(err instanceof Error ? err.message : isKo ? "등록 실패" : "Post failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form id="board-composer" onSubmit={handleSubmit} className={`${COMMUNITY_SOLID_SURFACE_CLASS} scroll-mt-24 space-y-5 p-6`}>
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-channel-community">
          Community
        </p>
        <h3 className="mt-1 text-xl font-bold text-primary">
          {board === "qa"
            ? isKo ? "질문 올리기" : "Ask a question"
            : board === "tips"
              ? isKo ? "꿀팁 올리기" : "Share a tip"
              : board === "experience"
                ? isKo ? "품종별 경험담 올리기" : "Share breed experience"
                : isKo ? "자유글 올리기" : "Write a post"}
        </h3>
      </div>
      {board === "experience" && (
        <>
          <label className={labelClass}>
            {isKo ? "분류" : "Category"}
            <select
              value={experienceTag}
              onChange={(e) => setExperienceTag(e.target.value)}
              className={inputClass}
            >
              <option value="experience:dog">{tSpecies("dog")}</option>
              <option value="experience:cat">{tSpecies("cat")}</option>
              <option value="experience:reptile">{tSpecies("reptile")}</option>
              <option value="experience:other">{tSpecies("otherFriends")}</option>
            </select>
          </label>
          <label className={labelClass}>
            {isKo ? "품종/종" : "Breed/species"}
            <input
              className={inputClass}
              placeholder={
                isKo
                  ? "예: 말티즈, 코리안숏헤어, 레오파드게코처럼 품종이나 종을 적어주세요"
                  : "Ex: Maltese, Korean shorthair, leopard gecko"
              }
              value={experienceBreed}
              onChange={(e) => setExperienceBreed(e.target.value)}
              required
              maxLength={60}
            />
          </label>
        </>
      )}
      {(board === "qa" || board === "tips") && (
        <>
          <label className={labelClass}>
            {isKo ? "동물 종류" : "Pet type"}
            <select
              value={petCategory}
              onChange={(e) => {
                setPetCategory(e.target.value as PetAnimalType | "");
                setMajorCategory("");
                setSubCategory("");
              }}
              className={inputClass}
              required
            >
              <option value="">{isKo ? "선택" : "Select"}</option>
              {getPetAnimalOptions(isKo).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            {isKo ? "대분류" : "Topic"}
            <select
              value={majorCategory}
              onChange={(e) => {
                setMajorCategory(e.target.value);
                setSubCategory("");
              }}
              className={inputClass}
              required
              disabled={!petCategory}
            >
              <option value="">{isKo ? "선택" : "Select"}</option>
              {majorCategoryOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {isKo ? option.ko : option.en}
                </option>
              ))}
            </select>
          </label>
          {board === "tips" && (
            <>
              <label className={labelClass}>
                {isKo ? "소분류" : "Subtopic"}
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className={inputClass}
                  required
                  disabled={!majorCategory || subCategoryOptions.length === 0}
                >
                  <option value="">{isKo ? "선택" : "Select"}</option>
                  {subCategoryOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {isKo ? option.ko : option.en}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                {isKo ? "난이도" : "Difficulty"}
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className={inputClass}
                  required
                  disabled={!petCategory}
                >
                  <option value="">{isKo ? "선택" : "Select"}</option>
                  {TIPS_DIFFICULTY_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {isKo ? option.ko : option.en}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
        </>
      )}
      <label className={labelClass}>
        {isKo ? "제목" : "Title"}
        <input
          className={inputClass}
          placeholder={
            board === "experience"
              ? isKo
                ? "예: 말티즈 3년차 집사의 눈물 관리 경험"
                : "Ex: 3 years with a Maltese: tear care"
              : isKo ? "제목을 입력해 주세요" : "Enter a title"
          }
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={120}
        />
      </label>
      <label className={labelClass}>
        {isKo ? "내용" : "Content"}
        <textarea
          className={`${inputClass} min-h-[140px] resize-y rounded-[1.5rem] leading-relaxed`}
          placeholder={
            board === "experience"
              ? isKo
                ? "나이, 성격, 좋았던 관리법, 조심할 점을 적어주세요."
                : "Share age, personality, helpful care tips, and cautions."
              : isKo ? "내용을 자세히 적어주세요 (10자 이상)" : "Describe it in detail (10+ chars)"
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          minLength={10}
          maxLength={2000}
        />
      </label>
      {error && <p className="text-sm text-red-700/80">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-channel-community py-3.5 text-sm font-bold text-white shadow-lg shadow-channel-community/15 transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? (isKo ? "등록 중…" : "Posting…") : isKo ? "등록" : "Post"}
      </button>
    </form>
  );
}
