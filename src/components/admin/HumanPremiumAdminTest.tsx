"use client";

import { BirthDateSelect } from "@/components/k-saju/BirthDateSelect";
import { PrivacyConsent } from "@/components/legal/PrivacyConsent";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import {
  BIRTH_TIME_OPTIONS,
  getBirthTimeOptionLabel,
  parseBirthTimeSelect,
} from "@/lib/saju/birth-time-options";
import { COMMON_TIMEZONES } from "@/lib/saju/timezone";
import {
  REPORT_TYPE_LABELS,
  REPORT_TYPE_LABELS_EN,
  type HumanPremiumReportRow,
  type ReportType,
} from "@/lib/reports/human-premium/types";
import type { Locale } from "@/lib/saju/types";
import { Link } from "@/i18n/navigation";
import { useMemo, useState } from "react";

type CalendarType = "solar" | "lunar";

type ReportResult = HumanPremiumReportRow & { webUrl?: string };

type BatchStatus = "pending" | "running" | "done" | "error";

type BatchItem = {
  reportType: ReportType;
  status: BatchStatus;
  elapsedMs?: number;
  error?: string;
  report?: ReportResult;
  webUrl?: string;
};

const ALL_REPORT_TYPES: ReportType[] = [
  "daily",
  "decade",
  "monthly",
  "yearly",
  "mental",
  "love",
  "career",
  "business",
  "wealth",
  "lifetime",
];

function reportTypeLabel(type: ReportType, locale: Locale): string {
  const labels = locale === "en" ? REPORT_TYPE_LABELS_EN : REPORT_TYPE_LABELS;
  return labels[type] ?? type;
}

function statusLabel(status: BatchStatus): string {
  switch (status) {
    case "pending":
      return "대기";
    case "running":
      return "생성중";
    case "done":
      return "완료";
    case "error":
      return "실패";
  }
}

function formatElapsed(ms: number | undefined): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function resolveLocalWebReportUrl(url: string): string {
  if (typeof window === "undefined") return url;
  try {
    const parsed = new URL(url, window.location.origin);
    const isLocal =
      parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (isLocal && parsed.port !== window.location.port) {
      return `${window.location.origin}${parsed.pathname}${parsed.search}`;
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function HumanPremiumAdminTest() {
  const { accessToken, isAnonymous } = useSupabaseSession();
  // Default EN: this tool is mainly for EN report QA (cart EN checkout is gated).
  const [locale, setLocale] = useState<Locale>("en");
  const [personName, setPersonName] = useState("");
  const [email, setEmail] = useState("");
  const [calendarType, setCalendarType] = useState<CalendarType>("solar");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("unknown");
  const [timezone, setTimezone] = useState("Asia/Seoul");
  const [gender, setGender] = useState<"" | "male" | "female">("");
  const [consent, setConsent] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<ReportType[]>(["lifetime"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ReportResult[]>([]);
  const [actionId, setActionId] = useState<string | null>(null);

  const petTime = parseBirthTimeSelect(birthTime);
  const timezoneOptions = useMemo(() => {
    const set = new Set<string>([...COMMON_TIMEZONES, timezone]);
    return Array.from(set);
  }, [timezone]);

  const allSelected = selectedTypes.length === ALL_REPORT_TYPES.length;

  function authHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    return headers;
  }

  function toggleType(type: ReportType) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  function selectAllTypes() {
    setSelectedTypes([...ALL_REPORT_TYPES]);
  }

  function clearAllTypes() {
    setSelectedTypes([]);
  }

  function buildGenerateBody(reportType: ReportType) {
    return {
      personName,
      email,
      calendarType,
      birthDate,
      birthTime: petTime.birthTime,
      birthTimeUnknown: petTime.birthTimeUnknown,
      timezone,
      locale,
      privacyConsent: true,
      reportType,
      ...(gender ? { gender } : {}),
      sendEmail,
    };
  }

  async function generateOne(reportType: ReportType): Promise<{
    report: ReportResult;
    webUrl: string;
  }> {
    const res = await fetch("/api/premium/human/test-generate", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(buildGenerateBody(reportType)),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "생성 실패");
    return {
      report: { ...data.report, webUrl: data.webUrl },
      webUrl: String(data.webUrl ?? ""),
    };
  }

  /** Sequential batch — one type at a time (LLM rate limits). */
  async function generateReportBatch() {
    setError(null);
    if (!consent) {
      setError("개인정보 동의가 필요합니다.");
      return;
    }
    if (!accessToken) {
      setError("관리자 로그인이 필요합니다.");
      return;
    }
    if (!selectedTypes.length) {
      setError("리포트 종류를 하나 이상 선택해 주세요.");
      return;
    }

    const queue = ALL_REPORT_TYPES.filter((t) => selectedTypes.includes(t));
    setBatchItems(
      queue.map((reportType) => ({
        reportType,
        status: "pending" as const,
      }))
    );
    setLoading(true);

    for (const reportType of queue) {
      setBatchItems((prev) =>
        prev.map((item) =>
          item.reportType === reportType
            ? { ...item, status: "running", error: undefined }
            : item
        )
      );
      const started = performance.now();
      try {
        const { report, webUrl } = await generateOne(reportType);
        const elapsedMs = Math.round(performance.now() - started);
        setBatchItems((prev) =>
          prev.map((item) =>
            item.reportType === reportType
              ? {
                  ...item,
                  status: "done",
                  elapsedMs,
                  report,
                  webUrl: webUrl || report.webUrl,
                }
              : item
          )
        );
      } catch (err) {
        const elapsedMs = Math.round(performance.now() - started);
        const message = err instanceof Error ? err.message : "생성 실패";
        setBatchItems((prev) =>
          prev.map((item) =>
            item.reportType === reportType
              ? { ...item, status: "error", elapsedMs, error: message }
              : item
          )
        );
      }
    }

    setLoading(false);
  }

  async function searchReports() {
    if (!accessToken || !searchQuery.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({ query: searchQuery.trim() });
      const res = await fetch(`/api/premium/human/admin/search?${params}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "검색 실패");
      setSearchResults(data.reports ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "검색 실패");
    } finally {
      setLoading(false);
    }
  }

  async function resendEmail(reportId: string) {
    if (!accessToken) return;
    setActionId(reportId);
    setError(null);
    try {
      const res = await fetch("/api/premium/human/admin/resend-email", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ reportId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "이메일 발송 실패");
      setBatchItems((items) =>
        items.map((item) =>
          item.report?.id === reportId
            ? {
                ...item,
                report: { ...data.report, webUrl: item.webUrl ?? item.report?.webUrl },
              }
            : item
        )
      );
      setSearchResults((rows) =>
        rows.map((row) => (row.id === reportId ? { ...data.report, webUrl: row.webUrl } : row))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "이메일 발송 실패");
    } finally {
      setActionId(null);
    }
  }

  async function refreshWebLink(reportId: string) {
    if (!accessToken) return;
    setActionId(`${reportId}-link`);
    setError(null);
    try {
      const res = await fetch("/api/premium/human/admin/refresh-web-link", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ reportId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "링크 재발급 실패");

      const updated = { ...data.report, webUrl: data.webUrl } as ReportResult;
      setBatchItems((items) =>
        items.map((item) =>
          item.report?.id === reportId
            ? { ...item, report: updated, webUrl: data.webUrl }
            : item
        )
      );
      setSearchResults((rows) =>
        rows.map((row) => (row.id === reportId ? updated : row))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "링크 재발급 실패");
    } finally {
      setActionId(null);
    }
  }

  function ReportCard({ report }: { report: ReportResult }) {
    const webUrl = report.webUrl ? resolveLocalWebReportUrl(report.webUrl) : undefined;
    const typeKey = report.report_type as ReportType | undefined;
    const typeLabel =
      typeKey && ALL_REPORT_TYPES.includes(typeKey)
        ? reportTypeLabel(typeKey, (report.locale as Locale) || locale)
        : typeKey ?? "—";

    return (
      <article className="rounded-2xl border border-plum/15 bg-white/70 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-plum">{report.person_name}</p>
            <p className="text-sm text-plum/70">{report.email}</p>
            <p className="mt-1 text-xs text-plum/55">
              {typeLabel} · {report.locale} · ID: {report.id}
            </p>
          </div>
          <div className="text-right text-xs text-plum/65">
            <p>status: {report.status}</p>
            <p>email: {report.email_status}</p>
          </div>
        </div>
        {webUrl && (
          <p className="mt-3 break-all text-sm text-channel-saju">{webUrl}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {webUrl && (
            <a
              href={webUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-channel-saju px-3 py-1.5 text-xs font-semibold text-white"
            >
              웹 리포트 열기
            </a>
          )}
          <button
            type="button"
            disabled={actionId === report.id}
            onClick={() => void resendEmail(report.id)}
            className="rounded-full border border-plum/20 px-3 py-1.5 text-xs text-plum"
          >
            이메일 재발송
          </button>
          <button
            type="button"
            disabled={actionId === `${report.id}-link`}
            onClick={() => void refreshWebLink(report.id)}
            className="rounded-full border border-plum/20 px-3 py-1.5 text-xs text-plum"
          >
            링크 재발급
          </button>
        </div>
        {report.email_error && (
          <p className="mt-2 text-xs text-red-700/80">{report.email_error}</p>
        )}
      </article>
    );
  }

  if (isAnonymous || !accessToken) {
    return (
      <p className="rounded-2xl bg-blush/30 px-4 py-3 text-sm text-plum">
        관리자 계정으로 로그인한 뒤 이용해 주세요.
      </p>
    );
  }

  const doneCount = batchItems.filter((i) => i.status === "done").length;
  const errorCount = batchItems.filter((i) => i.status === "error").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/75">
          결제 없이 인간용 Premium 리포트를 생성하고 이메일·링크 A/S를 테스트합니다.
        </p>
        <Link
          href="/admin"
          className="text-sm font-semibold text-[#ffd7ff] underline underline-offset-2 hover:text-white"
        >
          ← 관리자 홈
        </Link>
      </div>

      <form
        className="pastel-card space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          void generateReportBatch();
        }}
      >
        <h2 className="text-lg font-bold text-plum">무결제 테스트 생성</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="pastel-input"
            placeholder="이름"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            required
          />
          <input
            className="pastel-input"
            placeholder="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <select
            className="pastel-input"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
          </select>
          <select
            className="pastel-input"
            value={calendarType}
            onChange={(e) => setCalendarType(e.target.value as CalendarType)}
          >
            <option value="solar">양력</option>
            <option value="lunar">음력</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-plum">리포트 종류</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllTypes}
                disabled={loading || allSelected}
                className="rounded-full border border-plum/20 px-3 py-1 text-xs font-semibold text-plum disabled:opacity-50"
              >
                전체 선택
              </button>
              <button
                type="button"
                onClick={clearAllTypes}
                disabled={loading || selectedTypes.length === 0}
                className="rounded-full border border-plum/20 px-3 py-1 text-xs font-semibold text-plum disabled:opacity-50"
              >
                전체 해제
              </button>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {ALL_REPORT_TYPES.map((type) => (
              <label
                key={type}
                className="flex cursor-pointer items-start gap-2 rounded-xl border border-plum/10 bg-white/60 px-3 py-2 text-sm text-plum"
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selectedTypes.includes(type)}
                  disabled={loading}
                  onChange={() => toggleType(type)}
                />
                <span>
                  <span className="font-semibold">{reportTypeLabel(type, locale)}</span>
                  <span className="mt-0.5 block text-xs text-plum/55">{type}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="text-xs text-plum/55">
            선택 {selectedTypes.length}종 · 순차 생성 (동시 호출 없음)
          </p>
        </div>

        <BirthDateSelect
          value={birthDate}
          onChange={setBirthDate}
          label="생년월일"
          locale={locale}
        />

        <select
          className="pastel-input"
          value={birthTime}
          onChange={(e) => setBirthTime(e.target.value)}
        >
          {BIRTH_TIME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {getBirthTimeOptionLabel(o, locale)}
            </option>
          ))}
        </select>

        <select
          className="pastel-input"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        >
          {timezoneOptions.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>

        <select
          className="pastel-input"
          value={gender}
          onChange={(e) => setGender(e.target.value as "" | "male" | "female")}
        >
          <option value="">성별 미입력 (대운 순·역행 후보)</option>
          <option value="male">남</option>
          <option value="female">여</option>
        </select>

        <PrivacyConsent
          checked={consent}
          onChange={setConsent}
          locale={locale}
          variant="pastel"
          audience="human"
        />

        <label className="flex items-center gap-2 text-sm text-plum/80">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
          />
          생성 후 Resend 이메일도 발송
        </label>

        {error && (
          <p className="text-sm text-red-700/80" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || selectedTypes.length === 0}
          className="w-full rounded-full bg-channel-saju py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading
            ? `일괄 생성 중… (${doneCount + errorCount}/${batchItems.length || selectedTypes.length})`
            : selectedTypes.length <= 1
              ? "테스트 리포트 생성"
              : `선택 ${selectedTypes.length}종 일괄 생성`}
        </button>
      </form>

      {batchItems.length > 0 && (
        <section className="pastel-card space-y-4 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold text-plum">일괄 생성 진행</h2>
            <p className="text-xs text-plum/55">
              완료 {doneCount} · 실패 {errorCount} · 전체 {batchItems.length}
            </p>
          </div>
          <ul className="space-y-3">
            {batchItems.map((item) => {
              const webUrl = item.webUrl
                ? resolveLocalWebReportUrl(item.webUrl)
                : undefined;
              return (
                <li
                  key={item.reportType}
                  className="rounded-2xl border border-plum/15 bg-white/70 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-plum">
                        {reportTypeLabel(item.reportType, locale)}
                      </p>
                      <p className="text-xs text-plum/55">{item.reportType}</p>
                    </div>
                    <div className="text-right text-xs text-plum/65">
                      <p
                        className={
                          item.status === "error"
                            ? "font-bold text-red-700"
                            : item.status === "done"
                              ? "font-bold text-channel-community"
                              : item.status === "running"
                                ? "font-bold text-channel-saju"
                                : ""
                        }
                      >
                        {statusLabel(item.status)}
                      </p>
                      <p>소요 {formatElapsed(item.elapsedMs)}</p>
                    </div>
                  </div>
                  {item.error && (
                    <p className="mt-2 text-sm text-red-700/80" role="alert">
                      {item.error}
                    </p>
                  )}
                  {webUrl && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <a
                        href={webUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-channel-saju px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        새 탭에서 열기
                      </a>
                      <p className="break-all text-xs text-channel-saju/80">{webUrl}</p>
                    </div>
                  )}
                  {item.report && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={actionId === item.report.id}
                        onClick={() => void resendEmail(item.report!.id)}
                        className="rounded-full border border-plum/20 px-3 py-1.5 text-xs text-plum"
                      >
                        이메일 재발송
                      </button>
                      <button
                        type="button"
                        disabled={actionId === `${item.report.id}-link`}
                        onClick={() => void refreshWebLink(item.report!.id)}
                        className="rounded-full border border-plum/20 px-3 py-1.5 text-xs text-plum"
                      >
                        링크 재발급
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="pastel-card space-y-4 p-6">
        <h2 className="text-lg font-bold text-plum">리포트 검색 / A/S</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="pastel-input flex-1"
            placeholder="이름, 이메일, report_id, 주문번호"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="button"
            disabled={loading || !searchQuery.trim()}
            onClick={() => void searchReports()}
            className="rounded-full border border-plum/20 px-5 py-2 text-sm font-semibold text-plum"
          >
            검색
          </button>
        </div>
        <div className="space-y-3">
          {searchResults.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </section>
    </div>
  );
}
