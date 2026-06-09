import { Link } from "@/i18n/navigation";
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

const navLinks = [
  { href: "/" as const, label: "Home" },
  { href: "/dog" as const, label: "Dog" },
  { href: "/cat" as const, label: "Cat" },
  { href: "/saju" as const, label: "K-Saju" },
  { href: "/community" as const, label: "Community" },
] as const;

const stars = [
  ["8%", "16%", "1px", "0s"],
  ["14%", "34%", "2px", "1.2s"],
  ["21%", "22%", "1px", "2.1s"],
  ["29%", "9%", "2px", "0.5s"],
  ["36%", "29%", "1px", "1.7s"],
  ["45%", "18%", "2px", "2.8s"],
  ["56%", "8%", "2px", "0.9s"],
  ["63%", "33%", "1px", "1.5s"],
  ["72%", "15%", "2px", "2.3s"],
  ["84%", "28%", "1px", "0.4s"],
  ["91%", "12%", "2px", "1.9s"],
  ["11%", "58%", "1px", "2.6s"],
  ["23%", "72%", "2px", "0.8s"],
  ["39%", "64%", "1px", "1.4s"],
  ["51%", "81%", "2px", "2.2s"],
  ["67%", "70%", "1px", "0.2s"],
  ["78%", "56%", "2px", "1.1s"],
  ["92%", "78%", "1px", "2.7s"],
] as const;

export default async function SupportPage({ params }: SupportPageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";

  return (
    <div className="min-h-screen bg-[#fbf9f5] bg-[radial-gradient(#d7d1dc_1px,transparent_1px)] [background-size:16px_16px] px-4 py-8 text-white md:px-8">
      <main className="mx-auto max-w-7xl overflow-hidden rounded-[2.2rem] border-[10px] border-[#aeb5be] bg-[radial-gradient(circle_at_50%_18%,rgba(181,116,255,0.28),transparent_30%),linear-gradient(180deg,#1d1524_0%,#3b1d50_36%,#7a4592_100%)] shadow-[0_28px_80px_-36px_rgba(27,28,26,0.65)]">
        <header className="flex h-16 items-center justify-between bg-[#f2f0ed]/90 px-6 text-[#442656] md:px-14">
          <Link href="/" className="text-lg font-extrabold tracking-tight">
            K-Saju Pet
          </Link>
          <nav className="hidden items-center gap-8 text-xs font-semibold text-[#1b1c1a]/70 md:flex">
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-[#442656]">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-xs font-extrabold">
            <span>EN/KO</span>
            <Link href="/profile" aria-label={isKo ? "프로필" : "Profile"}>
              ♙
            </Link>
          </div>
        </header>

        <div className="relative overflow-hidden px-6 pb-16 pt-16 md:px-14 md:pb-20">
          <div className="pointer-events-none absolute inset-0">
            {stars.map(([left, top, size, delay]) => (
              <span
                key={`${left}-${top}`}
                className="star-twinkle absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                style={{
                  left,
                  top,
                  width: size,
                  height: size,
                  animationDelay: delay,
                }}
              />
            ))}
          </div>

          <div className="relative z-20 mb-8 flex justify-center gap-2 md:absolute md:right-14 md:top-28 md:mb-0 md:flex-col md:items-end">
            <Link
              href="/terms"
              className="w-36 rounded-full border border-white/18 bg-white/12 px-4 py-2 text-center text-xs font-extrabold text-white/78 backdrop-blur-xl transition hover:bg-white/22 hover:text-white"
            >
              {isKo ? "이용약관" : "Terms"}
            </Link>
            <Link
              href="/privacy"
              className="w-36 rounded-full border border-white/18 bg-white/12 px-4 py-2 text-center text-xs font-extrabold text-white/78 backdrop-blur-xl transition hover:bg-white/22 hover:text-white"
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
            <div className="rounded-[2rem] border border-white/18 bg-white/16 p-7 backdrop-blur-xl md:p-9">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold">{isKo ? "공지사항" : "Notice"}</h2>
                <Link href="/community" className="text-xs font-extrabold text-white/70 transition hover:text-white">
                  {isKo ? "더보기" : "More"} →
                </Link>
              </div>
              <div className="mt-6 space-y-4">
                {notices.map((notice) => (
                  <article key={notice.koTitle} className="rounded-2xl border border-white/14 bg-white/14 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-[#ffd7ff]/24 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#ffd7ff]">
                        {notice.type}
                      </span>
                      <span className="text-xs font-bold text-white/50">{notice.date}</span>
                    </div>
                    <h3 className="mt-3 text-base font-extrabold text-white">{isKo ? notice.koTitle : notice.enTitle}</h3>
                    <p className="mt-2 text-sm font-semibold text-white/58">
                      {isKo
                        ? "더욱 빠르고 정확해진 반려동물 사주 분석 로직이 적용되었습니다."
                        : "Updated support details for K-Saju Pet users."}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="relative min-h-[380px] overflow-hidden rounded-[2rem] border border-white/18 bg-[#271649] p-7 shadow-[0_24px_55px_-36px_rgba(0,0,0,0.7)]">
              <img
                src="/stitch/global-design-system/dog/dog-02.jpg"
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(39,22,73,0.26)_0%,rgba(39,22,73,0.24)_36%,rgba(68,38,86,0.82)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#442656]/95 to-transparent" />
              <div className="relative z-10 flex h-full flex-col">
                <h2 className="text-2xl font-extrabold">{isKo ? "이달의 이벤트" : "Monthly Event"}</h2>
                <div className="mt-auto">
                  <h3 className="mt-5 text-xl font-extrabold text-[#ffd7ff]">
                    {isKo ? "우리 아이 팔자랑 대회" : "Pet Saju Story Event"}
                  </h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white/76">
                    {isKo ? "사주 분석 결과를 공유하고 특별한 경품을 받아가세요!" : "Share your pet's saju story and join the event."}
                  </p>
                  <Link
                    href="/community/pet-show/upload"
                    className="mt-6 inline-flex w-full justify-center rounded-full bg-[#5a2477] px-6 py-4 text-sm font-extrabold text-white shadow-[0_12px_30px_-18px_rgba(255,215,255,0.5)] transition hover:bg-[#743396]"
                  >
                    {isKo ? "참여하기" : "Join now"}
                  </Link>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>

      <section className="mx-auto mt-8 max-w-7xl rounded-[2rem] bg-[#ffd1bd] px-6 py-9 text-[#28180d] shadow-sm md:px-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-extrabold">{isKo ? "새로운 소식을 가장 먼저 확인하세요" : "Get updates first"}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#574236]">
              {isKo
                ? "집사님과 반려동물을 위한 특별한 팁과 운세 소식을 뉴스레터로 보내드립니다."
                : "Pet care tips and K-Saju updates, delivered by newsletter."}
            </p>
          </div>
          <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <input
              className="min-w-0 flex-1 rounded-full border-none bg-white px-5 py-4 text-sm text-[#1b1c1a] placeholder:text-[#574236]/45 focus:ring-2 focus:ring-[#442656]/35"
              placeholder={isKo ? "이메일 주소를 입력하세요" : "Email address"}
            />
            <button className="rounded-full bg-[#442656] px-7 py-4 text-sm font-extrabold text-white transition hover:bg-[#5c3d6e]">
              {isKo ? "구독하기" : "Subscribe"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
