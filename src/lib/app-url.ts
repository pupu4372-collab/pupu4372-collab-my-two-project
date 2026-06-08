function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function isLocalHost(host: string): boolean {
  const hostname = host.split(":")[0]?.toLowerCase() ?? host;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

function baseUrlFromHost(
  host: string,
  protocol: string
): string | null {
  if (!host || !isLocalHost(host)) return null;
  const proto = protocol.replace(/:$/, "") || "http";
  return normalizeBaseUrl(`${proto}://${host}`);
}

export function getConfiguredAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const port = process.env.PORT ?? "3010";
  return `http://localhost:${port}`;
}

export function resolveAppBaseUrlFromHeaders(headers: Headers): string {
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  const protocol = headers.get("x-forwarded-proto") ?? "http";
  const fromHeaders = host ? baseUrlFromHost(host, protocol) : null;
  return fromHeaders ?? getConfiguredAppBaseUrl();
}

export function resolveAppBaseUrl(request?: Request | null): string {
  if (request) {
    try {
      const url = new URL(request.url);
      const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
      const protocol =
        request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
      const fromRequest = baseUrlFromHost(host, protocol);
      if (fromRequest) return fromRequest;
    } catch {
      // fall through
    }
  }

  return getConfiguredAppBaseUrl();
}

/** @deprecated Use resolveAppBaseUrl(request) in API routes or getConfiguredAppBaseUrl() for emails. */
export function getAppBaseUrl(): string {
  return getConfiguredAppBaseUrl();
}
