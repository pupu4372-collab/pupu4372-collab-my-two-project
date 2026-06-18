"use client";

import { flattenCareReminders, type CareRemindersPayload } from "@/lib/pet-care/reminders";
import { Link } from "@/i18n/navigation";

export function PetCareReminderBanner({
  careReminders,
  isKo,
}: {
  careReminders: CareRemindersPayload | undefined;
  isKo: boolean;
}) {
  if (!careReminders?.enabled) return null;

  const items = flattenCareReminders(careReminders);
  if (items.length === 0) return null;

  const petId = items[0]?.petId;
  const isFree = careReminders.subscriptionTier === "free";
  const hiddenCount = isFree ? Math.max(0, careReminders.totalPending - items.length) : 0;

  return (
    <div className="relative z-[2] mb-3">
      <div className="rounded-sm border border-[var(--jig-seal)]/25 bg-[var(--jig-surface)] px-3.5 py-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="human-premium-label-caps text-[11px] text-[var(--jig-seal)]">
            {isKo ? "케어 일정" : "Care schedule"}
          </p>
          {petId && (
            <Link
              href={`/profile/pets/${petId}`}
              className="text-[11px] font-bold text-[var(--jig-ink)] underline decoration-[var(--jig-seal)]/40 underline-offset-2"
            >
              {isKo ? "캘린더" : "Calendar"}
            </Link>
          )}
        </div>
        <ul className="mt-2 space-y-1.5">
          {items.map((item) => (
            <li
              key={item.id}
              className={`text-sm leading-snug ${
                item.isOverdue ? "font-semibold text-[var(--jig-seal)]" : "text-[var(--jig-ink)]"
              }`}
            >
              {item.label}
            </li>
          ))}
        </ul>
        {isFree && (
          <p className="mt-2 text-[11px] leading-5 text-[var(--jig-muted)]">
            {hiddenCount > 0
              ? isKo
                ? `구독 시 전체 일정 알림을 받을 수 있어요 (+${hiddenCount}건 더 있음)`
                : `Subscribe to see all care reminders (+${hiddenCount} more)`
              : isKo
                ? "구독 서비스 오픈 시 푸시·전체 일정 알림을 연동할 예정이에요."
                : "Push and full schedule alerts will come with subscription."}
          </p>
        )}
      </div>
    </div>
  );
}
