import { createClient } from "@supabase/supabase-js";
import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

/**
 * After the client successfully calls updateUser({ password }), record
 * app_metadata.has_password via service role so isFullMember becomes true.
 * Verifies the password with signInWithPassword before writing the flag.
 */
export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);
  if (!userId || !token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < 10 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return NextResponse.json(
      { error: "Password must be at least 10 characters and include letters and numbers." },
      { status: 400 }
    );
  }

  const userClient = createUserSupabaseClient(token);
  if (!userClient) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser(token);
  if (userError || !user?.email) {
    return NextResponse.json(
      { error: "An email must be linked before setting a password." },
      { status: 400 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) {
    return NextResponse.json({ error: "Supabase admin is not configured." }, { status: 503 });
  }

  const verifyClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: verifyError } = await verifyClient.auth.signInWithPassword({
    email: user.email,
    password,
  });
  if (verifyError) {
    return NextResponse.json(
      { error: "Password verification failed." },
      { status: 400 }
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: updated, error: updateError } = await admin.auth.admin.updateUserById(
    userId,
    {
      app_metadata: {
        ...((user.app_metadata as Record<string, unknown> | undefined) ?? {}),
        has_password: true,
      },
    }
  );

  if (updateError || !updated.user) {
    return NextResponse.json(
      { error: updateError?.message ?? "Could not update membership flag." },
      { status: 500 }
    );
  }

  const { tryGrantLaunchDailyLuckyCoupon } = await import("@/lib/coupons/coupons");
  await tryGrantLaunchDailyLuckyCoupon(userId);

  return NextResponse.json({
    ok: true,
    has_password: updated.user.app_metadata?.has_password === true,
  });
}
