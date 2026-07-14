import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PetPremiumPaymentRecord } from "@/lib/payments/pet-premium-shared";

export type { PetPremiumPaymentRecord } from "@/lib/payments/pet-premium-shared";

type UnlockRow = {
  payment_id: string | null;
  product_code: string;
  price_krw: number | null;
  amount: number | null;
  currency: string | null;
  paid_at: string | null;
  created_at: string;
  expires_at: string | null;
  pet_id: string;
  pets: {
    name: string;
    species: string | null;
    gender: string | null;
    birth_date: string | null;
    birth_timezone: string | null;
  } | null;
};

export async function userHasPetPremiumPayments(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;

  const { count, error } = await supabase
    .from("pet_premium_unlocks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) return false;
  return (count ?? 0) > 0;
}

export async function listPetPremiumPaymentHistory(userId: string): Promise<PetPremiumPaymentRecord[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("pet_premium_unlocks")
    .select(
      "payment_id, product_code, price_krw, amount, currency, paid_at, created_at, expires_at, pet_id, pets ( name, species, gender, birth_date, birth_timezone )"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return (data as UnlockRow[])
    .filter((row) => row.payment_id)
    .map((row) => {
      const currencyRaw = String(row.currency ?? "KRW").trim().toUpperCase();
      const currency: "KRW" | "USD" = currencyRaw === "USD" ? "USD" : "KRW";
      return {
        paymentId: row.payment_id as string,
        productCode: row.product_code,
        petId: row.pet_id,
        petName: row.pets?.name ?? "—",
        species: row.pets?.species ?? null,
        petGender: row.pets?.gender ?? null,
        birthDate: row.pets?.birth_date ?? null,
        timezone: row.pets?.birth_timezone ?? null,
        amount: row.amount ?? row.price_krw ?? 0,
        currency,
        createdAt: row.paid_at ?? row.created_at,
        expiresAt: row.expires_at,
        isLifetime: !row.expires_at,
      };
    });
}
