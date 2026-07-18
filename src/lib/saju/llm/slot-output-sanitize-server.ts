import { AsyncLocalStorage } from "node:async_hooks";
import type { Locale } from "@/lib/saju/types";
import { registerHanjaSanitizeLocaleStore } from "./slot-output-sanitize";

const sanitizeLocaleStore = new AsyncLocalStorage<Locale>();

registerHanjaSanitizeLocaleStore(() => sanitizeLocaleStore.getStore());

/** Server parse paths: bind locale for nested sanitizeLlmSlotText calls. */
export function runWithHanjaSanitizeLocale<T>(locale: Locale, fn: () => T): T {
  return sanitizeLocaleStore.run(locale, fn);
}
