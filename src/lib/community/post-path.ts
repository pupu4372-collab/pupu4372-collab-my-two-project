import type { CommunityBoardKind } from "./qa-feed";
import type { CommunityPost } from "@/lib/supabase/types";

export function communityPostPath(board: CommunityBoardKind, post: Pick<CommunityPost, "id" | "seo_slug">) {
  return `/community/${board}/${post.seo_slug ?? post.id}`;
}
