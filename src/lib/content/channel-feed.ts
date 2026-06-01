import { getChannelContent } from "@/lib/channel/content";
import type { ChannelArticle, PetChannel } from "@/lib/channel/content";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface ChannelEditorialRow {
  id: string;
  title: string;
  summary: string | null;
  body: string | null;
  tags: string[];
  is_featured: boolean;
  published_at: string | null;
  category?: {
    slug: string;
    name_ko: string;
    name_en: string;
    emoji: string | null;
  } | null;
}

type Locale = "ko" | "en";

function estimateReadTime(text: string, locale: Locale): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(2, Math.min(8, Math.ceil(words / 120)));
  return locale === "en" ? `${minutes} min` : `${minutes}분`;
}

function rowToArticle(row: ChannelEditorialRow, index: number, locale: Locale): ChannelArticle {
  const fallbackTag = row.tags[0] ?? (locale === "en" ? "Guide" : "가이드");
  const categoryName = row.category
    ? locale === "en"
      ? row.category.name_en
      : row.category.name_ko
    : fallbackTag;
  const bodyText = row.body ?? row.summary ?? "";
  return {
    id: row.id,
    category: categoryName,
    categorySlug: row.category?.slug,
    categoryEmoji: row.category?.emoji ?? undefined,
    title: row.title,
    summary: row.summary ?? "",
    body: row.body ?? undefined,
    readTime: estimateReadTime(`${row.summary} ${bodyText}`, locale),
    badge: row.is_featured ? (locale === "en" ? "Pick" : "추천") : index === 0 ? undefined : undefined,
    checklist: bodyText
      ? bodyText
          .split(/[.!?]\s+/)
          .filter((s) => s.length > 8)
          .slice(0, 3)
          .map((s) => s.trim())
      : [],
  };
}

function staticArticles(channel: PetChannel, locale: Locale): ChannelArticle[] {
  const base = getChannelContent(channel, locale);
  return [base.featured, ...base.articles];
}

export async function fetchChannelEditorial(channel: PetChannel, locale: Locale = "ko"): Promise<{
  articles: ChannelArticle[];
  featured: ChannelArticle;
  source: "supabase" | "static";
}> {
  const fallback = getChannelContent(channel, locale);
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return {
      articles: staticArticles(channel, locale),
      featured: fallback.featured,
      source: "static",
    };
  }

  const { data, error } = await supabase
    .from("contents")
    .select("id, title, summary, body, tags, is_featured, published_at, category:content_categories(slug, name_ko, name_en, emoji)")
    .eq("channel", channel)
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(12);

  if (error || !data?.length) {
    return {
      articles: staticArticles(channel, locale),
      featured: fallback.featured,
      source: "static",
    };
  }

  const rows = data as ChannelEditorialRow[];
  const featuredRow = rows.find((r) => r.is_featured) ?? rows[0];
  const featured = rowToArticle(featuredRow, 0, locale);
  featured.badge = locale === "en" ? "Pick" : "추천";
  const articles = rows
    .filter((r) => r.id !== featuredRow.id)
    .map((row, i) => rowToArticle(row, i, locale));

  return {
    articles,
    featured,
    source: "supabase",
  };
}

export async function fetchChannelArticle(
  channel: PetChannel,
  id: string,
  locale: Locale = "ko"
): Promise<{ article: ChannelArticle | null; channel: PetChannel; source: "supabase" | "static" }> {
  const fallback = getChannelContent(channel, locale);
  const staticAll = [fallback.featured, ...fallback.articles];
  const staticHit = staticAll.find((a) => a.id === id);

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { article: staticHit ?? null, channel, source: "static" };
  }

  const { data, error } = await supabase
    .from("contents")
    .select("id, title, summary, body, tags, is_featured, published_at, category:content_categories(slug, name_ko, name_en, emoji)")
    .eq("id", id)
    .eq("channel", channel)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    return { article: staticHit ?? null, channel, source: "static" };
  }

  const article = rowToArticle(data as ChannelEditorialRow, 0, locale);
  if ((data as ChannelEditorialRow).is_featured) article.badge = locale === "en" ? "Pick" : "추천";
  return { article, channel, source: "supabase" };
}
