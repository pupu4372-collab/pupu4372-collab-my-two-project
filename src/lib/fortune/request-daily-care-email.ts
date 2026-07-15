/** Fire-and-forget client helper — never throws. */
export function requestPetDailyCareEmail(options: {
  accessToken: string;
  locale: "ko" | "en";
  email?: string | null;
  /** Set after guest email capture so send proceeds even without Redis. */
  source?: "email_capture" | "fortune_refresh";
}): void {
  const headers: HeadersInit = {
    Authorization: `Bearer ${options.accessToken}`,
    "Content-Type": "application/json",
  };
  void fetch("/api/fortune/daily-care-email", {
    method: "POST",
    headers,
    body: JSON.stringify({
      locale: options.locale,
      ...(options.email ? { email: options.email } : {}),
      ...(options.source ? { source: options.source } : {}),
    }),
  }).catch(() => {
    // ignore network errors — email is best-effort
  });
}
