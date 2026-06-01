import { createUserSupabaseClient, getBearerToken, getUserIdFromRequest } from "@/lib/supabase/auth-server";
import type { CommunityPost } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

type EditableBoard = "free" | "tips" | "experience";

const POST_SELECT =
  "id, author_id, pet_id, channel, post_type, title, content, image_urls, tags, language, like_count, comment_count, view_count, is_hidden, is_pinned, created_at, updated_at";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function boardTag(board: EditableBoard) {
  return board;
}

async function requirePostOwner(request: Request, id: string, board: EditableBoard) {
  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!userId || !token) {
    return { error: NextResponse.json({ error: "Login required." }, { status: 401 }) };
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return { error: NextResponse.json({ error: "Supabase not configured." }, { status: 503 }) };
  }

  const { data: post, error } = await supabase
    .from("community_posts")
    .select("id, author_id")
    .eq("id", id)
    .eq("post_type", "free")
    .contains("tags", [boardTag(board)])
    .eq("is_hidden", false)
    .maybeSingle();

  if (error) {
    return { error: NextResponse.json({ error: error.message }, { status: 500 }) };
  }
  if (!post) {
    return { error: NextResponse.json({ error: "Post not found." }, { status: 404 }) };
  }
  if ((post as { author_id: string }).author_id !== userId) {
    return { error: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
  }

  return { supabase, userId };
}

export function createCommunityPostHandlers(board: EditableBoard) {
  return {
    async PATCH(request: Request, { params }: RouteContext) {
      const { id } = await params;
      const auth = await requirePostOwner(request, id, board);
      if (auth.error) return auth.error;

      let body: { title?: string; content?: string };
      try {
        body = await request.json();
      } catch {
        return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
      }

      const title = body.title?.trim();
      const content = body.content?.trim();
      if (!title) {
        return NextResponse.json({ error: "Title is required." }, { status: 400 });
      }
      if (!content || content.length < 10) {
        return NextResponse.json({ error: "Content must be at least 10 characters." }, { status: 400 });
      }

      const { data, error } = await auth.supabase
        .from("community_posts")
        .update({ title, content } as never)
        .eq("id", id)
        .eq("author_id", auth.userId)
        .eq("post_type", "free")
        .select(POST_SELECT)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: error?.message ?? "Failed to update post." }, { status: 500 });
      }

      return NextResponse.json({ post: data as CommunityPost });
    },

    async DELETE(request: Request, { params }: RouteContext) {
      const { id } = await params;
      const auth = await requirePostOwner(request, id, board);
      if (auth.error) return auth.error;

      const { error } = await auth.supabase
        .from("community_posts")
        .delete()
        .eq("id", id)
        .eq("author_id", auth.userId)
        .eq("post_type", "free");

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    },
  };
}
