"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import type { Notice, NoticeLocale } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";
import { useCallback, useEffect, useState } from "react";

const EMPTY_FORM = {
  title: "",
  body: "",
  locale: "ko" as NoticeLocale,
  is_pinned: false,
  show_home_banner: false,
  published_at: "",
};

function toDatetimeLocalValue(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): string {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export function AdminNoticesManager() {
  const { accessToken, isAnonymous } = useSupabaseSession();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/notices", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "공지 목록을 불러오지 못했습니다.");
      setNotices(data.notices ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "공지 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  function startCreate() {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      published_at: toDatetimeLocalValue(new Date().toISOString()),
    });
  }

  function startEdit(notice: Notice) {
    setEditingId(notice.id);
    setForm({
      title: notice.title,
      body: notice.body,
      locale: notice.locale,
      is_pinned: notice.is_pinned,
      show_home_banner: notice.show_home_banner,
      published_at: toDatetimeLocalValue(notice.published_at),
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!accessToken || saving) return;
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title,
      body: form.body,
      locale: form.locale,
      is_pinned: form.is_pinned,
      show_home_banner: form.show_home_banner,
      published_at: fromDatetimeLocalValue(form.published_at),
    };

    try {
      const res = await fetch(editingId ? `/api/admin/notices/${editingId}` : "/api/admin/notices", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "저장에 실패했습니다.");
      setEditingId(null);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePinned(notice: Notice) {
    if (!accessToken) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/notices/${notice.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_pinned: !notice.is_pinned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "고정 상태 변경 실패");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "고정 상태 변경 실패");
    }
  }

  async function toggleHomeBanner(notice: Notice) {
    if (!accessToken) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/notices/${notice.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ show_home_banner: !notice.show_home_banner }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "홈 배너 상태 변경 실패");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "홈 배너 상태 변경 실패");
    }
  }

  async function handleDelete(notice: Notice) {
    if (!accessToken) return;
    if (!window.confirm(`공지를 삭제할까요?\n\n${notice.title}`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/notices/${notice.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "삭제 실패");
      if (editingId === notice.id) {
        setEditingId(null);
        setForm(EMPTY_FORM);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 실패");
    }
  }

  if (isAnonymous) {
    return (
      <p className="text-sm text-plum/65">
        관리자 계정으로 로그인하면 공지를 관리할 수 있어요.{" "}
        <Link href="/login" className="underline">
          로그인
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-white/35 bg-white/95 p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-primary">
              {editingId ? "공지 수정" : "공지 작성"}
            </h2>
            <p className="mt-1 text-sm text-plum/65">플레인 텍스트 · ko/en 각각 등록</p>
          </div>
          {editingId ? (
            <button
              type="button"
              onClick={startCreate}
              className="rounded-full border border-plum/20 bg-white px-4 py-2 text-xs font-bold text-plum"
            >
              새 공지로 전환
            </button>
          ) : null}
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 grid gap-4">
          <input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
            maxLength={200}
            className="rounded-2xl border border-plum/15 bg-sand/40 px-4 py-3 text-sm font-semibold text-primary"
            placeholder="제목"
          />
          <textarea
            value={form.body}
            onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
            required
            rows={8}
            maxLength={10000}
            className="rounded-2xl border border-plum/15 bg-sand/40 px-4 py-3 text-sm font-semibold leading-6 text-primary"
            placeholder="본문 (플레인 텍스트)"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-bold text-plum">
              로케일
              <select
                value={form.locale}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, locale: e.target.value as NoticeLocale }))
                }
                className="mt-1 w-full rounded-2xl border border-plum/15 bg-white px-3 py-2.5 text-sm font-semibold text-primary"
              >
                <option value="ko">ko</option>
                <option value="en">en</option>
              </select>
            </label>
            <label className="text-sm font-bold text-plum">
              게시 시각
              <input
                type="datetime-local"
                value={form.published_at}
                onChange={(e) => setForm((prev) => ({ ...prev, published_at: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-plum/15 bg-white px-3 py-2.5 text-sm font-semibold text-primary"
              />
            </label>
            <label className="flex items-end gap-2 pb-2 text-sm font-bold text-plum">
              <input
                type="checkbox"
                checked={form.is_pinned}
                onChange={(e) => setForm((prev) => ({ ...prev, is_pinned: e.target.checked }))}
                className="h-4 w-4"
              />
              커뮤니티 상단 고정
            </label>
            <label className="flex items-end gap-2 pb-2 text-sm font-bold text-plum">
              <input
                type="checkbox"
                checked={form.show_home_banner}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, show_home_banner: e.target.checked }))
                }
                className="h-4 w-4"
              />
              홈 배너 노출
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-fit rounded-full bg-channel-saju px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-60"
          >
            {saving ? "저장 중…" : editingId ? "수정 저장" : "공지 등록"}
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-white">공지 목록</h2>
        {error ? <p className="text-sm font-semibold text-red-200">{error}</p> : null}
        {loading ? (
          <p className="text-sm text-white/70">불러오는 중…</p>
        ) : notices.length === 0 ? (
          <p className="text-sm text-white/70">등록된 공지가 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {notices.map((notice) => (
              <li
                key={notice.id}
                className="rounded-[1.5rem] border border-white/35 bg-white/95 p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-plum/65">
                      <span className="rounded-full bg-sand px-2.5 py-1 uppercase">{notice.locale}</span>
                      {notice.is_pinned ? (
                        <span className="rounded-full bg-channel-community/15 px-2.5 py-1 text-channel-community">
                          PIN
                        </span>
                      ) : null}
                      {notice.show_home_banner ? (
                        <span className="rounded-full bg-[#3d5a8c]/10 px-2.5 py-1 text-[#3d5a8c]">
                          HOME
                        </span>
                      ) : null}
                      <span>{new Date(notice.published_at).toLocaleString("ko-KR")}</span>
                    </div>
                    <h3 className="mt-2 text-base font-extrabold text-primary">{notice.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold text-plum/70">{notice.body}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void togglePinned(notice)}
                      className="rounded-full border border-channel-community/30 bg-white px-3 py-1.5 text-xs font-bold text-channel-community"
                    >
                      {notice.is_pinned ? "고정 해제" : "고정"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleHomeBanner(notice)}
                      className="rounded-full border border-[#3d5a8c]/25 bg-white px-3 py-1.5 text-xs font-bold text-[#3d5a8c]"
                    >
                      {notice.show_home_banner ? "홈배너 해제" : "홈배너"}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(notice)}
                      className="rounded-full border border-plum/20 bg-white px-3 py-1.5 text-xs font-bold text-plum"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(notice)}
                      className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
