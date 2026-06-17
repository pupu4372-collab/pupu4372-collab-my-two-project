import { COMMUNITY_SOLID_CARD_CLASS, COMMUNITY_SOLID_SURFACE_CLASS } from "@/components/community/CommunityDetailSurface";
import { ChannelShell } from "@/components/layout/ChannelShell";
import { Link } from "@/i18n/navigation";
import { getBreedGuideArticle } from "@/lib/community/breed-guide-articles";
import { fetchBreedGuideBySlug } from "@/lib/community/breed-guides";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string; slug: string; articleSlug: string }>;
}

export default async function BreedGuideArticlePage({ params }: PageProps) {
  const { locale, slug, articleSlug } = await params;
  const isKo = locale !== "en";
  const article = getBreedGuideArticle(slug, articleSlug);
  if (!article) notFound();

  const { guide } = await fetchBreedGuideBySlug(slug);
  if (!guide) notFound();

  const breedName = isKo ? guide.breed_name : guide.breed_name_en ?? guide.breed_name;
  const content = isKo ? article.ko : article.en;
  const breedHref = `/community/breeds/${slug}` as const;

  return (
    <ChannelShell
      theme="community"
      title={content.title}
      subtitle={isKo ? `${breedName} 관련 가이드` : `${breedName} related guide`}
      backHref={breedHref}
      backLabel={isKo ? `← ${breedName} 품종 페이지` : `← ${breedName} breed page`}
      rightLinks={[
        { href: "/community/breeds", label: isKo ? "품종 가이드" : "Breed guides" },
        { href: "/saju", label: isKo ? "펫 사주" : "Pet Saju" },
      ]}
    >
      <article className="mx-auto max-w-4xl space-y-6">
        <header className={`${COMMUNITY_SOLID_SURFACE_CLASS} p-6`}>
          <p className="text-xs font-extrabold text-channel-community">
            {isKo ? `${breedName} 개별 관리 글` : `${breedName} care article`}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-primary">{content.title}</h1>
          <p className="mt-3 text-sm font-bold leading-relaxed text-plum/70">{content.summary}</p>
        </header>

        <nav className={`${COMMUNITY_SOLID_SURFACE_CLASS} p-5`} aria-label={isKo ? "글 목차" : "Article contents"}>
          <p className="text-xs font-extrabold text-channel-community">{isKo ? "목차" : "Contents"}</p>
          <ol className="mt-3 grid gap-2 md:grid-cols-2">
            {content.sections.map((section, index) => (
              <li key={section.heading}>
                <a
                  href={`#section-${index + 1}`}
                  className="block rounded-2xl border border-white/35 bg-sand/45 px-4 py-3 text-sm font-extrabold text-plum transition hover:bg-white"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {content.sections.map((section, index) => (
          <section key={section.heading} id={`section-${index + 1}`} className={`${COMMUNITY_SOLID_CARD_CLASS} p-6`}>
            <h2 className="text-2xl font-extrabold text-primary">{section.heading}</h2>
            {section.children && (
              <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                {section.children.map((child) => (
                  <li key={child} className="rounded-2xl bg-mint/25 px-4 py-3 text-xs font-extrabold text-channel-community">
                    {child}
                  </li>
                ))}
              </ul>
            )}
            {section.body && (
              <div className="mt-4 space-y-3 text-sm font-semibold leading-relaxed text-plum/75">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            )}
          </section>
        ))}

        <section className={`${COMMUNITY_SOLID_SURFACE_CLASS} p-5`}>
          <div className="space-y-3 text-sm font-extrabold leading-relaxed text-plum">
            {content.closing.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={breedHref} className="rounded-full bg-channel-community px-5 py-3 text-sm font-extrabold text-white shadow-sm">
              {isKo ? `${breedName} 품종 페이지로 돌아가기` : `Back to ${breedName} breed page`}
            </Link>
            <Link href="/saju" className="rounded-full border border-channel-community/30 bg-white px-5 py-3 text-sm font-extrabold text-channel-community shadow-sm transition hover:bg-sand/40">
              {isKo ? "우리 아이 사주 보기" : "Pet Saju reading"}
            </Link>
          </div>
        </section>
      </article>
    </ChannelShell>
  );
}
