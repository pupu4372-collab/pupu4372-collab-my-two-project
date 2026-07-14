import type { User } from "@supabase/supabase-js";

/**
 * Full member = password-bearing account or OAuth (google/kakao).
 * Email-linked guests (is_anonymous=false but no has_password) stay guest-grade.
 * Shared by server auth helpers and client session UX.
 */
export function isFullMember(user: User): boolean {
  if (user.is_anonymous) return false;
  if (user.app_metadata?.has_password === true) return true;
  const providers =
    (user.app_metadata?.providers as string[] | undefined) ??
    user.identities?.map((i) => i.provider) ??
    [];
  return providers.some((p) => p === "google" || p === "kakao");
}
