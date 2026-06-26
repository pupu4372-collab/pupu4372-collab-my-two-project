import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { isPetCareCategory, normalizeEventTime } from "@/lib/pet-care/categories";
import { PET_CARE_EVENT_COLUMNS, type PetCareEvent } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

function isDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

interface EventRouteContext {
  params: Promise<{ id: string; eventId: string }>;
}

export async function PATCH(request: Request, context: EventRouteContext) {
  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);
  if (!userId || !token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id: petId, eventId } = await context.params;

  let body: {
    eventDate?: string;
    eventTime?: string | null;
    category?: string;
    title?: string;
    description?: string | null;
    isRecurring?: boolean;
    recurrenceRule?: string | null;
    reminderAt?: string | null;
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
  if (body.eventTime !== undefined) {
    if (body.eventTime == null || body.eventTime === "") {
      patch.event_time = null;
    } else {
      const eventTime = normalizeEventTime(body.eventTime);
      if (!eventTime) {
        return NextResponse.json({ error: "Invalid eventTime." }, { status: 400 });
      }
      patch.event_time = eventTime;
    }
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
  if (body.description !== undefined) {
    patch.description = body.description?.trim() || null;
  }
  if (body.isRecurring !== undefined) {
    patch.is_recurring = body.isRecurring === true;
  }
  if (body.recurrenceRule !== undefined) {
    patch.recurrence_rule = body.recurrenceRule?.trim() || null;
  }
  if (body.reminderAt !== undefined) {
    patch.reminder_at = body.reminderAt?.trim() || null;
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
    .eq("user_id", userId)
    .select(PET_CARE_EVENT_COLUMNS)
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
  const userId = await getUserIdFromRequest(_request);
  const token = getBearerToken(_request);
  if (!userId || !token) {
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
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: eventId });
}
