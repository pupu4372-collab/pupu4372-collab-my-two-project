import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { isPetSpecies } from "@/lib/pets/species";
import type { PetSpecies, SajuType } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

function isSpecies(value: unknown): value is PetSpecies {
  return isPetSpecies(value);
}

function isGender(value: unknown): value is "male" | "female" | "unknown" {
  return value === "male" || value === "female" || value === "unknown";
}

function isDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isTime(value: unknown): value is string {
  return typeof value === "string" && /^\d{2}:\d{2}$/.test(value);
}

export async function GET(request: Request) {
  const ownerId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!ownerId || !token) {
    return NextResponse.json(
      { error: "Authentication required.", pets: [] },
      { status: 401 }
    );
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured.", pets: [] }, { status: 503 });
  }

  const { data: pets, error: petsError } = await supabase
    .from("pets")
    .select("id, name, species, breed, gender, birth_date, birth_time, birth_time_unknown, birth_timezone, profile_image_url, photo_url, photo_consent_secondary_use, personality_tags, created_at")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (petsError) {
    return NextResponse.json({ error: petsError.message }, { status: 500 });
  }

  type PetSummary = {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    gender: string | null;
    birth_date: string;
    birth_time: string | null;
    birth_time_unknown: boolean;
    birth_timezone: string;
    profile_image_url: string | null;
    photo_url: string | null;
    photo_consent_secondary_use: boolean;
    personality_tags: string[];
    created_at: string;
  };

  const petList = (pets ?? []) as PetSummary[];
  const petIds = petList.map((p) => p.id);
  const sajuByPet: Record<
    string,
    Array<{ id: string; title: string | null; saju_type: string; typeLabel: string; created_at: string }>
  > = {};

  if (petIds.length > 0) {
    const { data: sajuRows } = await supabase
      .from("saju_results")
      .select("id, pet_id, title, saju_type, created_at")
      .in("pet_id", petIds)
      .order("created_at", { ascending: false });

    type SajuSummary = {
      id: string;
      pet_id: string;
      title: string | null;
      saju_type: SajuType;
      created_at: string;
    };

    for (const row of (sajuRows ?? []) as SajuSummary[]) {
      if (!sajuByPet[row.pet_id]) sajuByPet[row.pet_id] = [];
      if (sajuByPet[row.pet_id].length < 4) {
        sajuByPet[row.pet_id].push({
          id: row.id,
          title: row.title,
          saju_type: row.saju_type,
          typeLabel: row.saju_type,
          created_at: row.created_at,
        });
      }
    }
  }

  return NextResponse.json({
    pets: petList.map((pet) => {
      const readings = sajuByPet[pet.id] ?? [];
      return {
        ...pet,
        latestSaju: readings[0] ?? null,
        latestSajuResultId: readings[0]?.id ?? null,
        readings,
      };
    }),
  });
}

export async function PATCH(request: Request) {
  const ownerId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!ownerId || !token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: {
    id?: string;
    name?: string;
    species?: string;
    gender?: string;
    birthDate?: string;
    birthTime?: string | null;
    birthTimeUnknown?: boolean;
    timezone?: string;
    profileImageUrl?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const id = body.id?.trim();
  const name = body.name?.trim();
  const birthTimeUnknown = Boolean(body.birthTimeUnknown);
  const birthTime = birthTimeUnknown ? null : body.birthTime;

  if (!id) return NextResponse.json({ error: "Pet id is required." }, { status: 400 });
  if (!name || name.length < 1 || name.length > 40) {
    return NextResponse.json({ error: "Pet name must be 1-40 characters." }, { status: 400 });
  }
  if (!isSpecies(body.species)) {
    return NextResponse.json({ error: "Invalid species." }, { status: 400 });
  }
  if (!isGender(body.gender)) {
    return NextResponse.json({ error: "Invalid gender." }, { status: 400 });
  }
  if (!isDate(body.birthDate)) {
    return NextResponse.json({ error: "Invalid birth date." }, { status: 400 });
  }
  if (!birthTimeUnknown && !isTime(birthTime)) {
    return NextResponse.json({ error: "Invalid birth time." }, { status: 400 });
  }
  if (!body.timezone?.trim()) {
    return NextResponse.json({ error: "Timezone is required." }, { status: 400 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  const { data: pet, error } = await supabase
    .from("pets")
    .update({
      name,
      species: body.species,
      gender: body.gender,
      birth_date: body.birthDate,
      birth_time: birthTime,
      birth_time_unknown: birthTimeUnknown,
      birth_timezone: body.timezone.trim(),
      profile_image_url: body.profileImageUrl ?? null,
    } as never)
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select("id, name, species, breed, gender, birth_date, birth_time, birth_time_unknown, birth_timezone, profile_image_url, photo_url, photo_consent_secondary_use, personality_tags, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pet });
}

export async function DELETE(request: Request) {
  const ownerId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!ownerId || !token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const id = body.id?.trim();
  if (!id) {
    return NextResponse.json({ error: "Pet id is required." }, { status: 400 });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
  }

  const { data: pet, error: findError } = await supabase
    .from("pets")
    .select("id")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (findError) {
    return NextResponse.json({ error: findError.message }, { status: 500 });
  }

  if (!pet) {
    return NextResponse.json({ error: "Pet not found." }, { status: 404 });
  }

  const { error } = await supabase
    .from("pets")
    .delete()
    .eq("id", id)
    .eq("owner_id", ownerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id });
}
