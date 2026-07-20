"use client";

import { useEffect } from "react";

/** Registers the minimal PWA service worker (`/sw.js`). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failures are non-blocking (e.g. insecure origin).
    });
  }, []);

  return null;
}
