/** PortOne V2 redirect query fields (see developers.portone.io checkout docs). */
const PORTONE_REDIRECT_KEYS = [
  "paymentId",
  "code",
  "message",
  "pgCode",
  "pgMessage",
] as const;

const CHECKOUT_PARAM_KEYS = [
  "product",
  "petName",
  "species",
  "petGender",
  "birthDate",
  "birthTime",
  "timezone",
  "locale",
  "petId",
  "mbtiType",
  "returnTo",
] as const;

export type PortOneRedirectReturn =
  | { kind: "none" }
  | { kind: "cancel_or_fail"; code: string; message: string | null }
  | { kind: "success_pending_verify"; paymentId: string };

export function parsePortOneRedirectReturn(
  params: URLSearchParams
): PortOneRedirectReturn {
  const code = params.get("code");
  if (code) {
    return {
      kind: "cancel_or_fail",
      code,
      message: params.get("message"),
    };
  }

  const paymentId = params.get("paymentId");
  if (paymentId) {
    return { kind: "success_pending_verify", paymentId };
  }

  return { kind: "none" };
}

export function buildCleanPaymentSearch(params: URLSearchParams): string {
  const clean = new URLSearchParams();
  for (const key of CHECKOUT_PARAM_KEYS) {
    const value = params.get(key);
    if (value) clean.set(key, value);
  }
  return clean.toString();
}

export function stripPortOneRedirectParams(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params.toString());
  for (const key of PORTONE_REDIRECT_KEYS) {
    next.delete(key);
  }
  return next;
}

/** User cancel vs PG failure when distinguishable; otherwise neutral. */
export function portOneReturnNotice(
  code: string,
  locale: "ko" | "en"
): string {
  const isCancel = /cancel/i.test(code);
  if (locale === "ko") {
    return isCancel
      ? "결제가 취소되었어요. 다시 시도할 수 있어요."
      : "결제가 완료되지 않았어요. 다시 시도할 수 있어요.";
  }
  return isCancel
    ? "Payment was cancelled. You can try again."
    : "Payment was not completed. You can try again.";
}
