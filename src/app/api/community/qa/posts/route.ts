import { createQaPost } from "@/lib/community/qa-feed";
import {
  isValidBoardCategory,
  isPetAnimalType,
} from "@/lib/community/board-categories";
import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!userId || !token) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  let body: {
    title?: string;
    content?: string;
    language?: string;
    animalType?: string;
    category?: string;
    tags?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  if (!body.content?.trim() || body.content.trim().length < 10) {
    return NextResponse.json({ error: "Content must be at least 10 characters." }, { status: 400 });
  }
  if (!isPetAnimalType(body.animalType)) {
    return NextResponse.json({ error: "Animal category is required." }, { status: 400 });
  }
  if (!body.category?.trim() || !isValidBoardCategory("qa", body.animalType, body.category)) {
    return NextResponse.json({ error: "Topic category is required." }, { status: 400 });
  }

  const subTags = (body.tags ?? []).filter((tag) => tag && tag !== body.animalType);

  try {
    const post = await createQaPost(supabase, {
      authorId: userId,
      title: body.title,
      content: body.content,
      language: body.language,
      animalType: body.animalType,
      category: body.category,
      tags: subTags.length ? subTags : undefined,
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create post.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
