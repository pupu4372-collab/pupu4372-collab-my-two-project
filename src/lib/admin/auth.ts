import { getUserIdFromRequest } from "@/lib/supabase/auth-server";
import { createSupabaseServerClient, getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

/** Thrown when SUPABASE_SERVICE_ROLE_KEY is missing — admin APIs should respond 503. */
export class AdminServiceUnavailableError extends Error {
  constructor(message = "SUPABASE_SERVICE_ROLE_KEY is required") {
    super(message);
    this.name = "AdminServiceUnavailableError";
  }
}

function serviceRoleOrThrow() {
  try {
    return getSupabaseServiceRoleClient();
  } catch (err) {
    throw new AdminServiceUnavailableError(
      err instanceof Error ? err.message : "SUPABASE_SERVICE_ROLE_KEY is required"
    );
  }
}

/**
 * API Bearer gate: returns admin user id, or null if not admin / not logged in.
 * Throws AdminServiceUnavailableError when service role key is missing.
 */
export async function requireAdmin(request: Request): Promise<string | null> {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return null;

  const supabase = serviceRoleOrThrow();

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || (data as { role?: string } | null)?.role !== "admin") return null;
  return userId;
}

/** requireAdmin + 403/503 NextResponse for route handlers. */
export async function requireAdminResponse(
  request: Request
): Promise<{ adminId: string } | { response: NextResponse }> {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) {
      return {
        response: NextResponse.json({ error: "Admin access required." }, { status: 403 }),
      };
    }
    return { adminId };
  } catch (err) {
    if (err instanceof AdminServiceUnavailableError) {
      return {
        response: NextResponse.json({ error: "Admin service unavailable." }, { status: 503 }),
      };
    }
    throw err;
  }
}

/**
 * Server Component / layout gate for `/[locale]/admin/*`.
 * Uses cookie session (`createSupabaseServerClient`) + profiles.role via service role.
 * Non-admin → notFound() (hides that admin routes exist).
 */
export async function assertAdminPageAccess(): Promise<string> {
  const cookieClient = await createSupabaseServerClient();
  if (!cookieClient) notFound();

  const {
    data: { user },
    error,
  } = await cookieClient.auth.getUser();
  if (error || !user || user.is_anonymous) notFound();

  let supabase;
  try {
    supabase = getSupabaseServiceRoleClient();
  } catch {
    notFound();
  }

  const { data, error: roleError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (roleError || (data as { role?: string } | null)?.role !== "admin") {
    notFound();
  }

  return user.id;
}
