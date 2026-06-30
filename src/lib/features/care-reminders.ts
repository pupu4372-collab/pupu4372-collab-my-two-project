/** Care calendar reminders on home fortune — opt out with NEXT_PUBLIC_CARE_REMINDERS=false */

export type CareSubscriptionTier = "free" | "premium";

export function isCareRemindersFeatureEnabled() {
  return process.env.NEXT_PUBLIC_CARE_REMINDERS !== "false";
}

/** Max items shown in fortune banner (expand when subscription ships). */
export function careReminderDisplayLimit(tier: CareSubscriptionTier) {
  return tier === "premium" ? 8 : 1;
}

export function resolveCareSubscriptionTier(): CareSubscriptionTier {
  // Placeholder until billing / profiles.subscription_tier exists.
  return "free";
}
