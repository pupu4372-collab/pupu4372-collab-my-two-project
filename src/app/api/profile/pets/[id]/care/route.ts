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

async function loadOwnedPet(
  supabase: NonNullable<ReturnType<typeof createUserSupabaseClient>>,
  ownerId: string,
  petId: string
) {
  const { data, error } = await supabase
    .from("pets")
    .select("id")
    .eq("id", petId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as { id: string } | null;
}

interface CareRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: CareRouteContext) {
  const ownerId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);
  if (!ownerId || !token) {
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
    const pet = await loadOwnedPet(supabase, ownerId, petId);
    if (!pet) {
      return NextResponse.json({ error: "Pet not found." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("pet_care_events")
      .select(
        "id, pet_id, owner_id, event_date, category, title, memo, weight_kg, is_done, created_at, updated_at"
      )
      .eq("pet_id", petId)
      .gte("event_date", from)
      .lte("event_date", to)
      .order("event_date", { ascending: true })
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
  const ownerId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);
  if (!ownerId || !token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id: petId } = await context.params;

  let body: {
    eventDate?: string;
    category?: string;
    title?: string;
    memo?: string;
    weightKg?: number | string | null;
    isDone?: boolean;
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

  let weightKg: number | null = null;
  if (body.weightKg != null && body.weightKg !== "") {
    const parsed = typeof body.weightKg === "number" ? body.weightKg : Number(body.weightKg);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 999) {
      return NextResponse.json({ error: "Invalid weight." }, { status: 400 });
    }
    weightKg = Math.round(parsed * 100) / 100;
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  try {
    const pet = await loadOwnedPet(supabase, ownerId, petId);
    if (!pet) {
      return NextResponse.json({ error: "Pet not found." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("pet_care_events")
      .insert({
        pet_id: petId,
        owner_id: ownerId,
        event_date: eventDate,
        category: body.category,
        title,
        memo: body.memo?.trim() || null,
        weight_kg: weightKg,
        is_done: body.isDone === true,
      } as never)
      .select(
        "id, pet_id, owner_id, event_date, category, title, memo, weight_kg, is_done, created_at, updated_at"
      )
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
