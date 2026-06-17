"use client";

import {
  COMMUNITY_CHIP_IDLE_CLASS,
  COMMUNITY_CHIP_IDLE_SM_CLASS,
  COMMUNITY_SOLID_CARD_CLASS,
  COMMUNITY_SOLID_SURFACE_CLASS,
} from "@/components/community/CommunityDetailSurface";
import { EmptyStatePanel, getBoardEmptyState } from "@/components/ui/EmptyStatePanel";
import { PET_CATEGORY_FILTER_TAGS } from "@/lib/community/qa-mock-data";
import type { CommunityBoardKind } from "@/lib/community/qa-feed";
import {
  getAnimalLabel,
  getBoardCategories,
  getBoardSubcategories,
  getCategoryLabel,
  getSubcategoryLabel,
  isPetAnimalType,
  resolvePostAnimalType,
  subcategoryIdFromTag,
} from "@/lib/community/board-categories";
import { getCountryLabel } from "@/lib/i18n/countries";
import { communityPostPath } from "@/lib/community/post-path";
import type { CommunityPost } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  const [animalTag, setAnimalTag] = useState("all");
  const [categoryTag, setCategoryTag] = useState("all");
  const [subCategoryTag, setSubCategoryTag] = useState("all");
  const [searchInput, setSearchInput] = useState("");

  const categoryBoard = board === "tips" ? "tips" : "qa";
  const majorCategoryFilters = useMemo((): Array<{ id: string; ko: string; en: string }> => {
    if ((board !== "qa" && board !== "tips") || animalTag === "all" || !isPetAnimalType(animalTag)) {
      return [];
    }
    return [{ id: "all", ko: "전체", en: "All" }, ...getBoardCategories(categoryBoard, animalTag)];
  }, [animalTag, board, categoryBoard]);
  const subCategoryFilters = useMemo((): Array<{ id: string; ko: string; en: string }> => {
    if (
      board !== "tips" ||
      animalTag === "all" ||
      categoryTag === "all" ||
      !isPetAnimalType(animalTag)
    ) {
      return [];
    }
    return [{ id: "all", ko: "전체", en: "All" }, ...getBoardSubcategories("tips", animalTag, categoryTag)];
  }, [animalTag, board, categoryTag]);

  const load = useCallback(
    async (cursor?: string | null) => {
      if (cursor) setLoadingMore(true);
      else setLoading(true);
      try {
        const params = new URLSearchParams();
        if (cursor) params.set("cursor", cursor);
        if (q) params.set("q", q);
        if (animalTag !== "all") params.set("tag", animalTag);
        if (categoryTag !== "all") params.set("category", categoryTag);
        if (board === "tips" && subCategoryTag !== "all") params.set("subCategory", subCategoryTag);
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
    [board, q, animalTag, categoryTag, subCategoryTag]
  );

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQ(searchInput.trim());
  }

  const isQa = board === "qa";

  if (loading) {
    return (
      <p className={`${COMMUNITY_SOLID_SURFACE_CLASS} p-6 text-center text-sm text-plum/70`}>
        {isKo ? "게시글 불러오는 중…" : "Loading posts…"}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-lg text-plum/35" aria-hidden>
          🔎
        </span>
        <input
          className="w-full rounded-full border border-white/35 bg-white py-4 pl-12 pr-28 text-sm font-semibold text-primary shadow-sm outline-none focus:border-channel-community/30 focus:ring-4 focus:ring-mint/60"
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

      {(isQa || board === "tips") && (
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {PET_CATEGORY_FILTER_TAGS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setAnimalTag(item.id);
                setCategoryTag("all");
                setSubCategoryTag("all");
              }}
              className={
                animalTag === item.id
                  ? "whitespace-nowrap rounded-full bg-channel-community px-5 py-2.5 text-xs font-extrabold text-white shadow-sm"
                  : COMMUNITY_CHIP_IDLE_CLASS
              }
            >
              {isKo ? item.ko : item.en}
            </button>
          ))}
        </div>
      )}

      {(isQa || board === "tips") && majorCategoryFilters.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {majorCategoryFilters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setCategoryTag(item.id);
                setSubCategoryTag("all");
              }}
              className={
                categoryTag === item.id
                  ? "whitespace-nowrap rounded-full bg-mint/80 px-4 py-2 text-xs font-extrabold text-primary shadow-sm"
                  : COMMUNITY_CHIP_IDLE_SM_CLASS
              }
            >
              {isKo ? item.ko : item.en}
            </button>
          ))}
        </div>
      )}

      {board === "tips" && subCategoryFilters.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {subCategoryFilters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSubCategoryTag(item.id)}
              className={
                subCategoryTag === item.id
                  ? "whitespace-nowrap rounded-full bg-sand px-4 py-2 text-xs font-extrabold text-primary shadow-sm"
                  : COMMUNITY_CHIP_IDLE_SM_CLASS
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
              onClick={() => setAnimalTag(item.id)}
              className={
                animalTag === item.id
                  ? "whitespace-nowrap rounded-full bg-channel-community px-5 py-2.5 text-xs font-extrabold text-white shadow-sm"
                  : COMMUNITY_CHIP_IDLE_CLASS
              }
            >
              {isKo ? item.ko : item.en}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
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
          {...getBoardEmptyState(board, isKo, { q, tag: animalTag })}
          compact
          solidSurface
          suggestions={
            q || animalTag !== "all" || categoryTag !== "all" || subCategoryTag !== "all"
              ? undefined
              : getBoardEmptyState(board, isKo, {}).suggestions
          }
        />
      )}

      <ul className="grid gap-5 md:grid-cols-2">
        {posts.map((post) => {
          const animal = resolvePostAnimalType(post.animal_type, post.tags);
          const animalLabel = getAnimalLabel(animal, isKo);
          const categoryLabel =
            post.category && animal
              ? getCategoryLabel(categoryBoard, animal, post.category, isKo)
              : null;
          const postSubcategory = post.tags.map(subcategoryIdFromTag).find(Boolean) ?? null;
          const subcategoryLabel =
            board === "tips" && post.category && animal
              ? getSubcategoryLabel("tips", animal, post.category, postSubcategory, isKo)
              : null;
          const displayTags = post.tags.filter(
            (t) =>
              !isPetAnimalType(t) &&
              t !== "qa" &&
              t !== "tips" &&
              t !== "free" &&
              !t.startsWith("experience:") &&
              !t.startsWith("subcategory:")
          );

          return (
          <li key={post.id}>
            <Link
              href={communityPostPath(board, post)}
              className={`${COMMUNITY_SOLID_CARD_CLASS} flex h-full flex-col justify-between p-5 transition hover:-translate-y-1 hover:bg-white`}
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
                  {animalLabel && (
                    <span className="rounded-full bg-sand/80 px-3 py-1 text-[10px] font-bold text-plum/70">
                      {animalLabel}
                    </span>
                  )}
                  {categoryLabel && (
                    <span className="rounded-full bg-mint/35 px-3 py-1 text-[10px] font-bold text-plum/75">
                      {categoryLabel}
                    </span>
                  )}
                  {subcategoryLabel && (
                    <span className="rounded-full bg-sand/80 px-3 py-1 text-[10px] font-bold text-plum/70">
                      {subcategoryLabel}
                    </span>
                  )}
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
                {displayTags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {displayTags.map((t) => (
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
          );
        })}
      </ul>

      {nextCursor && (
        <button
          type="button"
          onClick={() => void load(nextCursor)}
          disabled={loadingMore}
          className="w-full rounded-full border border-channel-community/30 bg-white py-3 text-sm font-semibold text-channel-community shadow-sm disabled:opacity-60"
        >
          {loadingMore ? (isKo ? "불러오는 중..." : "Loading...") : isKo ? "더 보기" : "Load more"}
        </button>
      )}
    </div>
  );
}
