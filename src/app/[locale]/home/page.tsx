import { redirect } from "@/i18n/navigation";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function LegacyHomePage({ params }: PageProps) {
  const { locale } = await params;
  redirect({ href: "/saju", locale });
}
