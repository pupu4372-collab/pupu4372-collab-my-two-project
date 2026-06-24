import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/:locale(ko|en)/saju/premium",
        destination: "/:locale/premium/human",
        permanent: true,
      },
      {
        source: "/:locale(ko|en)/saju/premium/success",
        destination: "/:locale/premium/human/success",
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
