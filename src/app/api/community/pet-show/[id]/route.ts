import { fetchPetShowComments, fetchPetShowPost } from "@/lib/community/pet-show-detail";
import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const [post, comments] = await Promise.all([fetchPetShowPost(id), fetchPetShowComments(id)]);

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  return NextResponse.json({ post, comments });
}

function storagePathFromPublicUrl(imageUrl: string): string | null {
  const marker = "/storage/v1/object/public/pet-show/";
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex < 0) return null;
  return decodeURIComponent(imageUrl.slice(markerIndex + marker.length).split("?")[0] ?? "");
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!userId || !token) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  const { data: post, error: readError } = await supabase
    .from("community_posts")
    .select("id, author_id, image_urls")
    .eq("id", id)
    .eq("post_type", "photo_show")
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 500 });
  }
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }
  if ((post as { author_id: string }).author_id !== userId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { error: deleteError } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", id)
    .eq("author_id", userId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const imagePaths = ((post as { image_urls?: string[] }).image_urls ?? [])
    .map(storagePathFromPublicUrl)
    .filter((path): path is string => Boolean(path));

  if (imagePaths.length > 0) {
    await supabase.storage.from("pet-show").remove(imagePaths);
  }

  return NextResponse.json({ ok: true });
}
