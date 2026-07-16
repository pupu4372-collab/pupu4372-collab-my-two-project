import { requireAdminResponse } from "@/lib/admin/auth";
import { deletePostByAdmin, setPostHidden } from "@/lib/admin/moderation";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const gate = await requireAdminResponse(request);
  if ("response" in gate) return gate.response;

  const { id } = await params;
  let body: { is_hidden?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (typeof body.is_hidden !== "boolean") {
    return NextResponse.json({ error: "is_hidden boolean required." }, { status: 400 });
  }

  try {
    const ok = await setPostHidden(id, body.is_hidden);
    if (!ok) {
      return NextResponse.json({ error: "Failed to update post." }, { status: 500 });
    }
    return NextResponse.json({ id, is_hidden: body.is_hidden });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Service unavailable.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const gate = await requireAdminResponse(request);
  if ("response" in gate) return gate.response;

  const { id } = await params;
  try {
    const ok = await deletePostByAdmin(id);
    if (!ok) {
      return NextResponse.json({ error: "Failed to delete post." }, { status: 500 });
    }
    return NextResponse.json({ id, deleted: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Service unavailable.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
