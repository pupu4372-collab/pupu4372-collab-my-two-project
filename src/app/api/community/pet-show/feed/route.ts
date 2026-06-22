import { fetchPetShowFeed } from "@/lib/community/feed";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const tags = searchParams.getAll("tag").filter(Boolean);

  const page = await fetchPetShowFeed(cursor, tags.length > 0 ? tags : undefined);

  return NextResponse.json({
    posts: page.posts,
    nextCursor: page.nextCursor,
    source: page.source,
  });
}
