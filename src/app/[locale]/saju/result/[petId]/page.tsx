import { ChannelShell } from "@/components/layout/ChannelShell";
import { SharedPetFortuneLanding } from "@/components/saju/SharedPetFortuneLanding";
import { getConfiguredAppBaseUrl } from "@/lib/app-url";
import {
  buildPetDailyFortune,
  buildPetFortunePetMeta,
  type PetProfileForFortune,
} from "@/lib/saju/pet-daily-fortune";
import type { Locale } from "@/lib/saju/types";
import type { PetSpecies } from "@/lib/supabase/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

interface SharedFortunePageProps {
  params: Promise<{ locale: string; petId: string }>;
}

function isSpecies(value: unknown): value is PetSpecies {
  return value === "dog" || value === "cat" || value === "other";
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

async function loadSharedFortune(petId: string, locale: Locale) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const { data: rawPet, error } = await supabase
    .from("pets")
    .select(
      "id, name, species, birth_date, birth_time, birth_time_unknown, birth_timezone, profile_image_url"
    )
    .eq("id", petId)
    .maybeSingle();

  const pet = rawPet as (Omit<PetRow, "species"> & { species: string }) | null;
  if (error || !pet || !isSpecies(pet.species)) return null;

  const profile: PetProfileForFortune = {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    birthDate: pet.birth_date,
    birthTime: pet.birth_time,
    birthTimeUnknown: pet.birth_time_unknown,
    birthTimezone: pet.birth_timezone,
    profileImageUrl: pet.profile_image_url,
  };

  return {
    pet: buildPetFortunePetMeta(profile, locale),
    fortune: buildPetDailyFortune(profile, locale),
  };
}

export async function generateMetadata({ params }: SharedFortunePageProps): Promise<Metadata> {
  const { locale, petId } = await params;
  const isKo = locale !== "en";
  const data = await loadSharedFortune(petId, isKo ? "ko" : "en");
  if (!data) {
    return { title: isKo ? "운세를 찾을 수 없어요" : "Fortune not found" };
  }

  const title = `${data.pet.name}${isKo ? "의 오늘 운세" : "'s fortune today"} | K-Saju Pet`;
  const description = (data.fortune.messages[0]?.body ?? data.fortune.subtitle).slice(0, 160);
  const appBase = getConfiguredAppBaseUrl();

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${appBase}/saju/result/${petId}`,
      images: [{ url: `${appBase}/api/fortune/share-og` }],
    },
  };
}

export default async function SharedPetFortunePage({ params }: SharedFortunePageProps) {
  const { locale, petId } = await params;
  const isKo = locale !== "en";
  const t = await getTranslations("saju");
  const data = await loadSharedFortune(petId, isKo ? "ko" : "en");

  if (!data) notFound();

  return (
    <ChannelShell
      theme="saju"
      title={isKo ? "오늘의 운세" : "Today's fortune"}
      subtitle={t("hubSubtitle")}
      hideThemeLabel
    >
      <SharedPetFortuneLanding pet={data.pet} fortune={data.fortune} isKo={isKo} />
    </ChannelShell>
  );
}
