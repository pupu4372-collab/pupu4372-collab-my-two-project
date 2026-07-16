/**
 * @deprecated Import from `@/lib/auth/identity` for new code.
 * Re-exports kept so existing `@/lib/supabase/membership` imports stay stable.
 */
export {
  getMembershipGrade,
  isFullMember,
  type MembershipGrade,
} from "@/lib/auth/identity";
