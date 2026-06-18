"use client";

import {
  categoryLabel,
  monthBounds,
  PET_CARE_CATEGORIES,
  PET_CARE_CATEGORY_META,
  toDateISO,
} from "@/lib/pet-care/categories";
import type { PetCareCategory, PetCareEvent } from "@/lib/supabase/types";
import { useCallback, useEffect, useMemo, useState } from "react";

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function buildCalendarCells(year: number, month: number) {
  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: Array<{ date: string | null; day: number | null }> = [];

  for (let i = 0; i < firstDow; i++) cells.push({ date: null, day: null });
  for (let day = 1; day <= daysInMonth; day++) {
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    cells.push({ date: `${year}-${mm}-${dd}`, day });
  }
  return cells;
}

export function PetCareCalendar({
  petId,
  petName,
  isKo,
  accessToken,
}: {
  petId: string;
  petName: string;
  isKo: boolean;
  accessToken: string | null;
}) {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(toDateISO(today));
  const [events, setEvents] = useState<PetCareEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [category, setCategory] = useState<PetCareCategory>("other");
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [weightKg, setWeightKg] = useState("");

  const monthLabel = isKo
    ? `${viewYear}년 ${viewMonth}월`
    : new Date(viewYear, viewMonth - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const eventsByDate = useMemo(() => {
    const map = new Map<string, PetCareEvent[]>();
    for (const event of events) {
      const list = map.get(event.event_date) ?? [];
      list.push(event);
      map.set(event.event_date, list);
    }
    return map;
  }, [events]);

  const selectedEvents = eventsByDate.get(selectedDate) ?? [];
  const cells = buildCalendarCells(viewYear, viewMonth);
  const weekdays = isKo ? WEEKDAYS_KO : WEEKDAYS_EN;

  const loadMonth = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    const { from, to } = monthBounds(viewYear, viewMonth);
    try {
      const res = await fetch(`/api/profile/pets/${petId}/care?from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? (isKo ? "일정을 불러오지 못했어요." : "Failed to load events."));
        return;
      }
      setEvents((data.events ?? []) as PetCareEvent[]);
    } catch {
      setError(isKo ? "네트워크 오류" : "Network error");
    } finally {
      setLoading(false);
    }
  }, [accessToken, isKo, petId, viewMonth, viewYear]);

  useEffect(() => {
    void loadMonth();
  }, [loadMonth]);

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth - 1 + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth() + 1);
  }

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken || !title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/profile/pets/${petId}/care`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventDate: selectedDate,
          category,
          title: title.trim(),
          memo: memo.trim() || undefined,
          weightKg: category === "weight" && weightKg ? weightKg : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? (isKo ? "저장에 실패했어요." : "Failed to save."));
        return;
      }
      setTitle("");
      setMemo("");
      setWeightKg("");
      await loadMonth();
    } catch {
      setError(isKo ? "네트워크 오류" : "Network error");
    } finally {
      setBusy(false);
    }
  }

  async function toggleDone(event: PetCareEvent) {
    if (!accessToken) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/profile/pets/${petId}/care/${event.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isDone: !event.is_done }),
      });
      if (res.ok) await loadMonth();
    } finally {
      setBusy(false);
    }
  }

  async function removeEvent(eventId: string) {
    if (!accessToken) return;
    if (!window.confirm(isKo ? "이 기록을 삭제할까요?" : "Delete this entry?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/profile/pets/${petId}/care/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) await loadMonth();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-primary">
            {isKo ? "생육·케어 캘린더" : "Care calendar"}
          </h2>
          <p className="mt-1 text-sm text-plum/80">
            {isKo
              ? `${petName}의 체중·접종·병원·루틴을 날짜별로 기록해요.`
              : `Track ${petName}'s weight, vet visits, and daily care by date.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="rounded-full border border-plum/15 bg-white px-3 py-1.5 text-sm font-bold text-primary transition hover:bg-[#f5f3ef]"
            aria-label={isKo ? "이전 달" : "Previous month"}
          >
            ‹
          </button>
          <span className="min-w-[8.5rem] text-center text-sm font-bold text-primary">{monthLabel}</span>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="rounded-full border border-plum/15 bg-white px-3 py-1.5 text-sm font-bold text-primary transition hover:bg-[#f5f3ef]"
            aria-label={isKo ? "다음 달" : "Next month"}
          >
            ›
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-700/85" role="alert">
          {error}
        </p>
      )}

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-plum/65">
        {weekdays.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, index) => {
          if (!cell.date) {
            return <div key={`empty-${index}`} className="aspect-square" aria-hidden />;
          }
          const dayEvents = eventsByDate.get(cell.date) ?? [];
          const isSelected = cell.date === selectedDate;
          const isToday = cell.date === toDateISO(today);
          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => setSelectedDate(cell.date!)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm transition ${
                isSelected
                  ? "border-channel-saju bg-channel-saju/12 font-bold text-channel-saju"
                  : isToday
                    ? "border-[#b22222]/35 bg-[#fcf9f2] font-semibold text-primary"
                    : "border-transparent bg-white/70 text-plum/80 hover:border-plum/10 hover:bg-white"
              }`}
            >
              {cell.day}
              {dayEvents.length > 0 && (
                <span className="absolute bottom-1 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <span
                      key={ev.id}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: PET_CARE_CATEGORY_META[ev.category].color }}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <p className="text-center text-xs text-plum/60">{isKo ? "불러오는 중…" : "Loading…"}</p>
      )}

      <div className="rounded-2xl border border-plum/10 bg-[#f5f3ef]/80 p-4">
        <p className="text-sm font-bold text-primary">
          {selectedDate}
          {isKo ? " 기록" : " entries"}
          <span className="ml-2 text-xs font-semibold text-plum/65">
            ({selectedEvents.length}
            {isKo ? "건" : ""})
          </span>
        </p>

        {selectedEvents.length === 0 ? (
          <p className="mt-3 text-sm text-plum/75">
            {isKo ? "이 날짜에 등록된 기록이 없어요." : "No entries on this date yet."}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {selectedEvents.map((event) => {
              const meta = PET_CARE_CATEGORY_META[event.category];
              return (
                <li
                  key={event.id}
                  className={`flex items-start gap-3 rounded-xl border border-white bg-white/90 p-3 ${
                    event.is_done ? "opacity-70" : ""
                  }`}
                >
                  <span className="text-xl" aria-hidden>
                    {meta.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-primary">{event.title}</span>
                      <span className="rounded-full bg-[#f5f3ef] px-2 py-0.5 text-[10px] font-bold text-plum/70">
                        {categoryLabel(event.category, isKo)}
                      </span>
                      {event.weight_kg != null && (
                        <span className="text-xs font-semibold text-[#b22222]">{event.weight_kg}kg</span>
                      )}
                    </div>
                    {event.memo && <p className="mt-1 text-xs leading-5 text-plum/80">{event.memo}</p>}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void toggleDone(event)}
                        className="rounded-full border border-plum/15 px-2.5 py-1 text-[11px] font-bold text-primary transition hover:bg-[#f5f3ef] disabled:opacity-50"
                      >
                        {event.is_done ? (isKo ? "완료 취소" : "Undo") : isKo ? "완료" : "Done"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void removeEvent(event.id)}
                        className="rounded-full border border-red-200 px-2.5 py-1 text-[11px] font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {isKo ? "삭제" : "Delete"}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <form onSubmit={(e) => void addEvent(e)} className="mt-4 space-y-3 border-t border-plum/10 pt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-plum/65">
            {isKo ? "기록 추가" : "Add entry"}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-plum/75">
              {isKo ? "종류" : "Category"}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PetCareCategory)}
                className="pastel-input mt-1 w-full rounded-xl px-3 py-2 text-sm text-primary"
              >
                {PET_CARE_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {PET_CARE_CATEGORY_META[value].emoji} {categoryLabel(value, isKo)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold text-plum/75">
              {isKo ? "제목" : "Title"}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isKo ? "예: 심장사상충 접종" : "e.g. Heartworm vaccine"}
                className="pastel-input mt-1 w-full rounded-xl px-3 py-2 text-sm text-primary"
                required
              />
            </label>
          </div>
          {category === "weight" && (
            <label className="block text-xs font-semibold text-plum/75">
              {isKo ? "체중 (kg)" : "Weight (kg)"}
              <input
                type="number"
                step="0.01"
                min="0"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="pastel-input mt-1 w-full rounded-xl px-3 py-2 text-sm text-primary"
              />
            </label>
          )}
          <label className="block text-xs font-semibold text-plum/75">
            {isKo ? "메모 (선택)" : "Memo (optional)"}
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
              className="pastel-input mt-1 w-full rounded-xl px-3 py-2 text-sm text-primary"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !accessToken}
            className="w-full rounded-2xl bg-channel-saju px-4 py-2.5 text-sm font-extrabold text-white transition hover:brightness-105 disabled:opacity-60"
          >
            {busy ? "…" : isKo ? "이 날짜에 저장" : "Save for this date"}
          </button>
        </form>
      </div>
    </div>
  );
}
