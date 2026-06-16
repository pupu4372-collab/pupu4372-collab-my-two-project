"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

const CATEGORY_OPTIONS = [
  { value: "guide", ko: "이용방법", en: "Guide" },
  { value: "account", ko: "계정 / 로그인", en: "Account / Login" },
  { value: "payment_report", ko: "결제 / 리포트", en: "Payment / Reports" },
  { value: "community", ko: "커뮤니티", en: "Community" },
  { value: "partnership", ko: "제휴문의", en: "Partnership" },
  { value: "general", ko: "기타", en: "General" },
] as const;

export function SupportInquiryForm() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { accessToken, email: sessionEmail } = useSupabaseSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(sessionEmail ?? "");
  const [category, setCategory] = useState("general");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!email && sessionEmail) {
      setEmail(sessionEmail);
    }
  }, [email, sessionEmail]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setFeedback(null);

    try {
      const res = await fetch("/api/support/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ name, email, category, title, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit inquiry.");

      setStatus("success");
      setFeedback(isKo ? "문의가 접수되었습니다. 순서대로 확인해드릴게요." : "Your inquiry has been submitted.");
      setTitle("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setFeedback(err instanceof Error ? err.message : isKo ? "문의 접수에 실패했습니다." : "Failed to submit inquiry.");
    }
  }

  return (
    <section id="support-inquiry" className="relative z-10 mt-10 rounded-[2rem] border border-[#d9c7e6] bg-[#f3edf8] p-6 shadow-[0_12px_28px_rgba(61,42,74,0.14)] md:p-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-plum">1:1 Inquiry</p>
          <h2 className="mt-2 text-2xl font-extrabold text-primary">{isKo ? "사이트 내부 문의 접수" : "Submit an inquiry"}</h2>
        </div>
        <p className="max-w-md text-sm font-semibold leading-6 text-plum">
          {isKo ? "접수된 문의는 관리자 문의함에 저장됩니다." : "Submitted inquiries are saved to the admin inbox."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded-2xl border border-[#d9c7e6] bg-white px-4 py-3 text-sm font-semibold text-primary placeholder:text-plum/45 focus:border-[#c5b0d8] focus:ring-[#e4d7ee]"
          placeholder={isKo ? "이름 또는 닉네임 (선택)" : "Name or nickname (optional)"}
        />
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-2xl border border-[#d9c7e6] bg-white px-4 py-3 text-sm font-semibold text-primary placeholder:text-plum/45 focus:border-[#c5b0d8] focus:ring-[#e4d7ee]"
          placeholder={isKo ? "답변 받을 이메일" : "Reply email"}
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-2xl border border-[#d9c7e6] bg-white px-4 py-3 text-sm font-semibold text-primary focus:border-[#c5b0d8] focus:ring-[#e4d7ee]"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} className="text-[#1b1c1a]">
              {isKo ? option.ko : option.en}
            </option>
          ))}
        </select>
        <input
          required
          minLength={2}
          maxLength={120}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-2xl border border-[#d9c7e6] bg-white px-4 py-3 text-sm font-semibold text-primary placeholder:text-plum/45 focus:border-[#c5b0d8] focus:ring-[#e4d7ee]"
          placeholder={isKo ? "문의 제목" : "Subject"}
        />
        <textarea
          required
          minLength={10}
          maxLength={2000}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="min-h-36 rounded-2xl border border-[#d9c7e6] bg-white px-4 py-3 text-sm font-semibold leading-6 text-primary placeholder:text-plum/45 focus:border-[#c5b0d8] focus:ring-[#e4d7ee] md:col-span-2"
          placeholder={isKo ? "문의 내용을 자세히 적어주세요." : "Tell us what happened."}
        />
        <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center md:justify-between">
          {feedback && (
            <p className={status === "success" ? "text-sm font-bold text-primary" : "text-sm font-bold text-red-600"}>
              {feedback}
            </p>
          )}
          <button
            type="submit"
            disabled={status === "submitting"}
            className="rounded-full bg-[#ffd7ff] px-7 py-4 text-sm font-extrabold text-[#442656] shadow-[0_0_22px_rgba(245,217,255,0.28)] transition hover:bg-white disabled:opacity-60 md:ml-auto"
          >
            {status === "submitting" ? (isKo ? "접수 중..." : "Submitting...") : isKo ? "문의 접수하기" : "Submit inquiry"}
          </button>
        </div>
      </form>
    </section>
  );
}
