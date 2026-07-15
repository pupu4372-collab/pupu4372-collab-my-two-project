import { listHumanPremiumVaultOrders } from "./cart";

export async function listHumanPremiumPaymentHistory(options: {
  userId: string;
}) {
  const orders = await listHumanPremiumVaultOrders({ userId: options.userId });
  return orders.map((order) => ({
    orderId: order.orderId,
    amount: order.amount,
    currency: order.currency ?? "KRW",
    items: order.items,
    itemCount: order.items.length,
    personName: order.personName,
    locale: order.locale,
    createdAt: order.createdAt,
    expiresAt: order.expiresAt,
    generatedCount: Object.keys(order.generated ?? {}).length,
  }));
}
