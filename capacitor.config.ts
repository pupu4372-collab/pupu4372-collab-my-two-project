import type { CapacitorConfig } from "@capacitor/cli";

const defaultServerUrl = "https://ksajupet.com";

function resolveServerUrl() {
  const raw =
    process.env.CAPACITOR_SERVER_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    defaultServerUrl;
  return raw.replace(/\/$/, "");
}

const config: CapacitorConfig = {
  appId: "com.ksajupet.app",
  appName: "K-Saju Pet",
  webDir: "www",
  server: {
    url: resolveServerUrl(),
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: "automatic",
    scrollEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: "#f8e8ff",
      showSpinner: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#f8e8ff",
    },
  },
};

export default config;
