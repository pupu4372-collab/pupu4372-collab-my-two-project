import {
  buildPetDailyFortune,
  buildPetFortunePetMeta,
  type PetProfileForFortune,
} from "@/lib/saju/pet-daily-fortune";
import { validatePetName } from "@/lib/saju/moderation";
import type { Locale, Species } from "@/lib/saju/types";
import { NextResponse } from "next/server";

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

function isSpecies(value: unknown): value is Species {
  return value === "dog" || value === "cat" || value === "other";
}

function guestPetId(name: string, birthDate: string, species: Species): string {
  let h = 0;
  for (const part of [name, birthDate, species]) {
    for (let i = 0; i < part.length; i++) {
      h = (h * 31 + part.charCodeAt(i)) >>> 0;
    }
  }
  return `guest-${h.toString(16)}`;
}

export async function POST(request: Request) {
  let body: {
    petName?: string;
    species?: string;
    birthDate?: string;
    locale?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const locale: Locale = body.locale === "en" ? "en" : "ko";
  const nameError = validatePetName(body.petName ?? "");
  if (nameError) {
    return NextResponse.json({ error: nameError }, { status: 400 });
  }

  if (!isSpecies(body.species)) {
    return NextResponse.json({ error: "Invalid species." }, { status: 400 });
  }

  if (!body.birthDate || !isValidDate(body.birthDate)) {
    return NextResponse.json({ error: "Invalid birth date." }, { status: 400 });
  }

  const petName = body.petName!.trim();
  const profile: PetProfileForFortune = {
    id: guestPetId(petName, body.birthDate, body.species),
    name: petName,
    species: body.species,
    birthDate: body.birthDate,
    birthTime: null,
    birthTimeUnknown: true,
    birthTimezone: "Asia/Seoul",
    profileImageUrl: null,
  };

  return NextResponse.json({
    pet: buildPetFortunePetMeta(profile, locale),
    fortune: buildPetDailyFortune(profile, locale),
  });
}
