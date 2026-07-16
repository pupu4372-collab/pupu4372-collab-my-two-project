import { isPetSpecies } from "@/lib/pets/species";
import {
  birthTimeToSelectValue,
} from "@/lib/saju/birth-time-options";
import type { Gender, Species } from "@/lib/saju/types";

export type PetProfileForSaju = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  gender: string | null;
  birth_date: string;
  birth_time: string | null;
  birth_time_unknown: boolean;
  birth_timezone: string;
  photo_url: string | null;
  profile_image_url?: string | null;
  latestSajuResultId?: string | null;
};

export type PetEntryListItem = PetProfileForSaju & {
  latestSajuResultId: string | null;
};

export async function fetchPetsForSajuEntry(
  accessToken: string
): Promise<PetEntryListItem[]> {
  const res = await fetch("/api/profile/pets", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return [];

  const data = (await res.json()) as {
    pets?: Array<
      PetProfileForSaju & {
        latestSajuResultId?: string | null;
        latestSaju?: { id: string } | null;
      }
    >;
  };

  return (data.pets ?? []).map((pet) => ({
    ...pet,
    latestSajuResultId: pet.latestSajuResultId ?? pet.latestSaju?.id ?? null,
  }));
}

export async function fetchPetProfileForSaju(
  accessToken: string,
  petId: string
): Promise<PetProfileForSaju | null> {
  const pets = await fetchPetsForSajuEntry(accessToken);
  return pets.find((pet) => pet.id === petId) ?? null;
}

export function petProfileToSajuFormState(pet: PetProfileForSaju) {
  const species = isPetSpecies(pet.species) ? pet.species : ("dog" as Species);
  const birthTimeSelect = birthTimeToSelectValue(pet.birth_time, pet.birth_time_unknown);
  return {
    petName: pet.name,
    species,
    petGender: (pet.gender === "male" || pet.gender === "female" ? pet.gender : "female") as Gender,
    birthDate: pet.birth_date,
    birthTime: birthTimeSelect,
    timezone: pet.birth_timezone,
    photoUrl: pet.photo_url,
    breed: pet.breed,
  };
}

/** Href for choosing a registered pet on /saju: snapshot report or prefill+compute. */
export function sajuHrefForRegisteredPet(pet: {
  id: string;
  latestSajuResultId: string | null;
}): string {
  if (pet.latestSajuResultId) {
    return `/reports/${pet.latestSajuResultId}`;
  }
  return `/saju?petId=${encodeURIComponent(pet.id)}`;
}
