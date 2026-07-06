import { redirect } from "@/i18n/navigation";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/** Legacy main hub URL → default Pet Show landing is weekly ranking. */
export default async function PetShowIndexPage({ params }: PageProps) {
  const { locale } = await params;
  redirect({ href: "/community/pet-show/ranking", locale });
}
