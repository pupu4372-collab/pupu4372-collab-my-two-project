import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdmin(request: Request): Promise<string | null> {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return null;

  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || (data as { role?: string } | null)?.role !== "admin") return null;
  return userId;
}

export function getAdminSupabaseFromRequest(request: Request) {
  const token = getBearerToken(request);
  if (!token) return null;
  return createUserSupabaseClient(token) ?? getSupabaseServerClient();
}
