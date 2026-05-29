import { redirect } from "@/i18n/navigation";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function PetShowFeedPage({ params }: PageProps) {
  const { locale } = await params;
  redirect({ href: "/community/pet-show/snapzone", locale });
}
