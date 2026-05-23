import { fetchQaFeed } from "@/lib/community/qa-feed";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = await fetchQaFeed(
    {
      cursor: searchParams.get("cursor"),
      q: searchParams.get("q"),
      tag: searchParams.get("tag"),
    },
    "free"
  );
  return NextResponse.json(page);
}
