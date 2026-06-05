import type { CommunityBoardKind } from "./qa-feed";
import type { CommunityPost } from "@/lib/supabase/types";

export function communityPostPath(board: CommunityBoardKind, post: Pick<CommunityPost, "id">) {
  return `/community/${board}/${post.id}`;
}
