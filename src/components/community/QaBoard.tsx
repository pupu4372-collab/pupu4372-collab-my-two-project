"use client";

import { EmptyStatePanel, getBoardEmptyState } from "@/components/ui/EmptyStatePanel";
import { PET_CATEGORY_FILTER_TAGS, QA_FILTER_TAGS } from "@/lib/community/qa-mock-data";
import type { CommunityBoardKind } from "@/lib/community/qa-feed";
import { getCountryLabel } from "@/lib/i18n/countries";
import type { CommunityPost } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useState } from "react";

const EXPERIENCE_FILTER_TAGS = [
  { id: "all", ko: "전체", en: "All" },
  { id: "experience:dog", ko: "강아지 견종", en: "Dog breeds" },
  { id: "experience:cat", ko: "고양이 묘종", en: "Cat breeds" },
  { id: "experience:other", ko: "렙타일(다른동물)", en: "Other animals" },
];

interface QaFeedResponse {
  posts: CommunityPost[];
  nextCursor: string | null;
  source: string;
  total?: number;
}

interface QaBoardProps {
  refreshKey?: number;
  board?: CommunityBoardKind;
}

export function QaBoard({ refreshKey = 0, board = "qa" }: QaBoardProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("all");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback(
    async (cursor?: string | null) => {
      if (cursor) setLoadingMore(true);
      else setLoading(true);
      try {
        const params = new URLSearchParams();
        if (cursor) params.set("cursor", cursor);
        if (q) params.set("q", q);
        if (tag !== "all") params.set("tag", tag);
        const res = await fetch(`/api/community/${board}/feed?${params.toString()}`);
        const data: QaFeedResponse = await res.json();
        setPosts((prev) => (cursor ? [...prev, ...(data.posts ?? [])] : data.posts ?? []));
        setNextCursor(data.nextCursor ?? null);
        setTotal(data.total ?? null);
        setSource(data.source ?? "");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [board, q, tag]
  );

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQ(searchInput.trim());
  }

  const isQa = board === "qa";
  const boardPath = `/community/${board}`;

  if (loading) {
    return <p className="pastel-card p-6 text-center text-sm text-plum/60">{isKo ? "게시글 불러오는 중…" : "Loading posts…"}</p>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-lg text-plum/35" aria-hidden>
          🔎
        </span>
        <input
          className="w-full rounded-full border border-white/70 bg-white/65 py-4 pl-12 pr-28 text-sm font-semibold text-primary shadow-sm outline-none backdrop-blur focus:border-channel-community/30 focus:ring-4 focus:ring-mint/60"
          placeholder={isKo ? "궁금한 내용을 검색해보세요" : "Search title or content"}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-channel-community px-5 py-2.5 text-sm font-extrabold text-white shadow-sm"
        >
          {isKo ? "검색" : "Search"}
        </button>
      </form>

      {isQa && <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {QA_FILTER_TAGS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTag(item.id)}
            className={
              tag === item.id
                ? "whitespace-nowrap rounded-full bg-channel-community px-5 py-2.5 text-xs font-extrabold text-white shadow-sm"
                : "whitespace-nowrap rounded-full bg-white/60 px-5 py-2.5 text-xs font-bold text-plum/70 shadow-sm transition hover:bg-white"
            }
          >
            {item.label}
          </button>
        ))}
      </div>}

      {board === "tips" && (
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {PET_CATEGORY_FILTER_TAGS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTag(item.id)}
              className={
                tag === item.id
                  ? "whitespace-nowrap rounded-full bg-channel-community px-5 py-2.5 text-xs font-extrabold text-white shadow-sm"
                  : "whitespace-nowrap rounded-full bg-white/60 px-5 py-2.5 text-xs font-bold text-plum/70 shadow-sm transition hover:bg-white"
              }
            >
              {isKo ? item.ko : item.en}
            </button>
          ))}
        </div>
      )}

      {board === "experience" && (
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {EXPERIENCE_FILTER_TAGS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTag(item.id)}
              className={
                tag === item.id
                  ? "whitespace-nowrap rounded-full bg-channel-community px-5 py-2.5 text-xs font-extrabold text-white shadow-sm"
                  : "whitespace-nowrap rounded-full bg-white/60 px-5 py-2.5 text-xs font-bold text-plum/70 shadow-sm transition hover:bg-white"
              }
            >
              {isKo ? item.ko : item.en}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-plum/50">
        {source === "mock" && (
          <span>{isKo ? "데모 게시글 (Supabase 연동 시 DB 데이터)" : "Demo posts (DB data when Supabase is connected)"}</span>
        )}
        {total != null && source === "supabase" && (
          <span>{isKo ? `검색 결과 ${total}건` : `${total} results`}</span>
        )}
        {q && (
          <button type="button" className="underline" onClick={() => { setQ(""); setSearchInput(""); }}>
            {isKo ? "검색어 지우기" : "Clear search"}
          </button>
        )}
      </div>

      {posts.length === 0 && (
        <EmptyStatePanel
          {...getBoardEmptyState(board, isKo, { q, tag })}
          compact
          suggestions={
            q || tag !== "all"
              ? undefined
              : getBoardEmptyState(board, isKo, {}).suggestions
          }
        />
      )}

      <ul className="grid gap-5 md:grid-cols-2">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`${boardPath}/${post.id}`}
              className="pastel-card flex h-full flex-col justify-between p-5 shadow-sm transition hover:-translate-y-1 hover:bg-white/80"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {post.is_pinned && (
                    <span className="rounded-full bg-gold/45 px-3 py-1 text-[10px] font-extrabold text-primary">
                      {isKo ? "고정" : "Pinned"}
                    </span>
                  )}
                  <span className="rounded-full bg-channel-community/10 px-3 py-1 text-[10px] font-extrabold text-channel-community">
                    {isQa ? "Q&A" : board}
                  </span>
                  <span className="text-xs font-semibold text-plum/45">
                    💬 {post.comment_count} · 👀 {post.view_count}
                  </span>
                  {getCountryLabel(post.country_code, locale) && (
                    <span className="text-xs font-bold text-plum/45">
                      {getCountryLabel(post.country_code, locale)}
                    </span>
                  )}
                </div>
                <h4 className="mt-4 text-lg font-extrabold leading-snug text-primary">{post.title}</h4>
                {post.content && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-plum/70">
                    {post.content}
                  </p>
                )}
                {post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-channel-community/10 px-2.5 py-1 text-[11px] font-semibold text-channel-community"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-5 text-sm font-extrabold text-channel-community">{isKo ? "자세히 보기" : "Read more"} →</p>
            </Link>
          </li>
        ))}
      </ul>

      {nextCursor && (
        <button
          type="button"
          onClick={() => void load(nextCursor)}
          disabled={loadingMore}
          className="w-full rounded-full border border-channel-community/30 bg-white/55 py-3 text-sm font-semibold text-channel-community disabled:opacity-60"
        >
          {loadingMore ? (isKo ? "불러오는 중..." : "Loading...") : isKo ? "더 보기" : "Load more"}
        </button>
      )}
    </div>
  );
}
