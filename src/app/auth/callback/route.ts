import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getSafeNext(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  if (value === "/ko" || value === "/en") return "/";
  if (value.startsWith("/ko/")) return value.replace(/^\/ko/, "") || "/";
  if (value.startsWith("/en")) return "/";
  if (value === "/profile") return "/";
  return value;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorDescription = searchParams.get("error_description") ?? searchParams.get("error");
  const loginUrl = `${origin}/login`;

  if (errorDescription) {
    return NextResponse.redirect(
      `${loginUrl}?error=${encodeURIComponent(errorDescription)}`
    );
  }

  const cookieStore = await cookies();
  const storedNext = cookieStore.get("auth_oauth_next")?.value;
  const next = getSafeNext(searchParams.get("next") ?? storedNext ?? "/");

  const response = (url: string) => {
    const redirect = NextResponse.redirect(url);
    redirect.cookies.set("auth_oauth_next", "", { path: "/", maxAge: 0 });
    return redirect;
  };

  if (!code) {
    return response(`${loginUrl}?error=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return response(`${loginUrl}?error=supabase_not_configured`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return response(`${loginUrl}?error=${encodeURIComponent(error.message)}`);
  }

  return response(`${origin}${next}`);
}
