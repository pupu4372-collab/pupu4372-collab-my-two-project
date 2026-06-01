"use client";

import { useEffect } from "react";

export function CapacitorShell() {
  useEffect(() => {
    async function initNativeShell() {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        document.documentElement.classList.add("native-app");

        const { StatusBar, Style } = await import("@capacitor/status-bar");
        const { SplashScreen } = await import("@capacitor/splash-screen");

        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: "#f8e8ff" });
        await SplashScreen.hide();
      } catch {
        // Web builds do not ship native plugins.
      }
    }

    void initNativeShell();
  }, []);

  return null;
}
