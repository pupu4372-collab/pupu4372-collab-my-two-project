import { Link } from "@/i18n/navigation";

interface SajuHubCtaProps {
  isKo: boolean;
}

export function SajuHubCta({ isKo }: SajuHubCtaProps) {
  return (
    <section className="relative overflow-hidden rounded-[3rem] bg-primary px-8 py-12 text-center md:px-16 md:py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />
      <div className="relative z-10">
        <h2 className="text-2xl font-extrabold leading-snug text-cream md:text-3xl">
          {isKo ? (
            <>
              아이의 이름과 생일만 있으면
              <br />
              지금 바로 확인할 수 있어요
            </>
          ) : (
            <>
              Pet name and birthday are all you need
              <br />
              to start right now
            </>
          )}
        </h2>
        <Link
          href="/home"
          className="mt-8 inline-flex rounded-full border-2 border-white/70 bg-cream px-10 py-4 text-sm font-extrabold text-primary shadow-xl shadow-black/20 transition hover:bg-white hover:shadow-2xl"
        >
          {isKo ? "지금 바로 분석 시작하기" : "Start on Home"}
        </Link>
      </div>
    </section>
  );
}
