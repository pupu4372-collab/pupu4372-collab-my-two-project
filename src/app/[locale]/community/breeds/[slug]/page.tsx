import { BreedGuideDetail } from "@/components/community/BreedGuideDetail";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { fetchBreedGuideBySlug } from "@/lib/community/breed-guides";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function BreedGuideDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const isKo = locale !== "en";
  const { guide, source } = await fetchBreedGuideBySlug(slug);
  if (!guide) notFound();

  const title = isKo ? guide.breed_name : guide.breed_name_en ?? guide.breed_name;

  return (
    <ChannelShell
      theme="community"
      title={title}
      subtitle={isKo ? "품종별 가이드" : "Breed guide"}
      backHref="/community/breeds"
      backLabel={isKo ? "← 품종 가이드" : "← Breed guides"}
      rightLinks={[
        { href: "/community", label: isKo ? "커뮤니티" : "Community" },
        { href: "/saju", label: isKo ? "펫 사주" : "Pet Saju" },
      ]}
    >
      <BreedGuideDetail guide={guide} source={source} isKo={isKo} />
    </ChannelShell>
  );
}
