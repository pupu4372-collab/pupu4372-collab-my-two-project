import {
  buildCommonPetDailyFortune,
  buildPetDailyFortune,
  buildPetFortunePetMeta,
  type PetProfileForFortune,
} from "@/lib/saju/pet-daily-fortune";
import { isPetSpecies } from "@/lib/pets/species";
import type { Locale } from "@/lib/saju/types";
import type { PetSpecies } from "@/lib/supabase/types";
import { emptyCareReminders, fetchPetCareReminders } from "@/lib/pet-care/reminders";
import {
  createUserSupabaseClient,
  getBearerToken,
  getUserIdFromRequest,
} from "@/lib/supabase/auth-server";
import { NextResponse } from "next/server";

function isSpecies(value: unknown): value is PetSpecies {
  return isPetSpecies(value);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale: Locale = searchParams.get("locale") === "en" ? "en" : "ko";
  const petIdParam = searchParams.get("petId");
  const userId = await getUserIdFromRequest(request);
  const token = getBearerToken(request);

  if (!userId || !token) {
    return NextResponse.json({
      mode: "common" as const,
      hasRegisteredPets: false,
      fortune: buildCommonPetDailyFortune(locale),
      careReminders: emptyCareReminders(),
    });
  }

  const supabase = createUserSupabaseClient(token);
  if (!supabase) {
    return NextResponse.json({
      mode: "common" as const,
      hasRegisteredPets: false,
      fortune: buildCommonPetDailyFortune(locale),
      careReminders: emptyCareReminders(),
    });
  }

  const { data: pets, error: petsError } = await supabase
    .from("pets")
    .select(
      "id, name, species, birth_date, birth_time, birth_time_unknown, birth_timezone, profile_image_url"
    )
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (petsError || !pets?.length) {
    return NextResponse.json({
      mode: "common" as const,
      hasRegisteredPets: false,
      fortune: buildCommonPetDailyFortune(locale),
      careReminders: emptyCareReminders(),
    });
  }

  type PetRow = {
    id: string;
    name: string;
    species: PetSpecies;
    birth_date: string;
    birth_time: string | null;
    birth_time_unknown: boolean;
    birth_timezone: string;
    profile_image_url: string | null;
  };

  const petList = (pets as Array<Omit<PetRow, "species"> & { species: string }>).filter(
    (pet): pet is PetRow => isSpecies(pet.species)
  );
  if (petList.length === 0) {
    return NextResponse.json({
      mode: "common" as const,
      hasRegisteredPets: false,
      fortune: buildCommonPetDailyFortune(locale),
      careReminders: emptyCareReminders(),
    });
  }

  const selected =
    (petIdParam ? petList.find((pet) => pet.id === petIdParam) : null) ?? petList[0];

  const profiles: PetProfileForFortune[] = petList.map((pet) => ({
    id: pet.id,
    name: pet.name,
    species: pet.species,
    birthDate: pet.birth_date,
    birthTime: pet.birth_time,
    birthTimeUnknown: pet.birth_time_unknown,
    birthTimezone: pet.birth_timezone,
    profileImageUrl: pet.profile_image_url,
  }));

  const selectedProfile = profiles.find((pet) => pet.id === selected.id)!;
  const isKo = locale === "ko";
  const careReminders = await fetchPetCareReminders(
    supabase,
    userId,
    selected.id,
    selected.name,
    isKo
  );

  return NextResponse.json({
    mode: "personalized" as const,
    hasRegisteredPets: true,
    petId: selected.id,
    pets: profiles.map((pet) => buildPetFortunePetMeta(pet, locale)),
    fortune: buildPetDailyFortune(selectedProfile, locale),
    careReminders,
  });
}
