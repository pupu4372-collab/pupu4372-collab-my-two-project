import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { isPetCareCategory } from "@/lib/pet-care/categories";
import type { PetCareEvent } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

function isDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

interface EventRouteContext {
  params: Promise<{ id: string; eventId: string }>;
}

export async function PATCH(request: Request, context: EventRouteContext) {
  const ownerId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);
  if (!ownerId || !token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id: petId, eventId } = await context.params;

  let body: {
    eventDate?: string;
    category?: string;
    title?: string;
    memo?: string | null;
    weightKg?: number | string | null;
    isDone?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.eventDate !== undefined) {
    if (!isDate(body.eventDate)) {
      return NextResponse.json({ error: "Invalid eventDate." }, { status: 400 });
    }
    patch.event_date = body.eventDate;
  }
  if (body.category !== undefined) {
    if (!isPetCareCategory(body.category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }
    patch.category = body.category;
  }
  if (body.title !== undefined) {
    const title = body.title.trim();
    if (!title) {
      return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
    }
    patch.title = title;
  }
  if (body.memo !== undefined) {
    patch.memo = body.memo?.trim() || null;
  }
  if (body.weightKg !== undefined) {
    if (body.weightKg == null || body.weightKg === "") {
      patch.weight_kg = null;
    } else {
      const parsed = typeof body.weightKg === "number" ? body.weightKg : Number(body.weightKg);
      if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 999) {
        return NextResponse.json({ error: "Invalid weight." }, { status: 400 });
      }
      patch.weight_kg = Math.round(parsed * 100) / 100;
    }
  }
  if (body.isDone !== undefined) {
    patch.is_done = body.isDone === true;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("pet_care_events")
    .update(patch as never)
    .eq("id", eventId)
    .eq("pet_id", petId)
    .eq("owner_id", ownerId)
    .select(
      "id, pet_id, owner_id, event_date, category, title, memo, weight_kg, is_done, created_at, updated_at"
    )
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  return NextResponse.json({ event: data as PetCareEvent });
}

export async function DELETE(_request: Request, context: EventRouteContext) {
  const ownerId = await getUserIdFromRequest(_request);
  const token = getBearerToken(_request);
  if (!ownerId || !token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id: petId, eventId } = await context.params;
  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  const { error } = await supabase
    .from("pet_care_events")
    .delete()
    .eq("id", eventId)
    .eq("pet_id", petId)
    .eq("owner_id", ownerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: eventId });
}
