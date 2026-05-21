"use client";

const NAV = [
  { label: "홈", href: "#top", active: true },
  { label: "댕냥사주", href: "#saju-form" },
  { label: "오늘의 운세", href: "#saju-form" },
  { label: "인기 사주", href: "#saju-form" },
];

export function SiteNav() {
  return (
    <nav className="relative z-20 flex items-center justify-between px-5 py-5 md:px-10">
      <a href="#top" className="flex items-center gap-2">
        <span className="text-xl" aria-hidden>
          ☀️
        </span>
        <span className="text-lg font-bold tracking-tight text-plum md:text-xl">K-Saju Pet</span>
      </a>
      <ul className="flex flex-wrap items-center justify-end gap-2 text-xs font-medium text-plum/90 sm:gap-4 sm:text-sm md:gap-8 md:text-[15px]">
        {NAV.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              className={
                item.active
                  ? "text-plum underline decoration-mint decoration-2 underline-offset-4"
                  : "transition hover:text-plum"
              }
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
