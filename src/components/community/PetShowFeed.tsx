"use client";

import { COMMUNITY_SOLID_CARD_CLASS } from "@/components/community/CommunityDetailSurface";
import { getCountryLabel } from "@/lib/i18n/countries";
import type { CommunityPost } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
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
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-channel-community">Snapzone</p>
          <h2 className="mt-2 text-2xl font-extrabold text-primary">📷 {isKo ? "최신 게시글" : "Latest posts"}</h2>
        </div>
        {source === "mock" && (
          <span className="text-xs text-plum/50">
            {isKo ? "데모 스냅존 · Supabase 연동 시 실제 글" : "Demo Snapzone · Real posts when Supabase is connected"}
          </span>
        )}
      </div>

      <ul className="columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3">
        {posts.map((post) => (
          <li key={post.id} className="break-inside-avoid">
            <article className={`${COMMUNITY_SOLID_CARD_CLASS} p-3 transition hover:-translate-y-1 hover:bg-white`}>
              <Link href={`/community/pet-show/${post.id}`} className="block">
                <div className="flex overflow-hidden rounded-2xl bg-channel-community/10 text-4xl">
                  {post.image_urls?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={supabaseImageTransformUrl(post.image_urls[0], { width: 720, height: 960 })}
                      alt=""
                      className="h-auto w-full object-cover"
                    />
                  ) : (
                    <span className="flex aspect-[4/5] w-full items-center justify-center" aria-hidden>
                      🐾
                    </span>
                  )}
                </div>
                <h3 className="mt-4 px-2 font-extrabold text-primary">
                  {post.title ?? (isKo ? "무제" : "Untitled")}
                </h3>
                {getCountryLabel(post.country_code, locale) && (
                  <p className="mt-1 px-2 text-xs font-bold text-plum/50">
                    {getCountryLabel(post.country_code, locale)}
                  </p>
                )}
                {post.content && (
                  <p className="mt-2 px-2 text-sm leading-6 text-plum/65">{post.content}</p>
                )}
              </Link>
              <div className="mt-4 border-t border-primary/5 px-2 pt-3">
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
