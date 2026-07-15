import { redirect } from "next/navigation";

/** Legacy public payments URL → owner-scoped history. */
export default async function LegacyPaymentsRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/my/payments`);
}
