import { BreedGuideDetail } from "@/components/community/BreedGuideDetail";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { getLocalBreedGuideImage } from "@/lib/community/breed-guide-images";
import { fetchBreedGuideBySlug } from "@/lib/community/breed-guides";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ from?: string; preview?: string }>;
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
  const { from, preview } = await searchParams;
  const isKo = locale !== "en";
  const { guide, source } = await fetchBreedGuideBySlug(slug, { previewMock: preview === "mock" });
  if (!guide) notFound();

  const title = isKo ? guide.breed_name : guide.breed_name_en ?? guide.breed_name;
  const heroImageUrl = guide.hero_image_url ?? guide.thumbnail_url ?? getLocalBreedGuideImage(guide.seo_slug);
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
      heroMedia={
        <div className="relative min-h-[190px] overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-white/75 via-lavender/35 to-mint/40 shadow-inner md:min-h-[220px]">
          {heroImageUrl ? (
            <img src={heroImageUrl} alt={title} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-[190px] flex-col items-center justify-center gap-2 px-5 text-center text-plum/45 md:min-h-[220px]">
              <span className="text-4xl">🐾</span>
              <p className="text-sm font-bold">{isKo ? "품종 이미지 영역" : "Breed image area"}</p>
              <p className="text-xs leading-relaxed">
                {isKo ? "Stitch 이미지가 준비되면 이곳에 들어갑니다." : "A Stitch image can be placed here later."}
              </p>
            </div>
          )}
        </div>
      }
    >
      <BreedGuideDetail guide={guide} source={source} isKo={isKo} backHref={back.href} backLabel={back.label} />
    </ChannelShell>
  );
}
