import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

// Cloudflare local dev only — skip on Vercel/production builds
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

export default withNextIntl(nextConfig);
