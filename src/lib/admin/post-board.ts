import type { CommunityPost } from "@/lib/supabase/types";

export type AdminPostBoardFilter = "all" | "pet-show" | "qa" | "tips" | "free" | "experience";

export function isAdminPostBoardFilter(value: string | null): value is AdminPostBoardFilter {
  return (
    value === "all" ||
    value === "pet-show" ||
    value === "qa" ||
    value === "tips" ||
    value === "free" ||
    value === "experience"
  );
}

export function getAdminPostBoardLabel(post: CommunityPost): string {
  if (post.post_type === "photo_show") return "우리아이 자랑";
  if (post.post_type === "qa") return "Q&A";
  if (post.tags.includes("tips")) return "꿀팁";
  if (post.tags.includes("experience")) return "품종별 경험담";
  if (post.tags.includes("free")) return "자유게시판";
  return post.post_type;
}

export function getAdminPostHref(post: CommunityPost): string | null {
  if (post.post_type === "photo_show") return `/community/pet-show/${post.id}`;
  if (post.post_type === "qa") return `/community/qa/${post.id}`;
  if (post.tags.includes("tips")) return `/community/tips/${post.id}`;
  if (post.tags.includes("experience")) return `/community/experience/${post.id}`;
  if (post.tags.includes("free")) return `/community/free/${post.id}`;
  return null;
}
