"use client";

import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";

const SPLASH_MS = 3800;
const STORAGE_KEY = "ksaju-splash-seen";

const COPY = {
  ko: {
    tagline: "반려동물과 하늘이 맺어준 특별한 인연",
    status: "Synchronizing Destiny",
    copyright: "© 2026 K-Saju Pet Team",
  },
  en: {
    tagline: "A special bond between your pet and the stars",
    status: "Synchronizing Destiny",
    copyright: "© 2026 K-Saju Pet Team",
  },
};

function ParticleField() {
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        id: index,
        size: 4 + Math.random() * 5,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        color: ["#f5d9ff", "#e1e999", "#ffffff"][index % 3],
        delay: `${Math.random() * 4}s`,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute rounded-full blur-[2px] animate-pulse"
          style={{
            width: particle.size,
            height: particle.size,
            top: particle.top,
            left: particle.left,
            backgroundColor: particle.color,
            opacity: 0.35,
            animationDelay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}

export function AppSplash({ redirectTo = "/", onComplete }: { redirectTo?: string; onComplete?: () => void }) {
  const router = useRouter();
  const locale = useLocale();
  const copy = COPY[locale === "ko" ? "ko" : "en"];
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const started = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const ratio = Math.min(1, (now - started) / SPLASH_MS);
      setProgress(Math.round(ratio * 100));
      if (ratio < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    const timer = window.setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, "1");
      onComplete?.();
      router.replace(redirectTo);
    }, SPLASH_MS);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [onComplete, redirectTo, router]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-lavender via-white to-mint text-center">
      <div
        className="absolute inset-0 -z-10 opacity-90"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(245, 217, 255, 0.6) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(197, 204, 127, 0.4) 0%, transparent 50%)",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-white/20 backdrop-blur-[2px]" />
      <ParticleField />

      <main className="relative z-10 flex h-full w-full flex-col items-center justify-center px-5">
        <div className="mb-8 rounded-full border border-white/50 bg-white/40 p-1 shadow-[0_0_40px_10px_rgba(223,185,242,0.3)] backdrop-blur-md">
          <div className="relative h-32 w-32 overflow-hidden rounded-full md:h-40 md:w-40">
            <Image
              src="/stitch/asset-09.jpg"
              alt="K-Saju Pet"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-primary md:text-3xl">K-Saju Pet</h1>
        <p className="mt-3 max-w-xs text-sm font-medium tracking-wide text-plum/70">{copy.tagline}</p>

        <div className="absolute bottom-16 w-full max-w-[280px] space-y-8">
          <div className="h-1.5 overflow-hidden rounded-full border border-white/20 bg-white/50 backdrop-blur-sm">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-plum/45">
              {copy.status}
            </p>
            <p className="text-[10px] text-plum/40">{copy.copyright}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export function hasSeenSplash(): boolean {
  if (typeof window === "undefined") return true;
  return sessionStorage.getItem(STORAGE_KEY) === "1";
}
