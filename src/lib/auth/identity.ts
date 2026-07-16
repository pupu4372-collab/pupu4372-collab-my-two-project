/**
 * Membership / identity grades for K-Saju Pet + Human Premium.
 *
 * ## Three-grade model
 * Every visitor has a Supabase `userId` (including anonymous sessions).
 * Grade is independent of whether an email string exists on an order:
 *
 * - `anonymous` — Supabase anon session (`user.is_anonymous === true`)
 * - `email_linked` — `is_anonymous === false`, but not a full member
 *   (email attached via `updateUser({ email })`, no password / no OAuth)
 * - `full_member` — password account (`app_metadata.has_password`) or
 *   Google/Kakao OAuth
 *
 * ## Orders vs contact
 * The owner of a paid human-premium order is `user_id` when set (full members
 * on cart checkout). Email on the order row is a **contact / delivery** field,
 * not identity. Guest carts keep `user_id` null and rely on email + tokens.
 *
 * Do not invent a fourth grade. Prefer `getMembershipGrade` over ad-hoc
 * `is_anonymous` / email checks when adding new gates.
 */
import type { User } from "@supabase/supabase-js";

export type MembershipGrade = "anonymous" | "email_linked" | "full_member";

function hasOAuthIdentity(user: User): boolean {
  const providers =
    (user.app_metadata?.providers as string[] | undefined) ??
    user.identities?.map((i) => i.provider) ??
    [];
  return providers.some((p) => p === "google" || p === "kakao");
}

/**
 * Single source of truth for membership grade.
 *
 * `email_linked` = non-anonymous and not full member (same split the codebase
 * already described in `isFullMember` comments: email without password/OAuth).
 */
export function getMembershipGrade(user: User): MembershipGrade {
  if (user.is_anonymous) return "anonymous";
  if (user.app_metadata?.has_password === true) return "full_member";
  if (hasOAuthIdentity(user)) return "full_member";
  return "email_linked";
}

/**
 * Full member = password-bearing account or OAuth (google/kakao).
 * Email-linked guests (`email_linked` grade) stay guest-grade.
 */
export function isFullMember(user: User): boolean {
  return getMembershipGrade(user) === "full_member";
}
