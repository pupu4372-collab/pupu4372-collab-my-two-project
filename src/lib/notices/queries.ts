import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Notice, NoticeLocale } from "@/lib/supabase/types";

const NOTICE_COLUMNS =
  "id, title, body, locale, is_pinned, show_home_banner, published_at, created_at";

function asLocale(value: string): NoticeLocale {
  return value === "en" ? "en" : "ko";
}

/** Published notices for a locale (guest-readable). Newest first. */
export async function fetchPublishedNotices(
  locale: string,
  limit = 30,
): Promise<Notice[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("notices")
    .select(NOTICE_COLUMNS)
    .eq("locale", asLocale(locale))
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[notices] fetchPublishedNotices:", error.message);
    return [];
  }

  return (data ?? []) as Notice[];
}

/** Pinned published notices for community hub (max 3). */
export async function fetchPinnedNotices(locale: string, limit = 3): Promise<Notice[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("notices")
    .select(NOTICE_COLUMNS)
    .eq("locale", asLocale(locale))
    .eq("is_pinned", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[notices] fetchPinnedNotices:", error.message);
    return [];
  }

  return (data ?? []) as Notice[];
}

/** Latest published home-banner notice for a locale (0–1). */
export async function fetchHomeBannerNotice(locale: string): Promise<Notice | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("notices")
    .select(NOTICE_COLUMNS)
    .eq("locale", asLocale(locale))
    .eq("show_home_banner", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("[notices] fetchHomeBannerNotice:", error.message);
    return null;
  }

  return ((data ?? [])[0] as Notice | undefined) ?? null;
}

export async function fetchPublishedNoticeById(
  id: string,
  locale: string,
): Promise<Notice | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("notices")
    .select(NOTICE_COLUMNS)
    .eq("id", id)
    .eq("locale", asLocale(locale))
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error("[notices] fetchPublishedNoticeById:", error.message);
    return null;
  }

  return (data as Notice | null) ?? null;
}

export function formatNoticeDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
