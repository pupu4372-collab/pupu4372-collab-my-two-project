"use client";

import { COMMUNITY_CHIP_IDLE_SM_CLASS, COMMUNITY_SOLID_CARD_CLASS } from "@/components/community/CommunityDetailSurface";
import type { CommunityPost, PetShowSpecies } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import { PetShowPostActions } from "./PetShowPostActions";
import { PetShowDeleteButton } from "./PetShowDeleteButton";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

interface FeedResponse {
  posts: CommunityPost[];
  nextCursor: string | null;
  source: string;
}

export type PetShowSpeciesFilter = "all" | PetShowSpecies;

interface PetShowFeedProps {
  refreshKey?: number;
  tags?: string[];
  photoCategory?: "cute" | "funny";
  species?: PetShowSpeciesFilter;
  variant?: "masonry" | "grid";
}

export function PetShowFeed({
  refreshKey = 0,
  tags,
  photoCategory,
  species = "all",
  variant = "masonry",
}: PetShowFeedProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const t = useTranslations("petshow");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string>("");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);

  const load = useCallback(
    async (append: boolean, pageCursor: string | null) => {
      if (append && loadingMoreRef.current) return;
      if (append) loadingMoreRef.current = true;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (pageCursor) params.set("cursor", pageCursor);
        tags?.forEach((tag) => params.append("tag", tag));
        if (photoCategory) params.set("photoCategory", photoCategory);
        if (species !== "all") params.set("species", species);
        const qs = params.toString() ? `?${params.toString()}` : "";
        const res = await fetch(`/api/community/pet-show/feed${qs}`);
        const data: FeedResponse = await res.json();
        setPosts((prev) => (append ? [...prev, ...data.posts] : data.posts));
        setNextCursor(data.nextCursor);
        setSource(data.source);
      } finally {
        setLoading(false);
        loadingMoreRef.current = false;
      }
    },
    [tags, photoCategory, species],
  );

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
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [nextCursor, load]);

  const handleDeleted = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  }, []);

  return (
    <section className="space-y-5">
      {variant === "masonry" && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-channel-community">Snapzone</p>
            <h2 className="mt-2 text-2xl font-extrabold text-primary">
              📷 {isKo ? "최신 게시글" : "Latest posts"}
            </h2>
          </div>
          {source === "mock" && (
            <span className="text-xs text-plum/50">{t("snapzoneDemo")}</span>
          )}
        </div>
      )}

      {posts.length === 0 && !loading ? (
        <div className="rounded-[2rem] border border-white/35 bg-white/95 px-6 py-12 text-center text-sm text-plum/70">
          {t("snapzoneEmpty")}
        </div>
      ) : variant === "grid" ? (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {posts.map((post) => (
            <li key={post.id}>
              <SnapzoneGridCard post={post} isKo={isKo} onDeleted={() => handleDeleted(post.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3">
          {posts.map((post) => (
            <li key={post.id} className="break-inside-avoid">
              <MasonryCard post={post} isKo={isKo} />
            </li>
          ))}
        </ul>
      )}

      <div ref={sentinelRef} className="h-8 text-center text-xs text-plum/45">
        {loading ? (isKo ? "불러오는 중…" : "Loading…") : nextCursor ? "" : isKo ? "마지막 스냅" : "End of Snapzone"}
      </div>
    </section>
  );
}

function SnapzoneGridCard({
  post,
  isKo,
  onDeleted,
}: {
  post: CommunityPost;
  isKo: boolean;
  onDeleted: () => void;
}) {
  return (
    <article className={`${COMMUNITY_SOLID_CARD_CLASS} overflow-hidden p-2 transition hover:-translate-y-0.5 hover:bg-white`}>
      <div className="relative">
        <Link href={`/community/pet-show/${post.id}`} className="block">
          <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-channel-community/10">
            {post.image_urls?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={supabaseImageTransformUrl(post.image_urls[0], { width: 640, height: 800 })}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl" aria-hidden>
                🐾
              </span>
            )}
          </div>
          <h3 className="mt-2 line-clamp-2 px-1 text-sm font-extrabold text-primary">
            {post.title ?? (isKo ? "무제" : "Untitled")}
          </h3>
          <p className="mt-1 px-1 text-xs font-bold text-plum/60">
            ♥ {post.like_count} · 💬 {post.comment_count}
          </p>
        </Link>
        <PetShowDeleteButton
          postId={post.id}
          authorId={post.author_id}
          variant="icon"
          onDeleted={onDeleted}
          disabled={post.id.startsWith("mock-")}
          className="absolute right-3 top-3"
        />
      </div>
    </article>
  );
}

function MasonryCard({ post, isKo }: { post: CommunityPost; isKo: boolean }) {
  return (
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
  );
}
