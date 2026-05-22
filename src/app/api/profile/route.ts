import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import type { Profile } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

function isValidTimezone(value: string): boolean {
  if (!COMMON_TIMEZONES.includes(value as (typeof COMMON_TIMEZONES)[number])) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!userId || !token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, locale, timezone, provider, role, created_at, updated_at")
    .eq("id", userId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: profile as Profile });
}

export async function PATCH(request: Request) {
  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!userId || !token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: { displayName?: string; locale?: string; timezone?: string; avatarUrl?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const displayName = body.displayName?.trim();
  if (!displayName || displayName.length < 2 || displayName.length > 32) {
    return NextResponse.json({ error: "Display name must be 2-32 characters." }, { status: 400 });
  }

  const locale = body.locale === "en" ? "en" : "ko";
  const timezone = body.timezone ?? "Asia/Seoul";
  if (!isValidTimezone(timezone)) {
    return NextResponse.json({ error: "Invalid timezone." }, { status: 400 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  const updatePayload: {
    display_name: string;
    locale: string;
    timezone: string;
    avatar_url?: string | null;
  } = {
    display_name: displayName,
    locale,
    timezone,
  };

  if ("avatarUrl" in body) {
    updatePayload.avatar_url = body.avatarUrl ?? null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(updatePayload as never)
    .eq("id", userId)
    .select("id, display_name, avatar_url, locale, timezone, provider, role, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: profile as Profile });
}
