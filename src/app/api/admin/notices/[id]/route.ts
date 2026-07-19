import { requireAdminResponse } from "@/lib/admin/auth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { NoticeLocale } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

const NOTICE_COLUMNS =
  "id, title, body, locale, is_pinned, show_home_banner, published_at, created_at";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function parseLocale(value: unknown): NoticeLocale | null {
  if (value === "ko" || value === "en") return value;
  return null;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const gate = await requireAdminResponse(request);
  if ("response" in gate) return gate.response;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing notice id." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  if ("title" in body) {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (title.length < 2 || title.length > 200) {
      return NextResponse.json({ error: "Title must be 2-200 characters." }, { status: 400 });
    }
    patch.title = title;
  }

  if ("body" in body) {
    const noticeBody = typeof body.body === "string" ? body.body.trim() : "";
    if (noticeBody.length < 1 || noticeBody.length > 10000) {
      return NextResponse.json({ error: "Body must be 1-10000 characters." }, { status: 400 });
    }
    patch.body = noticeBody;
  }

  if ("locale" in body) {
    const locale = parseLocale(body.locale);
    if (!locale) {
      return NextResponse.json({ error: "locale must be ko or en." }, { status: 400 });
    }
    patch.locale = locale;
  }

  if ("is_pinned" in body) {
    patch.is_pinned = Boolean(body.is_pinned);
  }

  if ("show_home_banner" in body) {
    patch.show_home_banner = Boolean(body.show_home_banner);
  }

  if ("published_at" in body) {
    const publishedAt = typeof body.published_at === "string" ? body.published_at.trim() : "";
    if (!publishedAt || Number.isNaN(Date.parse(publishedAt))) {
      return NextResponse.json({ error: "Invalid published_at." }, { status: 400 });
    }
    patch.published_at = publishedAt;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("notices")
      .update(patch as never)
      .eq("id", id)
      .select(NOTICE_COLUMNS)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Notice not found." }, { status: 404 });
    }

    return NextResponse.json({ notice: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Service unavailable.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const gate = await requireAdminResponse(request);
  if ("response" in gate) return gate.response;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing notice id." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServiceRoleClient();
    const { error, count } = await supabase
      .from("notices")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!count) {
      return NextResponse.json({ error: "Notice not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Service unavailable.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
