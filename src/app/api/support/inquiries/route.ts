import { getBearerToken, getUserIdFromRequest } from "@/lib/supabase/auth-server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const VALID_CATEGORIES = new Set([
  "guide",
  "account",
  "payment_report",
  "community",
  "partnership",
  "general",
]);

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function GET(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("support_inquiries")
    .select("id, user_id, name, email, category, title, message, status, admin_note, created_at, updated_at, resolved_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: "Failed to load inquiries." }, { status: 500 });
  }

  return NextResponse.json({ inquiries: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  let body: {
    name?: string;
    email?: string;
    category?: string;
    title?: string;
    message?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const name = body.name?.trim() || null;
  const email = body.email?.trim().toLowerCase() ?? "";
  const category = body.category?.trim() || "general";
  const title = body.title?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!isEmail(email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }
  if (!VALID_CATEGORIES.has(category)) {
    return NextResponse.json({ error: "Invalid inquiry category." }, { status: 400 });
  }
  if (title.length < 2 || title.length > 120) {
    return NextResponse.json({ error: "Title must be 2-120 characters." }, { status: 400 });
  }
  if (message.length < 10 || message.length > 2000) {
    return NextResponse.json({ error: "Message must be 10-2000 characters." }, { status: 400 });
  }

  const token = getBearerToken(request);
  const userId = token ? await getUserIdFromRequest(request) : null;

  const { data, error } = await supabase
    .from("support_inquiries")
    .insert({
      user_id: userId,
      name,
      email,
      category,
      title,
      message,
    } as never)
    .select("id, status, created_at")
    .single();

  if (error || !data) {
    console.error("[support/inquiries] insert failed:", error?.message, error?.code);
    const missingTable = error?.code === "42P01" || error?.message?.includes("support_inquiries");
    return NextResponse.json(
      {
        error: missingTable
          ? "Support inquiry storage is not set up. Please apply migration 026_support_inquiries.sql."
          : "Failed to submit inquiry.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ inquiry: data }, { status: 201 });
}
