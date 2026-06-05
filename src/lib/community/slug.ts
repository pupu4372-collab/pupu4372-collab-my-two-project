/** URL-safe slug from Korean/Latin title */
export function slugifyTitle(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (base.length >= 3) return base.slice(0, 80);

  return `post-${Date.now().toString(36)}`;
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function uniquePostSlug(
  supabase: import("@supabase/supabase-js").SupabaseClient<import("@/lib/supabase/types").Database>,
  title: string,
  excludePostId?: string
): Promise<string> {
  let slug = slugifyTitle(title);
  let attempt = 0;

  while (attempt < 20) {
    let query = supabase.from("community_posts").select("id").eq("seo_slug", slug).limit(1);
    if (excludePostId) query = query.neq("id", excludePostId);
    const { data } = await query;
    if (!data?.length) return slug;
    attempt += 1;
    slug = `${slugifyTitle(title)}-${attempt + 1}`;
  }

  return `${slugifyTitle(title)}-${crypto.randomUUID().slice(0, 8)}`;
}
