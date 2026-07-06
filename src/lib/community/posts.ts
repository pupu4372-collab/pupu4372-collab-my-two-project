import type { SupabaseClient } from "@supabase/supabase-js";
import { COMMUNITY_POST_SELECT } from "@/lib/community/post-select";
import type { CommunityPost, Database, PetShowSpecies } from "@/lib/supabase/types";

const BUCKET = "pet-show";
const MAX_BYTES = 1 * 1024 * 1024;
const ALLOWED_TYPES = ["image/webp"];

type Db = SupabaseClient<Database>;

export async function uploadPetShowImage(
  supabase: Db,
  userId: string,
  file: File,
  folder = userId
): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("WebP only.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 1MB or smaller.");
  }

  const ext = "webp";
  const safeFolder = folder.startsWith(userId) ? folder : userId;
  const path = `${safeFolder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    cacheControl: "31536000",
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
  petShowSpecies: PetShowSpecies;
  language?: string;
  tags?: string[];
}

async function getVisibleCountryCode(supabase: Db, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("country_code, show_country")
    .eq("id", userId)
    .maybeSingle();

  const profile = data as { country_code?: string | null; show_country?: boolean | null } | null;
  return profile?.show_country === false ? null : profile?.country_code ?? null;
}

export async function createPetShowPost(
  supabase: Db,
  input: CreatePetShowPostInput
): Promise<CommunityPost> {
  const countryCode = await getVisibleCountryCode(supabase, input.authorId);
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
      tags: [
        "pet-show",
        `pet-show:${input.petShowSpecies}`,
        ...(Array.isArray(input.tags) ? input.tags : []),
      ],
      language: input.language ?? "ko",
      country_code: countryCode,
    } as never)
    .select(COMMUNITY_POST_SELECT)
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
  const { data: existing, error: readError } = await supabase
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }

  if (existing) {
    const { error: deleteError } = await supabase
      .from("post_likes")
      .delete()
      .eq("id", (existing as { id: string }).id);
    if (deleteError) {
      throw new Error(deleteError.message);
    }
  } else {
    const { error: insertError } = await supabase
      .from("post_likes")
      .insert({ post_id: postId, user_id: userId } as never);
    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  const { data: post, error: postError } = await supabase
    .from("community_posts")
    .select("like_count")
    .eq("id", postId)
    .single();

  if (postError) {
    throw new Error(postError.message);
  }

  return {
    liked: !existing,
    like_count: (post as { like_count: number } | null)?.like_count ?? 0,
  };
}
