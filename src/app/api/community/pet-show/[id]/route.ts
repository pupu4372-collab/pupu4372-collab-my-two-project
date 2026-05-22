import { fetchPetShowComments, fetchPetShowPost } from "@/lib/community/pet-show-detail";
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
