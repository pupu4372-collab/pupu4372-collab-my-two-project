/**
 * In-memory lock so useSupabaseSession does not mint a new anon user
 * while an anonymous → permanent upgrade is mid-flight.
 */
let accountPromotionInProgress = false;

export function setAccountPromotionInProgress(value: boolean) {
  accountPromotionInProgress = value;
}

export function isAccountPromotionInProgress() {
  return accountPromotionInProgress;
}

/** Thrown when signup/promotion targets an email that already exists. */
export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super("EMAIL_ALREADY_REGISTERED");
    this.name = "EmailAlreadyRegisteredError";
  }
}
