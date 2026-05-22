"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";

interface QaComposerProps {
  onPosted: () => void;
}

export function QaComposer({ onPosted }: QaComposerProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { accessToken, isAnonymous, configured } = useSupabaseSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!configured) {
    return (
      <p className="text-sm text-plum/70">
        {isKo ? "Supabase 연동 후 질문을 올릴 수 있어요." : "You can post questions after Supabase is connected."}
      </p>
    );
  }

  if (isAnonymous) {
    return (
      <div className="rounded-2xl border border-dashed border-channel-community/30 bg-channel-community/5 px-5 py-4 text-center">
        <p className="text-sm text-plum/70">{isKo ? "질문을 남기려면 로그인이 필요해요." : "Please log in to post a question."}</p>
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

      const res = await fetch("/api/community/qa/posts", {
        method: "POST",
        headers,
        body: JSON.stringify({ title, content, language: "ko" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? (isKo ? "등록 실패" : "Post failed"));

      setTitle("");
      setContent("");
      onPosted();
    } catch (err) {
      setError(err instanceof Error ? err.message : isKo ? "등록 실패" : "Post failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pastel-card space-y-3 p-5">
      <h3 className="font-bold text-plum">{isKo ? "질문 올리기" : "Ask a question"}</h3>
      <input
        className="pastel-input"
        placeholder={isKo ? "제목 (예: 산책 중 짖음이 심해요)" : "Title (e.g. Barking during walks)"}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        maxLength={120}
      />
      <textarea
        className="pastel-input min-h-[100px] resize-y"
        placeholder={isKo ? "상황을 자세히 적어주세요 (10자 이상)" : "Describe the situation in detail (10+ chars)"}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        minLength={10}
        maxLength={2000}
      />
      {error && <p className="text-sm text-red-700/80">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-channel-community py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? (isKo ? "등록 중…" : "Posting…") : isKo ? "질문 등록" : "Post question"}
      </button>
    </form>
  );
}
