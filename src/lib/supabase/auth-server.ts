import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { getMembershipGrade, isFullMember } from "@/lib/auth/identity";

export { isFullMember, getMembershipGrade } from "@/lib/auth/identity";
export type { MembershipGrade } from "@/lib/auth/identity";

/**
 * Any authenticated Supabase user id, including `anonymous` grade.
 * Passes: anonymous | email_linked | full_member.
 * Rejects: missing/invalid Bearer.
 */
export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const supabase = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) return null;
  return user.id;
}

/**
 * Full-member user id only (`getMembershipGrade === "full_member"`).
 * Passes: full_member.
 * Rejects: anonymous, email_linked, missing/invalid Bearer.
 * (Former “registered / guest-grade” gate — email-only sessions stay null.)
 */
export async function getRegisteredUserIdFromRequest(
  request: Request
): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const supabase = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user || getMembershipGrade(user) !== "full_member") return null;
  return user.id;
}

export function createUserSupabaseClient(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

export function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

/**
 * Non-anonymous user id (`email_linked` | `full_member`).
 * Passes: email_linked, full_member.
 * Rejects: anonymous, missing/invalid Bearer.
 * Prefer for owner-scoped payment / account APIs that allow email-linked guests.
 */
export async function getNonAnonymousUserIdFromRequest(
  request: Request
): Promise<string | null> {
  const token = getBearerToken(request);
  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const supabase = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user || getMembershipGrade(user) === "anonymous") return null;
  return user.id;
}
