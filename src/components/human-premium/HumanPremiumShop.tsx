"use client";

import { BirthDateSelect } from "@/components/k-saju/BirthDateSelect";
import { DayPillarPreview } from "@/components/human-premium/DayPillarPreview";
import { PrivacyConsent } from "@/components/legal/PrivacyConsent";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { formatHumanPremiumError } from "@/lib/reports/human-premium/client-errors";
import {
  BUNDLE_PRICING,
  formatKrw,
  getBundleSavings,
  REPORT_PRICING,
  REPORT_TYPE_ORDER,
  REPORT_TYPE_SUBTITLES_EN,
  REPORT_TYPE_SUBTITLES_KO,
  type HumanPremiumBundleKind,
} from "@/lib/reports/human-premium/pricing";
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
  type ReportType,
} from "@/lib/reports/human-premium/types";
import {
  BIRTH_TIME_OPTIONS,
  getBirthTimeOptionLabel,
  parseBirthTimeSelect,
} from "@/lib/saju/birth-time-options";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

type CheckoutTarget =
  | { kind: "single"; reportType: ReportType }
  | { kind: "bundle"; bundle: HumanPremiumBundleKind };

type PaymentMethod = "portone" | "paypal_link";

type PaymentConfig = {
  portone: boolean;
  paypalLink: boolean;
  demoAllowed: boolean;
  demoReady: boolean;
};

type CheckoutResult = {
  reportId: string;
  webUrl: string;
  emailStatus: string | null;
};

const PENDING_KEY = "human_premium_pending";

export function HumanPremiumShop() {
  const routeLocale = useLocale();
  const isKo = routeLocale === "ko";
  const gridRef = useRef<HTMLDivElement>(null);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const { accessToken } = useSupabaseSession();

  const [checkout, setCheckout] = useState<CheckoutTarget | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("portone");
  const [personName, setPersonName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTimeSelect, setBirthTimeSelect] = useState("unknown");
  const [timezone, setTimezone] = useState("Asia/Seoul");
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paypalPending, setPaypalPending] = useState<{
    reportId: string;
    paymentReference: string;
    link: string;
  } | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);

  const birthTimeUnknown = birthTimeSelect === "unknown";
  const birthTime = useMemo(() => {
    if (birthTimeUnknown) return null;
    return parseBirthTimeSelect(birthTimeSelect).birthTime;
  }, [birthTimeSelect, birthTimeUnknown]);

  const savings = getBundleSavings();
  const subtitles = isKo ? REPORT_TYPE_SUBTITLES_KO : REPORT_TYPE_SUBTITLES_EN;
  const typeLabels = isKo ? REPORT_TYPE_LABELS : REPORT_TYPE_LABELS_EN;

  useEffect(() => {
    void fetch("/api/payments/human-premium/config")
      .then((res) => res.json())
      .then((data: PaymentConfig) => {
        setPaymentConfig(data);
        if (data.portone) setPaymentMethod("portone");
        else if (data.paypalLink) setPaymentMethod("paypal_link");
      })
      .catch(() => {
        setPaymentConfig({
          portone: false,
          paypalLink: false,
          demoAllowed: true,
          demoReady: false,
        });
      });
  }, []);

  useEffect(() => {
    if (!checkout) return;
    const frame = window.requestAnimationFrame(() => {
      checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [checkout]);

  function openCheckout(target: CheckoutTarget) {
    setCheckout(target);
    setError(null);
    setPaypalPending(null);
    setResult(null);
  }

  function checkoutAmount(target: CheckoutTarget): number {
    if (target.kind === "bundle") return BUNDLE_PRICING[target.bundle];
    return REPORT_PRICING[target.reportType];
  }

  function checkoutReportType(target: CheckoutTarget): ReportType {
    if (target.kind === "single") return target.reportType;
    if (target.bundle === "timepack") return "yearly";
    if (target.bundle === "themepack") return "mental";
    return "lifetime";
  }

  function checkoutPayload() {
    if (!checkout) return null;
    return {
      personName,
      email,
      birthDate,
      birthTime,
      birthTimeUnknown,
      timezone,
      calendarType,
      locale: routeLocale,
      privacyConsent,
      gender: gender || undefined,
      reportType: checkoutReportType(checkout),
      isBundle: checkout.kind === "bundle" && checkout.bundle === "all",
      bundle: checkout.kind === "bundle" ? checkout.bundle : undefined,
    };
  }

  function authHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    return headers;
  }

  const formReady = Boolean(privacyConsent && personName && email && birthDate);

  async function prepareCheckout(method: PaymentMethod) {
    const payload = checkoutPayload();
    if (!payload) return null;

    const res = await fetch("/api/payments/human-premium/checkout", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ ...payload, paymentMethod: method }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Checkout failed");
    return data as {
      configured: boolean;
      reportId: string;
      paymentId: string;
      storeId: string;
      amount: number;
      orderName: string;
      webAccessToken?: string;
      paypal?: { link: string | null; paymentReference: string };
    };
  }

  async function handlePortOnePay() {
    if (!checkout || !formReady) return;
    setLoading(true);
    setError(null);
    setPaypalPending(null);
    setResult(null);

    try {
      const data = await prepareCheckout("portone");
      if (!data) return;

      if (!data.configured) {
        setError(
          isKo
            ? "PortOne 키가 설정되지 않았습니다. 데모 결제로 테스트하거나 PayPal 링크를 설정하세요."
            : "PortOne is not configured. Use demo checkout or set PayPal links."
        );
        return;
      }

      const PortOne = (window as Window & { PortOne?: unknown }).PortOne;
      if (!PortOne || typeof PortOne !== "object") {
        throw new Error(isKo ? "결제 SDK 로드 실패" : "Payment SDK failed to load");
      }

      const requestPayment = (
        PortOne as {
          requestPayment: (opts: Record<string, unknown>) => Promise<unknown>;
        }
      ).requestPayment;

      const token = data.webAccessToken ?? "";
      sessionStorage.setItem(
        PENDING_KEY,
        JSON.stringify({ reportId: data.reportId, token })
      );

      await requestPayment({
        storeId: data.storeId,
        paymentId: data.paymentId,
        orderName: data.orderName,
        totalAmount: data.amount,
        currency: "KRW",
        customData: { reportId: data.reportId },
        redirectUrl: `${window.location.origin}/${routeLocale}/premium/human/success?reportId=${data.reportId}${token ? `&token=${token}` : ""}`,
      });
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Checkout failed";
      setError(formatHumanPremiumError(raw, routeLocale as "ko" | "en"));
    } finally {
      setLoading(false);
    }
  }

  async function handlePayPalLinkPay() {
    if (!checkout || !formReady) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await prepareCheckout("paypal_link");
      if (!data) return;

      const link = data.paypal?.link;
      if (!link) {
        setError(
          isKo
            ? "PayPal 결제 링크가 설정되지 않았습니다. .env에 PAYPAL_LINK_* 를 추가하세요."
            : "PayPal payment link is not configured. Set PAYPAL_LINK_* in .env."
        );
        return;
      }

      const token = data.webAccessToken ?? "";
      const paymentReference = data.paypal?.paymentReference ?? data.paymentId;

      sessionStorage.setItem(
        PENDING_KEY,
        JSON.stringify({
          reportId: data.reportId,
          token,
          paymentReference,
        })
      );

      setPaypalPending({
        reportId: data.reportId,
        paymentReference,
        link,
      });

      window.open(link, "_blank", "noopener,noreferrer");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Checkout failed";
      setError(formatHumanPremiumError(raw, routeLocale as "ko" | "en"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoPay() {
    if (!checkout || !formReady || !demoReady) return;
    setLoading(true);
    setError(null);
    setPaypalPending(null);
    setResult(null);

    try {
      const payload = checkoutPayload();
      if (!payload) return;

      const res = await fetch("/api/payments/human-premium/demo-complete", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const err = new Error(data.error ?? "Demo checkout failed");
        if (data.code === "supabase_missing") {
          (err as Error & { code?: string }).code = "supabase_missing";
        }
        throw err;
      }

      setCheckout(null);
      setResult({
        reportId: data.report.id,
        webUrl: data.webUrl,
        emailStatus: data.report.email_status ?? null,
      });
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Demo checkout failed";
      setError(formatHumanPremiumError(raw, routeLocale as "ko" | "en"));
    } finally {
      setLoading(false);
    }
  }

  const showPortone = paymentConfig?.portone ?? false;
  const showPaypal = paymentConfig?.paypalLink ?? false;
  const showDemo = paymentConfig?.demoAllowed ?? true;
  const demoReady = paymentConfig?.demoReady ?? false;
  const demoOnly = showDemo && demoReady && !showPortone && !showPaypal;

  return (
    <div className="space-y-10">
      {showDemo ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-center text-sm ${
            demoReady
              ? "border-white/20 bg-white/10 text-white/90"
              : "border-amber-300/50 bg-amber-50/95 text-amber-950"
          }`}
        >
          {demoReady ? (
            isKo ? (
              <>
                <strong>데모 테스트</strong> — 리포트 선택 → 정보 입력 →{" "}
                <strong>데모 결제</strong> (실제 결제 없음, 1~2분 소요)
              </>
            ) : (
              <>
                <strong>Demo</strong> — select a report → fill the form →{" "}
                <strong>Demo checkout</strong> (no charge, ~1–2 min)
              </>
            )
          ) : isKo ? (
            <>
              데모 결제를 쓰려면 <code className="text-xs">.env.local</code>에{" "}
              <strong>NEXT_PUBLIC_SUPABASE_URL</strong>,{" "}
              <strong>SUPABASE_SERVICE_ROLE_KEY</strong>를 넣고{" "}
              <strong>npm run dev</strong>를 다시 실행하세요.
            </>
          ) : (
            <>
              Set <strong>NEXT_PUBLIC_SUPABASE_URL</strong> and{" "}
              <strong>SUPABASE_SERVICE_ROLE_KEY</strong> in <code>.env.local</code>, then
              restart <strong>npm run dev</strong>.
            </>
          )}
        </div>
      ) : null}

      <DayPillarPreview />

      {result ? (
        <section className="pastel-card space-y-4 p-6 text-center">
          <h3 className="text-xl font-extrabold text-plum">
            {isKo ? "리포트가 준비되었습니다" : "Your report is ready"}
          </h3>
          <p className="text-sm text-plum/70">
            {result.emailStatus === "sent"
              ? isKo
                ? "이메일로도 링크를 보냈습니다."
                : "We also emailed you the link."
              : isKo
                ? "아래에서 바로 열어보세요."
                : "Open it below."}
          </p>
          <a
            href={result.webUrl}
            className="inline-flex rounded-full bg-channel-saju px-5 py-3 text-sm font-semibold text-white"
          >
            {isKo ? "리포트 열기" : "Open report"}
          </a>
          <p className="break-all text-xs text-plum/50">ID: {result.reportId}</p>
        </section>
      ) : null}

      <div ref={gridRef} className="space-y-6">
        <header className="text-center">
          <h2 className="text-2xl font-bold text-white">
            {isKo ? "리포트 선택" : "Choose your report"}
          </h2>
          <p className="mt-2 text-sm text-white/75">
            {demoOnly
              ? isKo
                ? "원하는 리포트를 선택한 뒤 데모 결제로 테스트하세요."
                : "Select a report, then use demo checkout to test."
              : isKo
                ? "원하는 분석 유형을 골라 구매하세요."
                : "Pick a report type and checkout."}
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REPORT_TYPE_ORDER.map((reportType) => (
            <article
              key={reportType}
              className="pastel-card flex flex-col p-5 transition hover:border-channel-saju/40"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-channel-saju">
                {typeLabels[reportType]}
              </p>
              <p className="mt-2 text-sm text-plum/85">{subtitles[reportType]}</p>
              <p className="mt-4 text-2xl font-bold text-ink">
                {formatKrw(REPORT_PRICING[reportType])}
              </p>
              <button
                type="button"
                onClick={() => openCheckout({ kind: "single", reportType })}
                className="mt-auto pt-4 text-sm font-bold text-channel-saju underline underline-offset-4"
              >
                {isKo ? "선택" : "Select"}
              </button>
            </article>
          ))}
        </div>
      </div>

      <div ref={checkoutRef}>
      {checkout ? (
        <section className="pastel-card space-y-4 border-2 border-channel-saju/30 p-6">
          <h3 className="text-lg font-bold text-ink">
            {demoOnly
              ? isKo
                ? "데모 결제"
                : "Demo checkout"
              : isKo
                ? "결제 정보"
                : "Checkout"}
            <span className="ml-2 text-channel-saju">
              {formatKrw(checkoutAmount(checkout))}
            </span>
          </h3>

          {demoOnly ? (
            <p className="text-sm text-plum/80">
              {isKo
                ? "이름·이메일·생년월일을 입력한 뒤 아래 「데모 결제」를 누르세요."
                : "Fill in your details, then tap Demo checkout below."}
            </p>
          ) : null}

          {showPortone && showPaypal ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("portone")}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  paymentMethod === "portone"
                    ? "bg-channel-saju text-white"
                    : "border border-plum/20 text-plum"
                }`}
              >
                {isKo ? "국내 카드 (PortOne)" : "KRW card (PortOne)"}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("paypal_link")}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  paymentMethod === "paypal_link"
                    ? "bg-[#222222] text-white"
                    : "border border-plum/20 text-plum"
                }`}
              >
                PayPal
              </button>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-ink">
              {isKo ? "이름" : "Name"}
              <input
                className="pastel-input mt-1 w-full"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              {isKo ? "이메일" : "Email"}
              <input
                type="email"
                className="pastel-input mt-1 w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
          </div>
          <BirthDateSelect
            value={birthDate}
            onChange={setBirthDate}
            label={isKo ? "생년월일" : "Birth date"}
            locale={routeLocale as "ko" | "en"}
          />
          <label className="block text-sm font-medium text-ink">
            {isKo ? "출생 시간" : "Birth time"}
            <select
              className="pastel-input mt-1 w-full"
              value={birthTimeSelect}
              onChange={(e) => setBirthTimeSelect(e.target.value)}
            >
              {BIRTH_TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {getBirthTimeOptionLabel(opt, routeLocale as "ko" | "en")}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-ink">
            {isKo ? "타임존" : "Timezone"}
            <select
              className="pastel-input mt-1 w-full"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-ink">
            {isKo ? "성별 (선택)" : "Gender (optional)"}
            <select
              className="pastel-input mt-1 w-full"
              value={gender}
              onChange={(e) => setGender(e.target.value as "" | "male" | "female")}
            >
              <option value="">{isKo ? "미입력" : "Not provided"}</option>
              <option value="male">{isKo ? "남" : "Male"}</option>
              <option value="female">{isKo ? "여" : "Female"}</option>
            </select>
          </label>
          <PrivacyConsent
            checked={privacyConsent}
            onChange={setPrivacyConsent}
            locale={routeLocale as "ko" | "en"}
            variant="pastel"
            audience="human"
          />

          {paypalPending ? (
            <div className="rounded-2xl border border-[#222222]/15 bg-[#fcf9f2] p-4 text-sm text-plum/90">
              <p className="font-semibold text-ink">
                {isKo ? "PayPal 결제 페이지가 열렸습니다." : "PayPal checkout opened."}
              </p>
              <p className="mt-2">
                {isKo
                  ? "결제 시 아래 주문번호를 메모에 적어주시면 빠르게 확인됩니다."
                  : "Add this order reference in the PayPal note field if available."}
              </p>
              <p className="mt-2 break-all font-mono text-xs">{paypalPending.paymentReference}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={paypalPending.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#222222] px-4 py-2 text-sm font-semibold text-white"
                >
                  {isKo ? "PayPal 다시 열기" : "Reopen PayPal"}
                </a>
                <a
                  href={`/${routeLocale}/premium/human/success?reportId=${paypalPending.reportId}`}
                  className="rounded-full border border-plum/20 px-4 py-2 text-sm font-semibold text-plum"
                >
                  {isKo ? "결제 완료 후 이동" : "After payment"}
                </a>
              </div>
            </div>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="rounded-2xl border border-red-300/80 bg-red-50 px-4 py-3 text-sm font-medium text-red-900"
            >
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {showDemo && (demoOnly || (!showPortone && !showPaypal)) ? (
              <button
                type="button"
                disabled={loading || !formReady || !demoReady}
                onClick={() => void handleDemoPay()}
                className="rounded-full bg-channel-saju px-6 py-3 font-bold text-white disabled:opacity-50"
              >
                {loading
                  ? isKo
                    ? "리포트 생성 중… (1~2분)"
                    : "Generating… (1–2 min)"
                  : isKo
                    ? "데모 결제 (테스트)"
                    : "Demo checkout"}
              </button>
            ) : null}
            {!demoOnly && paymentMethod === "portone" && showPortone ? (
              <button
                type="button"
                disabled={loading || !formReady}
                onClick={() => void handlePortOnePay()}
                className="rounded-full bg-channel-saju px-6 py-3 font-bold text-white disabled:opacity-50"
              >
                {loading ? (isKo ? "처리 중…" : "Processing…") : isKo ? "카드 결제" : "Pay with card"}
              </button>
            ) : null}
            {!demoOnly && paymentMethod === "paypal_link" && showPaypal ? (
              <button
                type="button"
                disabled={loading || !formReady}
                onClick={() => void handlePayPalLinkPay()}
                className="rounded-full bg-[#222222] px-6 py-3 font-bold text-white disabled:opacity-50"
              >
                {loading ? (isKo ? "처리 중…" : "Processing…") : "PayPal"}
              </button>
            ) : null}
            {!demoOnly && !showPortone && !showPaypal && showDemo && !demoReady ? (
              <p className="text-sm text-plum/80">
                {isKo
                  ? "Supabase 설정 후 데모 결제를 사용할 수 있습니다."
                  : "Configure Supabase to enable demo checkout."}
              </p>
            ) : null}
            {!demoOnly && showDemo && (showPortone || showPaypal) ? (
              <button
                type="button"
                disabled={loading || !formReady || !demoReady}
                onClick={() => void handleDemoPay()}
                className="rounded-full border border-[#222222]/14 bg-[#fcf9f2] px-6 py-3 text-sm font-semibold text-[#222222] disabled:opacity-50"
              >
                {loading ? (isKo ? "생성 중…" : "Generating…") : isKo ? "데모 결제" : "Demo"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setCheckout(null);
                setPaypalPending(null);
              }}
              className="rounded-full border border-plum/20 px-6 py-3 text-sm font-semibold text-plum"
            >
              {isKo ? "취소" : "Cancel"}
            </button>
          </div>
        </section>
      ) : null}
      </div>

      <section className="rounded-[2rem] bg-gradient-to-br from-channel-saju/90 to-plum p-6 text-white sm:p-8">
        <p className="text-sm font-semibold text-white/80">
          {isKo ? "올인원 번들" : "All-in-one bundle"}
        </p>
        <h3 className="mt-2 text-xl font-bold sm:text-2xl">
          {isKo
            ? `단품으로 모두 구매 시 ${formatKrw(Object.values(REPORT_PRICING).reduce((a, b) => a + b, 0))}`
            : `Buying all singles: ${formatKrw(Object.values(REPORT_PRICING).reduce((a, b) => a + b, 0))}`}
        </h3>
        <p className="mt-2 text-lg font-semibold">
          → {isKo ? "올인원 번들" : "All-in-one bundle"}{" "}
          <span className="text-2xl">{formatKrw(BUNDLE_PRICING.all)}</span>
          <span className="ml-2 text-sm text-white/90">
            ({isKo ? `${formatKrw(savings)} 절약` : `save ${formatKrw(savings)}`})
          </span>
        </p>
        <button
          type="button"
          onClick={() => openCheckout({ kind: "bundle", bundle: "all" })}
          className="mt-6 rounded-full bg-white px-8 py-3 font-bold text-channel-saju shadow-lg"
        >
          {isKo ? "번들 선택" : "Select bundle"}
        </button>
      </section>
    </div>
  );
}
