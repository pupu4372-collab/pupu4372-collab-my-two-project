"use client";

import { QA_FILTER_TAGS } from "@/lib/community/qa-mock-data";
import type { CommunityPost } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useState } from "react";

interface QaFeedResponse {
  posts: CommunityPost[];
  nextCursor: string | null;
  source: string;
  total?: number;
}

interface QaBoardProps {
  refreshKey?: number;
}

export function QaBoard({ refreshKey = 0 }: QaBoardProps) {
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
        const res = await fetch(`/api/community/qa/feed?${params.toString()}`);
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
    [q, tag]
  );

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQ(searchInput.trim());
  }

  if (loading) {
    return <p className="text-sm text-plum/60">{isKo ? "질문 불러오는 중…" : "Loading questions…"}</p>;
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          className="pastel-input flex-1"
          placeholder={isKo ? "제목·내용 검색 (예: 산책, 화장실)" : "Search title or content (e.g. walks, litter)"}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-channel-community px-4 py-2 text-sm font-semibold text-white"
        >
          {isKo ? "검색" : "Search"}
        </button>
      </form>

      <div className="flex flex-wrap gap-1.5">
        {QA_FILTER_TAGS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTag(item.id)}
            className={
              tag === item.id
                ? "rounded-full bg-channel-community px-3 py-1 text-xs font-bold text-white"
                : "rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-plum/70"
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-plum/50">
        {source === "mock" && (
          <span>{isKo ? "데모 Q&A 50건 (Supabase 연동 시 DB 데이터)" : "50 demo Q&A posts (DB data when Supabase is connected)"}</span>
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
        <p className="rounded-2xl bg-white/50 px-4 py-6 text-center text-sm text-plum/60">
          {isKo ? "조건에 맞는 질문이 없어요." : "No questions match your filters."}
        </p>
      )}

      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/community/qa/${post.id}`}
              className="block rounded-2xl border border-white/70 bg-white/60 px-4 py-4 transition hover:-translate-y-0.5 hover:bg-white/80"
            >
              <div className="flex flex-wrap items-center gap-2">
                {post.is_pinned && (
                  <span className="rounded-full bg-gold/40 px-2 py-0.5 text-[10px] font-bold text-plum">
                    {isKo ? "고정" : "Pinned"}
                  </span>
                )}
                <span className="text-xs text-plum/45">
                  💬 {post.comment_count} · 👀 {post.view_count}
                </span>
              </div>
              <h4 className="mt-2 font-bold text-plum">{post.title}</h4>
              {post.content && (
                <p className="mt-2 text-sm leading-relaxed text-plum/70 line-clamp-3">
                  {post.content}
                </p>
              )}
              {post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-channel-community/10 px-2 py-0.5 text-[11px] text-channel-community"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
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
