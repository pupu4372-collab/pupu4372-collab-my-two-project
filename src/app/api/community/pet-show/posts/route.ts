import { createPetShowPost } from "@/lib/community/posts";
import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { isPetSpecies } from "@/lib/pets/species";
import type { PetShowSpecies } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

function isPetShowSpecies(value: unknown): value is PetShowSpecies {
  return isPetSpecies(value);
}

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
    imageUrl?: string;
    petId?: string | null;
    petSpecies?: string;
    language?: string;
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
  if (!body.imageUrl?.trim()) {
    return NextResponse.json({ error: "Image URL is required." }, { status: 400 });
  }
  if (!isPetShowSpecies(body.petSpecies)) {
    return NextResponse.json({ error: "Pet category is required." }, { status: 400 });
  }

  try {
    const post = await createPetShowPost(supabase, {
      authorId: userId,
      title: body.title,
      content: body.content,
      imageUrl: body.imageUrl,
      petId: null,
      petShowSpecies: body.petSpecies,
      language: body.language,
      tags: Array.isArray(body.tags) ? body.tags : [],
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create post.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
