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
import type { HumanPremiumReportRow } from "@/lib/reports/human-premium/types";
import type { Locale } from "@/lib/saju/types";
import { Link } from "@/i18n/navigation";
import { useMemo, useState } from "react";

type CalendarType = "solar" | "lunar";

type ReportResult = HumanPremiumReportRow & { webUrl?: string };

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
  const [locale, setLocale] = useState<Locale>("ko");
  const [personName, setPersonName] = useState("");
  const [email, setEmail] = useState("");
  const [calendarType, setCalendarType] = useState<CalendarType>("solar");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("unknown");
  const [timezone, setTimezone] = useState("Asia/Seoul");
  const [gender, setGender] = useState<"" | "male" | "female">("");
  const [consent, setConsent] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ReportResult[]>([]);
  const [actionId, setActionId] = useState<string | null>(null);

  const petTime = parseBirthTimeSelect(birthTime);
  const timezoneOptions = useMemo(() => {
    const set = new Set<string>([...COMMON_TIMEZONES, timezone]);
    return Array.from(set);
  }, [timezone]);

  function authHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    return headers;
  }

  async function generateReport() {
    setError(null);
    setResult(null);
    if (!consent) {
      setError("개인정보 동의가 필요합니다.");
      return;
    }
    if (!accessToken) {
      setError("관리자 로그인이 필요합니다.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/premium/human/test-generate", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          personName,
          email,
          calendarType,
          birthDate,
          birthTime: petTime.birthTime,
          birthTimeUnknown: petTime.birthTimeUnknown,
          timezone,
          locale,
          privacyConsent: true,
          ...(gender ? { gender } : {}),
          sendEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "생성 실패");

      setResult({ ...data.report, webUrl: data.webUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "생성 실패");
    } finally {
      setLoading(false);
    }
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
      if (result?.id === reportId) {
        setResult({ ...data.report, webUrl: result.webUrl });
      }
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
      if (result?.id === reportId) setResult(updated);
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

    return (
      <article className="rounded-2xl border border-plum/15 bg-white/70 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-plum">{report.person_name}</p>
            <p className="text-sm text-plum/70">{report.email}</p>
            <p className="mt-1 text-xs text-plum/55">ID: {report.id}</p>
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

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-plum/70">
          결제 없이 인간용 Premium 리포트를 생성하고 이메일·링크 A/S를 테스트합니다.
        </p>
        <Link href="/admin" className="text-sm font-semibold text-channel-saju underline">
          ← 관리자 홈
        </Link>
      </div>

      <form
        className="pastel-card space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          void generateReport();
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

        <PrivacyConsent checked={consent} onChange={setConsent} locale={locale} variant="pastel" audience="human" />

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
          disabled={loading}
          className="w-full rounded-full bg-channel-saju py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "처리 중…" : "테스트 리포트 생성"}
        </button>
      </form>

      {result && <ReportCard report={result} />}

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
