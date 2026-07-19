import { requireAdminResponse } from "@/lib/admin/auth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { NoticeInsert, NoticeLocale } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

const NOTICE_COLUMNS = "id, title, body, locale, is_pinned, published_at, created_at";

function parseLocale(value: unknown): NoticeLocale | null {
  if (value === "ko" || value === "en") return value;
  return null;
}

export async function GET(request: Request) {
  const gate = await requireAdminResponse(request);
  if ("response" in gate) return gate.response;

  try {
    const supabase = getSupabaseServiceRoleClient();
    const { searchParams } = new URL(request.url);
    const localeFilter = parseLocale(searchParams.get("locale"));

    let query = supabase
      .from("notices")
      .select(NOTICE_COLUMNS)
      .order("published_at", { ascending: false })
      .limit(100);

    if (localeFilter) {
      query = query.eq("locale", localeFilter);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: "Failed to load notices." }, { status: 500 });
    }

    return NextResponse.json({ notices: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Service unavailable.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const gate = await requireAdminResponse(request);
  if ("response" in gate) return gate.response;

  let body: Partial<NoticeInsert>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const noticeBody = typeof body.body === "string" ? body.body.trim() : "";
  const locale = parseLocale(body.locale);
  const isPinned = Boolean(body.is_pinned);
  const publishedAt =
    typeof body.published_at === "string" && body.published_at.trim()
      ? body.published_at.trim()
      : new Date().toISOString();

  if (!locale) {
    return NextResponse.json({ error: "locale must be ko or en." }, { status: 400 });
  }
  if (title.length < 2 || title.length > 200) {
    return NextResponse.json({ error: "Title must be 2-200 characters." }, { status: 400 });
  }
  if (noticeBody.length < 1 || noticeBody.length > 10000) {
    return NextResponse.json({ error: "Body must be 1-10000 characters." }, { status: 400 });
  }
  if (Number.isNaN(Date.parse(publishedAt))) {
    return NextResponse.json({ error: "Invalid published_at." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("notices")
      .insert({
        title,
        body: noticeBody,
        locale,
        is_pinned: isPinned,
        published_at: publishedAt,
      } as never)
      .select(NOTICE_COLUMNS)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Failed to create notice." }, { status: 500 });
    }

    return NextResponse.json({ notice: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Service unavailable.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
