import type { SupabaseClient } from "@supabase/supabase-js";
import type { CommunityPost, Database } from "@/lib/supabase/types";

const BUCKET = "pet-show";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type Db = SupabaseClient<Database>;

export async function uploadPetShowImage(
  supabase: Db,
  userId: string,
  file: File,
  folder = userId
): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("JPEG, PNG, WebP, GIF only.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 5MB or smaller.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeFolder = folder.startsWith(userId) ? folder : userId;
  const path = `${safeFolder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export interface CreatePetShowPostInput {
  authorId: string;
  title: string;
  content?: string;
  imageUrl: string;
  petId?: string | null;
  language?: string;
}

export async function createPetShowPost(
  supabase: Db,
  input: CreatePetShowPostInput
): Promise<CommunityPost> {
  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      author_id: input.authorId,
      pet_id: input.petId ?? null,
      channel: "community",
      post_type: "photo_show",
      title: input.title.trim(),
      content: input.content?.trim() || null,
      image_urls: [input.imageUrl],
      tags: ["pet-show"],
      language: input.language ?? "ko",
    } as never)
    .select(
      "id, author_id, pet_id, channel, post_type, title, content, image_urls, tags, language, like_count, comment_count, view_count, is_hidden, is_pinned, created_at, updated_at"
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create post.");
  }

  return data as CommunityPost;
}

export async function togglePostLike(
  supabase: Db,
  postId: string,
  userId: string
): Promise<{ liked: boolean; like_count: number }> {
  const { data: existing } = await supabase
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase.from("post_likes").delete().eq("id", (existing as { id: string }).id);
  } else {
    await supabase.from("post_likes").insert({ post_id: postId, user_id: userId } as never);
  }

  const { data: post } = await supabase
    .from("community_posts")
    .select("like_count")
    .eq("id", postId)
    .single();

  return {
    liked: !existing,
    like_count: (post as { like_count: number } | null)?.like_count ?? 0,
  };
}
