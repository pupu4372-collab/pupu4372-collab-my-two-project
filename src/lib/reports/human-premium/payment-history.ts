import { createSupabaseServerClient } from "@/lib/supabase/server";
import { userHasPetPremiumPayments } from "@/lib/payments/pet-premium-history";
import { listHumanPremiumVaultOrders } from "./cart";

export async function userHasHumanPremiumPayments(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;

  const { count, error } = await supabase
    .from("human_premium_reports")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gt("amount_paid", 0);

  if (error) return false;
  return (count ?? 0) > 0;
}

export async function getServerPaymentHistoryFlag(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const [human, pet] = await Promise.all([
    userHasHumanPremiumPayments(user.id),
    userHasPetPremiumPayments(user.id),
  ]);
  return human || pet;
}

export async function listHumanPremiumPaymentHistory(options: {
  userId?: string | null;
  email?: string | null;
  orderIds?: string[];
}) {
  const orders = await listHumanPremiumVaultOrders(options);
  return orders.map((order) => ({
    orderId: order.orderId,
    amount: order.amount,
    currency: "KRW" as const,
    items: order.items,
    itemCount: order.items.length,
    personName: order.personName,
    locale: order.locale,
    createdAt: order.createdAt,
    expiresAt: order.expiresAt,
    generatedCount: Object.keys(order.generated ?? {}).length,
  }));
}
