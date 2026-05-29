"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import type { CommunityPost } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";
import { PetShowPostActions } from "./PetShowPostActions";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

interface FeedResponse {
  posts: CommunityPost[];
  nextCursor: string | null;
  source: string;
}

interface PetShowFeedProps {
  refreshKey?: number;
}

export function PetShowFeed({ refreshKey = 0 }: PetShowFeedProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string>("");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);

  const load = useCallback(async (append: boolean, pageCursor: string | null) => {
    if (append && loadingMoreRef.current) return;
    if (append) loadingMoreRef.current = true;
    setLoading(true);
    try {
      const qs = pageCursor ? `?cursor=${encodeURIComponent(pageCursor)}` : "";
      const res = await fetch(`/api/community/pet-show/feed${qs}`);
      const data: FeedResponse = await res.json();
      setPosts((prev) => (append ? [...prev, ...data.posts] : data.posts));
      setNextCursor(data.nextCursor);
      setSource(data.source);
    } finally {
      setLoading(false);
      loadingMoreRef.current = false;
    }
  }, []);

  useEffect(() => {
    void load(false, null);
  }, [load, refreshKey]);

  useEffect(() => {
    if (!nextCursor) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && nextCursor && !loadingMoreRef.current) {
          void load(true, nextCursor);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [nextCursor, load]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-channel-community">📷 {isKo ? "스냅존" : "Snapzone"}</h2>
        {source === "mock" && (
          <span className="text-xs text-plum/50">
            {isKo ? "데모 스냅존 · Supabase 연동 시 실제 글" : "Demo Snapzone · Real posts when Supabase is connected"}
          </span>
        )}
      </div>

      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.id}>
            <article className="rounded-3xl border border-channel-community/20 bg-white/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/80">
              <Link href={`/community/pet-show/${post.id}`} className="block">
                <div className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-channel-community/10 text-4xl">
                  {post.image_urls?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.image_urls[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span aria-hidden>🐾</span>
                  )}
                </div>
                <h3 className="mt-3 font-semibold text-plum">
                  {post.title ?? (isKo ? "무제" : "Untitled")}
                </h3>
                {post.content && (
                  <p className="mt-1 text-sm text-plum/65">{post.content}</p>
                )}
              </Link>
              <div className="mt-3">
                <PetShowPostActions
                  postId={post.id}
                  initialLikeCount={post.like_count}
                  commentCount={post.comment_count}
                  commentsHref={`/community/pet-show/${post.id}#comments`}
                  disabled={post.id.startsWith("mock-")}
                />
              </div>
            </article>
          </li>
        ))}
      </ul>

      <div ref={sentinelRef} className="h-8 text-center text-xs text-plum/45">
        {loading ? (isKo ? "불러오는 중…" : "Loading…") : nextCursor ? "" : isKo ? "마지막 스냅" : "End of Snapzone"}
      </div>
    </section>
  );
}
