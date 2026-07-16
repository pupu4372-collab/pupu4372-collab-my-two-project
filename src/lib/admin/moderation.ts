import {
  getAdminPostHref,
  type AdminPostBoardFilter,
  isAdminPostBoardFilter,
} from "@/lib/admin/post-board";
import { COMMUNITY_POST_SELECT } from "@/lib/community/post-select";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import type { CommunityPost, PostComment, PostReport, ReportStatus } from "@/lib/supabase/types";

export type { AdminPostBoardFilter } from "@/lib/admin/post-board";
export { getAdminPostBoardLabel, getAdminPostHref, isAdminPostBoardFilter } from "@/lib/admin/post-board";

const POST_SELECT = COMMUNITY_POST_SELECT;

export interface AdminPostRow extends CommunityPost {
  author_name?: string;
}

export interface AdminReportRow extends PostReport {
  reporter_name?: string;
  post?: CommunityPost | null;
  comment?: PostComment | null;
  target_author_name?: string;
  target_href?: string | null;
}

export async function fetchAdminRecentPosts(limit = 30, board: AdminPostBoardFilter = "all"): Promise<{
  posts: AdminPostRow[];
  source: "supabase";
}> {
  const supabase = getSupabaseServiceRoleClient();

  let query = supabase
    .from("community_posts")
    .select(POST_SELECT);

  if (board === "pet-show") {
    query = query.eq("post_type", "photo_show");
  } else if (board === "qa") {
    query = query.eq("post_type", "qa");
  } else if (board === "tips") {
    query = query.contains("tags", ["tips"]);
  } else if (board === "experience") {
    query = query.contains("tags", ["experience"]);
  } else if (board === "free") {
    query = query.contains("tags", ["free"]);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) {
    return { posts: [], source: "supabase" };
  }

  const posts = data as CommunityPost[];
  const authorIds = [...new Set(posts.map((p) => p.author_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", authorIds);

  const nameById = new Map(
    (profiles ?? []).map((p) => [(p as { id: string }).id, (p as { display_name: string }).display_name])
  );

  return {
    posts: posts.map((post) => ({
      ...post,
      author_name: nameById.get(post.author_id) ?? "집사",
    })),
    source: "supabase",
  };
}

export async function setPostHidden(postId: string, hidden: boolean): Promise<boolean> {
  const supabase = getSupabaseServiceRoleClient();

  const { error } = await supabase
    .from("community_posts")
    .update({ is_hidden: hidden } as never)
    .eq("id", postId);

  return !error;
}

export async function deletePostByAdmin(postId: string): Promise<boolean> {
  const supabase = getSupabaseServiceRoleClient();

  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", postId);

  return !error;
}

function resolvePostHref(post: CommunityPost | null | undefined) {
  if (!post) return null;
  return getAdminPostHref(post);
}

export async function fetchAdminReports(limit = 40): Promise<{
  reports: AdminReportRow[];
  source: "supabase";
}> {
  const supabase = getSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .from("post_reports")
    .select("id, post_id, comment_id, reporter_id, reason, detail, status, created_at, resolved_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) {
    return { reports: [], source: "supabase" };
  }

  const reports = data as PostReport[];
  const postIds = new Set<string>();
  const commentIds = reports.map((report) => report.comment_id).filter(Boolean) as string[];
  const reporterIds = reports.map((report) => report.reporter_id).filter(Boolean) as string[];

  reports.forEach((report) => {
    if (report.post_id) postIds.add(report.post_id);
  });

  const { data: comments } = commentIds.length
    ? await supabase
        .from("post_comments")
        .select("id, post_id, author_id, parent_id, content, is_hidden, created_at, updated_at")
        .in("id", commentIds)
    : { data: [] };

  const commentRows = (comments ?? []) as PostComment[];
  commentRows.forEach((comment) => postIds.add(comment.post_id));

  const { data: posts } = postIds.size
    ? await supabase.from("community_posts").select(POST_SELECT).in("id", [...postIds])
    : { data: [] };

  const postRows = (posts ?? []) as CommunityPost[];
  const profileIds = new Set<string>(reporterIds);
  postRows.forEach((post) => profileIds.add(post.author_id));
  commentRows.forEach((comment) => profileIds.add(comment.author_id));

  const { data: profiles } = profileIds.size
    ? await supabase.from("profiles").select("id, display_name").in("id", [...profileIds])
    : { data: [] };

  const nameById = new Map(
    (profiles ?? []).map((p) => [(p as { id: string }).id, (p as { display_name: string }).display_name])
  );
  const postById = new Map(postRows.map((post) => [post.id, post]));
  const commentById = new Map(commentRows.map((comment) => [comment.id, comment]));

  return {
    reports: reports.map((report) => {
      const comment = report.comment_id ? commentById.get(report.comment_id) ?? null : null;
      const post = report.post_id
        ? postById.get(report.post_id) ?? null
        : comment
          ? postById.get(comment.post_id) ?? null
          : null;
      const targetAuthorId = comment?.author_id ?? post?.author_id;

      return {
        ...report,
        reporter_name: report.reporter_id ? nameById.get(report.reporter_id) ?? "집사" : "알 수 없음",
        post,
        comment,
        target_author_name: targetAuthorId ? nameById.get(targetAuthorId) ?? "집사" : undefined,
        target_href: resolvePostHref(post),
      };
    }),
    source: "supabase",
  };
}

export async function setCommentHidden(commentId: string, hidden: boolean): Promise<boolean> {
  const supabase = getSupabaseServiceRoleClient();

  const { error } = await supabase
    .from("post_comments")
    .update({ is_hidden: hidden } as never)
    .eq("id", commentId);

  return !error;
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus
): Promise<boolean> {
  const supabase = getSupabaseServiceRoleClient();

  const patch: Partial<PostReport> = {
    status,
    resolved_at: status === "resolved" || status === "rejected" ? new Date().toISOString() : null,
  };

  const { error } = await supabase
    .from("post_reports")
    .update(patch as never)
    .eq("id", reportId);

  return !error;
}
