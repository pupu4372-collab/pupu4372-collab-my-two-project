import { fetchPetShowFeed } from "@/lib/community/feed";
import { isPetSpecies } from "@/lib/pets/species";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const tags = searchParams.getAll("tag").filter(Boolean);
  const speciesParam = searchParams.get("species");
  const species = isPetSpecies(speciesParam) ? speciesParam : undefined;

  const photoCategoryParam = searchParams.get("photoCategory");
  const photoCategory =
    photoCategoryParam === "funny" ? "funny" : photoCategoryParam === "cute" ? "cute" : undefined;

  const page = await fetchPetShowFeed(cursor, {
    tags: tags.length > 0 ? tags : undefined,
    species,
    photoCategory,
  });

  return NextResponse.json({
    posts: page.posts,
    nextCursor: page.nextCursor,
    source: page.source,
  });
}
