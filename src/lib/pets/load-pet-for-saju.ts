import { isPetSpecies } from "@/lib/pets/species";
import {
  birthTimeToSelectValue,
  parseBirthTimeSelect,
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
};

export async function fetchPetProfileForSaju(
  accessToken: string,
  petId: string
): Promise<PetProfileForSaju | null> {
  const res = await fetch("/api/profile/pets", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { pets?: PetProfileForSaju[] };
  return data.pets?.find((pet) => pet.id === petId) ?? null;
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
