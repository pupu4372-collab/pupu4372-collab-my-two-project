"use client";

import { AppSplash, hasSeenSplash } from "@/components/splash/AppSplash";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export function SplashGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    setShowSplash(!hasSeenSplash());
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-cream" aria-hidden />;
  }

  if (showSplash) {
    return <AppSplash redirectTo="/" onComplete={() => setShowSplash(false)} />;
  }

  return <>{children}</>;
}
