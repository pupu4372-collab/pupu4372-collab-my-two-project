import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel");

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ challenges: [] });
  }

  let query = supabase
    .from("challenges")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (channel && ["dog", "cat", "reptile"].includes(channel)) {
    query = query.or(`channel.eq.${channel},channel.eq.all`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ challenges: data ?? [] });
}
