import { categoryLabel } from "@/lib/pet-care/categories";
import {
  careReminderDisplayLimit,
  isCareRemindersFeatureEnabled,
  resolveCareSubscriptionTier,
  type CareSubscriptionTier,
} from "@/lib/features/care-reminders";
import { KST_TIMEZONE } from "@/lib/saju/jiji-hours";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, PetCareCategory } from "@/lib/supabase/types";

/** Look-back window for overdue items (mirrors the +7d upcoming window). */
export const CARE_REMINDER_OVERDUE_LOOKBACK_DAYS = 7;

export type PetCareReminderItem = {
  id: string;
  petId: string;
  petName: string;
  eventDate: string;
  category: PetCareCategory;
  title: string;
  daysUntil: number;
  isOverdue: boolean;
  label: string;
};

export type CareRemindersPayload = {
  enabled: boolean;
  subscriptionTier: CareSubscriptionTier;
  overdue: PetCareReminderItem[];
  today: PetCareReminderItem[];
  upcoming: PetCareReminderItem[];
  /** Total pending in window (before display cap). */
  totalPending: number;
};

export function emptyCareReminders(): CareRemindersPayload {
  return {
    enabled: isCareRemindersFeatureEnabled(),
    subscriptionTier: resolveCareSubscriptionTier(),
    overdue: [],
    today: [],
    upcoming: [],
    totalPending: 0,
  };
}

function todayKstISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: KST_TIMEZONE }).format(new Date());
}

function addDaysKstISO(fromISO: string, days: number) {
  const [y, m, d] = fromISO.split("-").map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d + days));
  return new Intl.DateTimeFormat("en-CA", { timeZone: KST_TIMEZONE }).format(shifted);
}

function parseDateISO(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function daysBetween(fromISO: string, toISO: string) {
  return Math.round((parseDateISO(toISO) - parseDateISO(fromISO)) / 86_400_000);
}

function reminderLabel(
  item: Omit<PetCareReminderItem, "label">,
  isKo: boolean
): string {
  const cat = categoryLabel(item.category, isKo);
  if (item.isOverdue) {
    return isKo
      ? `${item.petName} · ${cat} ${item.title} (지난 일정)`
      : `${item.petName} · ${cat} ${item.title} (overdue)`;
  }
  if (item.daysUntil === 0) {
    return isKo ? `오늘 · ${item.petName} · ${cat} ${item.title}` : `Today · ${item.petName} · ${cat} ${item.title}`;
  }
  return isKo
    ? `D-${item.daysUntil} · ${item.petName} · ${cat} ${item.title}`
    : `D-${item.daysUntil} · ${item.petName} · ${cat} ${item.title}`;
}

type DbClient = SupabaseClient<Database>;

export async function fetchPetCareReminders(
  supabase: DbClient,
  ownerId: string,
  petId: string,
  petName: string,
  isKo: boolean
): Promise<CareRemindersPayload> {
  const tier = resolveCareSubscriptionTier();
  const base = emptyCareReminders();

  if (!base.enabled) {
    return base;
  }

  const today = todayKstISO();
  const windowFrom = addDaysKstISO(today, -CARE_REMINDER_OVERDUE_LOOKBACK_DAYS);
  const windowTo = addDaysKstISO(today, 7);

  const { data, error } = await supabase
    .from("pet_care_events")
    .select("id, pet_id, event_date, category, title")
    .eq("user_id", ownerId)
    .eq("pet_id", petId)
    .gte("event_date", windowFrom)
    .lte("event_date", windowTo)
    .order("event_date", { ascending: true })
    .limit(40);

  if (error) {
    return base;
  }

  type Row = {
    id: string;
    pet_id: string;
    event_date: string;
    category: PetCareCategory;
    title: string;
  };

  const rows = (data ?? []) as Row[];
  const overdueItems: PetCareReminderItem[] = [];
  const todayItems: PetCareReminderItem[] = [];
  const upcomingItems: PetCareReminderItem[] = [];

  for (const row of rows) {
    const daysUntil = daysBetween(today, row.event_date);
    const isOverdue = daysUntil < 0;
    const core = {
      id: row.id,
      petId: row.pet_id,
      petName,
      eventDate: row.event_date,
      category: row.category,
      title: row.title,
      daysUntil,
      isOverdue,
    };
    const item: PetCareReminderItem = {
      ...core,
      label: reminderLabel(core, isKo),
    };
    if (isOverdue) {
      overdueItems.push(item);
    } else if (daysUntil === 0) {
      todayItems.push(item);
    } else {
      upcomingItems.push(item);
    }
  }

  // Overdue: nearest-to-today first (not oldest-first pile at the top).
  overdueItems.sort((a, b) => b.daysUntil - a.daysUntil);

  const limit = careReminderDisplayLimit(tier);
  const merged = [...overdueItems, ...todayItems, ...upcomingItems];
  const visible = merged.slice(0, limit);

  return {
    enabled: true,
    subscriptionTier: tier,
    overdue: visible.filter((item) => item.isOverdue),
    today: visible.filter((item) => item.daysUntil === 0),
    upcoming: visible.filter((item) => item.daysUntil > 0),
    totalPending: merged.length,
  };
}

export function flattenCareReminders(payload: CareRemindersPayload) {
  return [...payload.overdue, ...payload.today, ...payload.upcoming];
}
