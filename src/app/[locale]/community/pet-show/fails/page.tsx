import { AuthRequiredLink } from "@/components/auth/AuthRequiredLink";
import { COMMUNITY_SOLID_CARD_CLASS, COMMUNITY_SOLID_SURFACE_CLASS } from "@/components/community/CommunityDetailSurface";
import { PetShowFeed } from "@/components/community/PetShowFeed";
import { PetShowShell } from "@/components/community/PetShowShell";
import { Link } from "@/i18n/navigation";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function PetShowFailsPage({ params }: PageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";

  const prompts = [
    {
      emoji: "🤪",
      title: isKo ? "흔들린 한 컷" : "The blurry one",
      body: isKo ? "분명 귀여웠는데 결과물은 역동적인 순간." : "It was cute in real life, chaotic in the photo.",
    },
    {
      emoji: "😹",
      title: isKo ? "표정이 다 한 사진" : "The face says it all",
      body: isKo ? "하품, 멍, 놀람까지 있는 그대로 올려보세요." : "Yawns, blank stares, and surprise faces are welcome.",
    },
    {
      emoji: "🏃",
      title: isKo ? "찰나의 도망샷" : "The escape shot",
      body: isKo ? "카메라보다 빠른 우리 아이의 실패 아닌 실패." : "When your pet moves faster than the camera.",
    },
  ];

  return (
    <PetShowShell
      theme="community"
      title={isKo ? "웃긴 실패 사진" : "Funny Photo Fails"}
      subtitle={
        isKo
          ? "완벽하지 않아서 더 귀여운 흔들림, 표정, 도망샷을 모아보세요."
          : "Collect the blurry, silly, not-quite-perfect moments that make pets even cuter."
      }
      backHref="/community/pet-show"
      backLabel={isKo ? "← 우리아이 자랑" : "← Pet Show"}
      rightLinks={[
        { href: "/", label: isKo ? "홈" : "Home" },
        { href: "/community/pet-show/upload", label: isKo ? "사진 올리기" : "Upload" },
      ]}
    >
      <div className="space-y-10">
        <section className={`${COMMUNITY_SOLID_SURFACE_CLASS} relative overflow-hidden p-6 md:p-8`}>
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#ffd7ff]/25 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-channel-community">
              Pet Show Fails
            </p>
            <h2 className="mt-3 text-2xl font-extrabold text-primary md:text-4xl">
              {isKo ? "망한 사진도 우리 아이 역사예요" : "Even failed photos are part of the story"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant">
              {isKo
                ? "제목에 ‘실패샷’, ‘웃긴 사진’, ‘망한 사진’ 같은 키워드를 넣어 올리면 더 쉽게 찾을 수 있어요."
                : "Add words like fail, funny, or blooper to the title so others can find the moment easily."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <AuthRequiredLink
                href="/community/pet-show/upload"
                className="rounded-full bg-[#ffd7ff] px-6 py-3 text-sm font-extrabold text-primary shadow-sm transition hover:scale-105 hover:brightness-105"
              >
                {isKo ? "실패 사진 올리기" : "Upload a fail photo"}
              </AuthRequiredLink>
              <Link
                href="/community/pet-show/snapzone"
                className="rounded-full border border-white/35 bg-white px-6 py-3 text-sm font-extrabold text-channel-community shadow-sm transition hover:brightness-105"
              >
                {isKo ? "스냅존 보기" : "Browse Snapzone"}
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {prompts.map((prompt) => (
            <article key={prompt.title} className={`${COMMUNITY_SOLID_CARD_CLASS} p-5`}>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lavender text-2xl">
                <span aria-hidden>{prompt.emoji}</span>
              </div>
              <h3 className="mt-4 text-lg font-extrabold text-primary">{prompt.title}</h3>
              <p className="mt-2 text-sm leading-6 text-plum/70">{prompt.body}</p>
            </article>
          ))}
        </section>

        <PetShowFeed tags={["fails"]} />
      </div>
    </PetShowShell>
  );
}
