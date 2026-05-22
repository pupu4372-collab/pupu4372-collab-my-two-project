import { fetchPetShowFeed } from "@/lib/community/feed";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");

  const page = await fetchPetShowFeed(cursor);

  return NextResponse.json({
    posts: page.posts,
    nextCursor: page.nextCursor,
    source: page.source,
  });
}
