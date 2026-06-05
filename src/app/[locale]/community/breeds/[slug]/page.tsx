import { BreedGuideDetail } from "@/components/community/BreedGuideDetail";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { fetchBreedGuideBySlug } from "@/lib/community/breed-guides";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ from?: string }>;
}

function resolveBreedGuideBack(from: string | undefined, isKo: boolean) {
  if (from === "dog") {
    return { href: "/dog" as const, label: isKo ? "← 강아지 채널" : "← Dog Channel" };
  }
  if (from === "cat") {
    return { href: "/cat" as const, label: isKo ? "← 고양이 채널" : "← Cat Channel" };
  }
  if (from === "reptile") {
    return { href: "/reptile" as const, label: isKo ? "← 렙타일(다른동물)" : "← Reptile & Other" };
  }
  return { href: "/community/breeds" as const, label: isKo ? "← 품종 가이드" : "← Breed guides" };
}

export default async function BreedGuideDetailPage({ params, searchParams }: PageProps) {
  const { locale, slug } = await params;
  const { from } = await searchParams;
  const isKo = locale !== "en";
  const { guide, source } = await fetchBreedGuideBySlug(slug);
  if (!guide) notFound();

  const title = isKo ? guide.breed_name : guide.breed_name_en ?? guide.breed_name;
  const back = resolveBreedGuideBack(from, isKo);

  return (
    <ChannelShell
      theme="community"
      title={title}
      subtitle={isKo ? "품종별 가이드" : "Breed guide"}
      backHref={back.href}
      backLabel={back.label}
      rightLinks={[
        { href: "/community", label: isKo ? "커뮤니티" : "Community" },
        { href: "/saju", label: isKo ? "펫 사주" : "Pet Saju" },
      ]}
    >
      <BreedGuideDetail guide={guide} source={source} isKo={isKo} backHref={back.href} backLabel={back.label} />
    </ChannelShell>
  );
}
