import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ posts: [] });
  }

  const { data, error } = await supabase
    .from("challenge_posts")
    .select("*, profiles(display_name, avatar_url), pets(name, species)")
    .eq("challenge_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data ?? [] });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const token = getBearerToken(request);
  const userClient = token ? createUserSupabaseClient(token) : null;
  if (!userClient) {
    return NextResponse.json({ error: "Auth error." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { data, error } = await userClient
    .from("challenge_posts")
    .insert({
      challenge_id: id,
      user_id: userId,
      pet_id: body.pet_id ?? null,
      content: body.content ?? null,
      image_url: body.image_url ?? null,
      category: body.category === "funny" ? "funny" : "cute",
    } as never)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}
