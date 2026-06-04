"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import type { CommunityBoardKind } from "@/lib/community/qa-feed";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";

interface QaComposerProps {
  onPosted: () => void;
  board?: CommunityBoardKind;
}

const PET_CATEGORY_OPTIONS = [
  { value: "dog", ko: "강아지", en: "Dog" },
  { value: "cat", ko: "고양이", en: "Cat" },
  { value: "other", ko: "렙타일(다른동물)", en: "Reptile & other pets" },
] as const;

export function QaComposer({ onPosted, board = "qa" }: QaComposerProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { accessToken, isAnonymous, configured } = useSupabaseSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [petCategory, setPetCategory] = useState("");
  const [experienceTag, setExperienceTag] = useState("experience:dog");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputClass =
    "pastel-input mt-2 w-full rounded-[2rem] border-transparent bg-sand/50 px-4 py-3.5 text-sm text-on-surface focus:ring-primary/20";
  const labelClass = "block text-sm font-bold text-primary";

  if (!configured) {
    return (
      <p className="text-sm text-plum/70">
        {isKo ? "Supabase 연동 후 글을 올릴 수 있어요." : "You can post after Supabase is connected."}
      </p>
    );
  }

  if (isAnonymous) {
    return (
      <div className="glass-card rounded-[2rem] border border-dashed border-channel-community/30 px-5 py-5 text-center">
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

      const res = await fetch(`/api/community/${board}/posts`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title,
          content,
          language: "ko",
          tags:
            board === "experience"
              ? [experienceTag]
              : board === "qa" || board === "tips"
                ? petCategory ? [petCategory] : undefined
                : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? (isKo ? "등록 실패" : "Post failed"));

      setTitle("");
      setContent("");
      setPetCategory("");
      setExperienceTag("experience:dog");
      onPosted();
    } catch (err) {
      setError(err instanceof Error ? err.message : isKo ? "등록 실패" : "Post failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form id="board-composer" onSubmit={handleSubmit} className="pastel-card scroll-mt-24 space-y-5 p-6">
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
        <label className={labelClass}>
          {isKo ? "분류" : "Category"}
          <select
            value={experienceTag}
            onChange={(e) => setExperienceTag(e.target.value)}
            className={inputClass}
          >
            <option value="experience:dog">{isKo ? "강아지 견종" : "Dog breeds"}</option>
            <option value="experience:cat">{isKo ? "고양이 묘종" : "Cat breeds"}</option>
            <option value="experience:other">
              {isKo ? "렙타일(다른동물) (토끼·햄스터·새·파충류·물고기 등)" : "Other animals"}
            </option>
          </select>
        </label>
      )}
      {(board === "qa" || board === "tips") && (
        <label className={labelClass}>
          {isKo ? "분류" : "Category"}
          <select
            value={petCategory}
            onChange={(e) => setPetCategory(e.target.value)}
            className={inputClass}
            required
          >
            <option value="">{isKo ? "선택" : "Select"}</option>
            {PET_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {isKo ? option.ko : option.en}
              </option>
            ))}
          </select>
        </label>
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
                ? "품종/종, 나이, 성격, 좋았던 관리법, 조심할 점을 적어주세요. 렙타일(다른동물)은 종 이름을 제목이나 내용에 꼭 넣어주세요."
                : "Share species/breed, age, personality, helpful care tips, and cautions."
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
