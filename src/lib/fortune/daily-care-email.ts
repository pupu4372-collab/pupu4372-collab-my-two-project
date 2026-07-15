import { isDeliverableHumanPremiumEmail } from "@/lib/reports/human-premium/email-policy";
import { sendResendEmail, isResendConfigured } from "@/lib/email/resend";
import {
  claimDailyCareEmailSlot,
  releaseDailyCareEmailSlot,
} from "@/lib/fortune/daily-care-email-guard";
import {
  buildPetDailyFortune,
  buildPetFortunePetMeta,
  type PetProfileForFortune,
} from "@/lib/saju/pet-daily-fortune";
import { renderDailyCareCardPng } from "@/lib/share/daily-fortune-care-card-png";
import { getTodayKstDateString } from "@/lib/saju/zodiac/fortunes";
import type { Locale } from "@/lib/saju/types";
import { isPetSpecies } from "@/lib/pets/species";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, PetSpecies } from "@/lib/supabase/types";

const CARE_CARD_CID = "pet-daily-care-card";

export type DailyCareEmailResult =
  | { status: "sent"; messageId: string; petId: string; petName: string }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string };

function buildCopy(petName: string, isKo: boolean) {
  if (isKo) {
    return {
      subject: `${petName}의 오늘의 케어`,
      preview: `${petName}의 오늘 케어 가이드가 도착했어요`,
      text: `${petName}의 오늘의 케어 카드입니다. 이미지에서 건강·활력·기쁨·행운과 집사 팁을 확인해 주세요.`,
    };
  }
  return {
    subject: `${petName}'s care today`,
    preview: `Today's care guide for ${petName} is ready`,
    text: `Today's care card for ${petName}. Open the image to see health, vitality, joy, luck, and butler tips.`,
  };
}

/** Prefer pet with newest saju_results.created_at; fall back to newest pet.created_at. */
export async function pickLatestActivityPet(
  supabase: SupabaseClient<Database>,
  ownerId: string
): Promise<PetProfileForFortune | null> {
  const { data: pets, error } = await supabase
    .from("pets")
    .select(
      "id, name, species, birth_date, birth_time, birth_time_unknown, birth_timezone, profile_image_url, photo_url, created_at"
    )
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error || !pets?.length) return null;

  type PetRow = {
    id: string;
    name: string;
    species: string;
    birth_date: string;
    birth_time: string | null;
    birth_time_unknown: boolean;
    birth_timezone: string;
    profile_image_url: string | null;
    photo_url: string | null;
    created_at: string;
  };

  const petList = (pets as PetRow[]).filter((pet): pet is PetRow & { species: PetSpecies } =>
    isPetSpecies(pet.species)
  );
  if (petList.length === 0) return null;

  const petIds = petList.map((p) => p.id);
  const { data: results } = await supabase
    .from("saju_results")
    .select("pet_id, created_at")
    .eq("owner_id", ownerId)
    .in("pet_id", petIds)
    .order("created_at", { ascending: false })
    .limit(200);

  let bestPetId = petList[0].id;
  let bestAt = petList[0].created_at;
  for (const row of results ?? []) {
    const petId = (row as { pet_id: string; created_at: string }).pet_id;
    const createdAt = (row as { pet_id: string; created_at: string }).created_at;
    if (new Date(createdAt).getTime() > new Date(bestAt).getTime()) {
      bestAt = createdAt;
      bestPetId = petId;
    }
  }

  const selected = petList.find((p) => p.id === bestPetId) ?? petList[0];
  return {
    id: selected.id,
    name: selected.name,
    species: selected.species,
    birthDate: selected.birth_date,
    birthTime: selected.birth_time,
    birthTimeUnknown: selected.birth_time_unknown,
    birthTimezone: selected.birth_timezone,
    profileImageUrl: selected.profile_image_url,
    photoUrl: selected.photo_url,
  };
}

export async function sendPetDailyCareEmail(options: {
  supabase: SupabaseClient<Database>;
  ownerId: string;
  toEmail: string;
  locale: Locale;
  force?: boolean;
}): Promise<DailyCareEmailResult> {
  const email = options.toEmail.trim().toLowerCase();
  if (!isDeliverableHumanPremiumEmail(email)) {
    return { status: "skipped", reason: "email_not_deliverable" };
  }
  if (!isResendConfigured()) {
    return { status: "skipped", reason: "resend_not_configured" };
  }

  const dateKst = getTodayKstDateString();
  const isKo = options.locale !== "en";

  let claim: "claimed" | "already_sent" | "unavailable" = "claimed";
  claim = await claimDailyCareEmailSlot(options.ownerId, dateKst);
  if (claim === "already_sent") {
    return { status: "skipped", reason: "already_sent_today" };
  }
  // Auto refresh needs Redis dedupe; email_capture may still send without it.
  if (!options.force && claim === "unavailable") {
    return { status: "skipped", reason: "idempotency_unavailable" };
  }

  try {
    const profile = await pickLatestActivityPet(options.supabase, options.ownerId);
    if (!profile) {
      if (claim === "claimed") await releaseDailyCareEmailSlot(options.ownerId, dateKst);
      return { status: "skipped", reason: "no_pet" };
    }

    const fortune = buildPetDailyFortune(profile, options.locale);
    const petMeta = buildPetFortunePetMeta(profile, options.locale);
    const png = await renderDailyCareCardPng({
      pet: petMeta,
      fortune,
      isKo,
      dateKst,
    });

    const copy = buildCopy(profile.name, isKo);
    const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#12100D;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${copy.preview}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#12100D;padding:16px 0;">
    <tr>
      <td align="center">
        <img
          src="cid:${CARE_CARD_CID}"
          alt="${isKo ? `${profile.name}의 오늘의 케어` : `${profile.name}'s care today`}"
          width="540"
          style="display:block;width:100%;max-width:540px;height:auto;border:0;border-radius:24px;"
        />
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

    const result = await sendResendEmail({
      to: email,
      subject: copy.subject,
      html,
      text: copy.text,
      attachments: [
        {
          filename: `${profile.name}_todays-care.png`,
          content: png.toString("base64"),
          contentType: "image/png",
          contentId: CARE_CARD_CID,
        },
      ],
    });

    return {
      status: "sent",
      messageId: result.id,
      petId: profile.id,
      petName: profile.name,
    };
  } catch (err) {
    if (claim === "claimed") await releaseDailyCareEmailSlot(options.ownerId, dateKst);
    return {
      status: "failed",
      error: err instanceof Error ? err.message : "Daily care email failed.",
    };
  }
}
