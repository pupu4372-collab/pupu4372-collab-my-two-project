import { Link } from "@/i18n/navigation";
import { AppTopNav } from "@/components/layout/AppTopNav";
import { SupportQuickActions } from "@/components/support/SupportQuickActions";

interface SupportPageProps {
  params: Promise<{ locale: string }>;
}

const notices = [
  {
    type: "Update",
    koTitle: "K-사주 펫 모바일 앱 버전 2.1 업데이트 안내",
    enTitle: "K-Saju Pet mobile app v2.1 update",
    date: "2024.05.20",
  },
  {
    type: "Service",
    koTitle: "서버 점검 및 안정화 작업 공지 (5월 22일)",
    enTitle: "Server maintenance notice (May 22)",
    date: "2024.05.15",
  },
  {
    type: "Notice",
    koTitle: "개인정보 처리방침 개정 안내",
    enTitle: "Privacy policy update notice",
    date: "2024.05.10",
  },
] as const;

export default async function SupportPage({ params }: SupportPageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";

  return (
    <div className="min-h-screen text-white">
      <AppTopNav active="support" />
      <main className="mx-auto mt-8 max-w-7xl">
        <div className="relative px-6 pb-16 pt-16 md:px-14 md:pb-20">
          <div className="relative z-20 mb-8 flex justify-center gap-2 md:absolute md:right-14 md:top-28 md:mb-0 md:flex-col md:items-end">
            <Link
              href="/terms"
              className="w-36 rounded-full border border-[#dff7ea]/55 bg-[#dff7ea]/20 px-4 py-2 text-center text-xs font-extrabold text-[#e7fff0] backdrop-blur-xl transition hover:bg-[#dff7ea]/35 hover:text-white"
            >
              {isKo ? "이용약관" : "Terms"}
            </Link>
            <Link
              href="/privacy"
              className="w-36 rounded-full border border-[#dff7ea]/55 bg-[#dff7ea]/20 px-4 py-2 text-center text-xs font-extrabold text-[#e7fff0] backdrop-blur-xl transition hover:bg-[#dff7ea]/35 hover:text-white"
            >
              {isKo ? "개인정보처리방침" : "Privacy"}
            </Link>
          </div>

          <section className="relative z-10 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-[#ffd7ff] drop-shadow-[0_0_18px_rgba(245,217,255,0.22)] md:text-5xl">
              {isKo ? "무엇을 도와드릴까요?" : "How can we help?"}
            </h1>
            <div className="mx-auto mt-8 flex max-w-2xl items-center rounded-full border border-white/20 bg-white/30 p-2 text-left shadow-inner backdrop-blur-xl">
              <input
                className="min-w-0 flex-1 border-none bg-transparent px-6 py-3 text-sm font-bold text-white placeholder:text-white/60 focus:outline-none focus:ring-0"
                placeholder={isKo ? "궁금한 내용을 검색해보세요" : "Search your question"}
              />
              <button className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffd7ff] text-lg text-[#442656] shadow-[0_0_22px_rgba(245,217,255,0.35)] transition hover:bg-white">
                🔍
              </button>
            </div>
          </section>

          <SupportQuickActions />

          <section className="relative z-10 mt-14 grid gap-6 lg:grid-cols-[1.4fr_0.65fr]">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-white">{isKo ? "공지사항" : "Notice"}</h2>
                <Link href="/community" className="text-xs font-extrabold text-white/70 transition hover:text-white">
                  {isKo ? "더보기" : "More"} →
                </Link>
              </div>
              <div className="mt-6 space-y-4">
                {notices.map((notice) => (
                  <article key={notice.koTitle} className="rounded-2xl border border-[#ffe6c7]/45 bg-[#fff4e7]/14 p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-[#fff1d8]/85 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#5c3d2e]">
                        {notice.type}
                      </span>
                      <span className="text-xs font-extrabold text-[#ffe6c7]/85">{notice.date}</span>
                    </div>
                    <h3 className="mt-3 text-base font-extrabold text-[#fff8ef]">{isKo ? notice.koTitle : notice.enTitle}</h3>
                    <p className="mt-2 text-sm font-bold text-[#fff1d8]/88">
                      {isKo
                        ? "더욱 빠르고 정확해진 반려동물 사주 분석 로직이 적용되었습니다."
                        : "Updated support details for K-Saju Pet users."}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="relative min-h-[380px] overflow-hidden rounded-[2rem] border border-[#ffe6c7]/45 bg-[#271649] p-7 shadow-[0_24px_55px_-36px_rgba(0,0,0,0.7)]">
              <img
                src="/stitch/global-design-system/dog/dog-02.jpg"
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(34,20,48,0.18)_0%,rgba(34,20,48,0.18)_34%,rgba(68,38,86,0.78)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#2e1744]/95 via-[#4d2a65]/70 to-transparent" />
              <div className="relative z-10 flex h-full flex-col">
                <h2 className="text-2xl font-extrabold">{isKo ? "이달의 이벤트" : "Monthly Event"}</h2>
                <div className="mt-auto">
                  <h3 className="mt-5 text-xl font-extrabold text-[#fff1d8]">
                    {isKo ? "우리 아이 팔자랑 대회" : "Pet Saju Story Event"}
                  </h3>
                  <p className="mt-2 text-sm font-bold leading-6 text-white/90">
                    {isKo ? "사주 분석 결과를 공유하고 특별한 경품을 받아가세요!" : "Share your pet's saju story and join the event."}
                  </p>
                  <Link
                    href="/community/pet-show/upload"
                    className="mt-6 inline-flex w-full justify-center rounded-full border border-[#ffe6c7]/65 bg-[#6f4b8b] px-6 py-4 text-sm font-extrabold text-white shadow-[0_14px_30px_-18px_rgba(255,230,199,0.65)] transition hover:border-white hover:bg-[#5f3f78]"
                  >
                    {isKo ? "참여하기" : "Join now"}
                  </Link>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>

      <section className="mx-auto mt-3 max-w-6xl rounded-[1.5rem] bg-[#ffd1bd] px-5 py-6 text-[#28180d] shadow-sm md:px-9 md:py-7">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-extrabold md:text-2xl">{isKo ? "새로운 소식을 가장 먼저 확인하세요" : "Get updates first"}</h2>
            <p className="mt-2 max-w-xl text-xs font-semibold leading-5 text-[#574236] md:text-sm">
              {isKo
                ? "집사님과 반려동물을 위한 특별한 팁과 운세 소식을 뉴스레터로 보내드립니다."
                : "Pet care tips and K-Saju updates, delivered by newsletter."}
            </p>
          </div>
          <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row md:max-w-md">
            <input
              className="min-w-0 flex-1 rounded-full border-none bg-white px-5 py-3 text-sm text-[#1b1c1a] placeholder:text-[#574236]/45 focus:ring-2 focus:ring-[#442656]/35"
              placeholder={isKo ? "이메일 주소를 입력하세요" : "Email address"}
            />
            <button className="rounded-full bg-[#442656] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#5c3d6e]">
              {isKo ? "구독하기" : "Subscribe"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
