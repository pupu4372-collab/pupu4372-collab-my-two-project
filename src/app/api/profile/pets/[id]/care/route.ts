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

async function loadOwnedPet(
  supabase: NonNullable<ReturnType<typeof createUserSupabaseClient>>,
  userId: string,
  petId: string
) {
  const { data, error } = await supabase
    .from("pets")
    .select("id")
    .eq("id", petId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as { id: string } | null;
}

interface CareRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: CareRouteContext) {
  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);
  if (!userId || !token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id: petId } = await context.params;
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!isDate(from) || !isDate(to)) {
    return NextResponse.json({ error: "from and to (YYYY-MM-DD) are required." }, { status: 400 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  try {
    const pet = await loadOwnedPet(supabase, userId, petId);
    if (!pet) {
      return NextResponse.json({ error: "Pet not found." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("pet_care_events")
      .select(PET_CARE_EVENT_COLUMNS)
      .eq("user_id", userId)
      .eq("pet_id", petId)
      .gte("event_date", from)
      .lte("event_date", to)
      .order("event_date", { ascending: true })
      .order("event_time", { ascending: true, nullsFirst: true })
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ events: (data ?? []) as PetCareEvent[] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load care events." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: CareRouteContext) {
  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);
  if (!userId || !token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id: petId } = await context.params;

  let body: {
    eventDate?: string;
    eventTime?: string | null;
    category?: string;
    title?: string;
    description?: string;
    isRecurring?: boolean;
    recurrenceRule?: string | null;
    reminderAt?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const eventDate = body.eventDate?.trim();
  const title = body.title?.trim();
  if (!isDate(eventDate) || !title) {
    return NextResponse.json({ error: "eventDate and title are required." }, { status: 400 });
  }
  if (!isPetCareCategory(body.category)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  const eventTime = body.eventTime !== undefined ? normalizeEventTime(body.eventTime) : null;
  if (body.eventTime && eventTime === null) {
    return NextResponse.json({ error: "Invalid eventTime." }, { status: 400 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  try {
    const pet = await loadOwnedPet(supabase, userId, petId);
    if (!pet) {
      return NextResponse.json({ error: "Pet not found." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("pet_care_events")
      .insert({
        user_id: userId,
        pet_id: petId,
        event_date: eventDate,
        event_time: eventTime,
        category: body.category,
        title,
        description: body.description?.trim() || null,
        is_recurring: body.isRecurring === true,
        recurrence_rule: body.recurrenceRule?.trim() || null,
        reminder_at: body.reminderAt?.trim() || null,
      } as never)
      .select(PET_CARE_EVENT_COLUMNS)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event: data as PetCareEvent });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create care event." },
      { status: 500 }
    );
  }
}
