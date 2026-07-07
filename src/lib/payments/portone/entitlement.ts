import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * user_id + product_code 기준으로 unlock 여부 확인.
 * pet_id가 있으면 pet_id까지 같이 확인 (더 엄격).
 * payment_id가 있는 행만 유효 결제로 간주.
 */
export async function hasPetPremiumUnlock(
  supabase: SupabaseClient,
  userId: string,
  productCode: string,
  petId?: string | null
): Promise<boolean> {
  let query = supabase
    .from("pet_premium_unlocks")
    .select("id")
    .eq("user_id", userId)
    .eq("product_code", productCode)
    .not("payment_id", "is", null)
    .limit(1);

  if (petId) {
    query = query.eq("pet_id", petId);
  }

  const { data, error } = await query;
  if (error) return false;
  return (data?.length ?? 0) > 0;
}
