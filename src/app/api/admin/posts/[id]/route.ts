import { requireAdmin } from "@/lib/admin/auth";
import { setPostHidden } from "@/lib/admin/moderation";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const adminId = await requireAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

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

  const ok = await setPostHidden(id, body.is_hidden);
  if (!ok) {
    return NextResponse.json({ error: "Failed to update post." }, { status: 500 });
  }

  return NextResponse.json({ id, is_hidden: body.is_hidden });
}
