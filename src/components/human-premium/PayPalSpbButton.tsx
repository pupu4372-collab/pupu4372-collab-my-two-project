"use client";

import { useEffect, useRef } from "react";

export type PayPalSpbButtonProps = {
  paymentId: string;
  orderName: string;
  totalAmount: number;
  currency: string;
  /** Bound into PortOne customData (object). */
  customData?: Record<string, unknown>;
  onSuccess: (paymentId: string) => void;
  onError: (message: string) => void;
};

type PortOneSdk = {
  loadPaymentUI: (
    request: Record<string, unknown>,
    callbacks: {
      onPaymentSuccess: (response: { paymentId?: string }) => void;
      onPaymentFail: (error: { message?: string } | string) => void;
    }
  ) => Promise<unknown>;
  updateLoadPaymentUIRequest: (request: Record<string, unknown>) => void;
};

function buildSpbRequest(input: {
  paymentId: string;
  orderName: string;
  totalAmount: number;
  currency: string;
  storeId: string;
  channelKey: string;
  customData?: Record<string, unknown>;
}): Record<string, unknown> {
  // totalAmount must already be PortOne units from cart/checkout (`totalAmount`:
  // KRW = won, USD = cents). Do not multiply again here.
  return {
    uiType: "PAYPAL_SPB",
    storeId: input.storeId,
    channelKey: input.channelKey,
    paymentId: input.paymentId,
    orderName: input.orderName,
    totalAmount: input.totalAmount,
    currency: input.currency,
    ...(input.customData ? { customData: input.customData } : {}),
  };
}

/**
 * Renders a single PortOne PayPal SPB button into `.portone-ui-container`.
 * Only one instance should be mounted per page (SDK constraint).
 */
export function PayPalSpbButton({
  paymentId,
  orderName,
  totalAmount,
  currency,
  customData,
  onSuccess,
  onError,
}: PayPalSpbButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const callbacksRef = useRef({ onSuccess, onError });
  callbacksRef.current = { onSuccess, onError };
  const customDataKey = customData ? JSON.stringify(customData) : "";

  useEffect(() => {
    const storeId = process.env.NEXT_PUBLIC_PORTONE_SHOP_ID?.trim() ?? "";
    const channelKey = process.env.NEXT_PUBLIC_PORTONE_PAYPAL_CHANNEL_KEY?.trim() ?? "";
    const PortOne = (window as unknown as { PortOne?: PortOneSdk }).PortOne;

    if (!PortOne?.loadPaymentUI) {
      callbacksRef.current.onError("Payment module unavailable.");
      return;
    }
    if (!storeId || !channelKey) {
      callbacksRef.current.onError("PayPal channel is not configured.");
      return;
    }

    const request = buildSpbRequest({
      paymentId,
      orderName,
      totalAmount,
      currency,
      storeId,
      channelKey,
      customData: customDataKey ? (JSON.parse(customDataKey) as Record<string, unknown>) : undefined,
    });

    if (!loadedRef.current) {
      loadedRef.current = true;
      void PortOne.loadPaymentUI(request, {
        onPaymentSuccess: (response) => {
          const id = String(response?.paymentId ?? paymentId);
          callbacksRef.current.onSuccess(id);
        },
        onPaymentFail: (error) => {
          const message =
            typeof error === "string"
              ? error
              : String(error?.message ?? "Payment failed");
          callbacksRef.current.onError(message);
        },
      }).catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Failed to load PayPal button.";
        callbacksRef.current.onError(message);
      });
      return;
    }

    if (typeof PortOne.updateLoadPaymentUIRequest === "function") {
      PortOne.updateLoadPaymentUIRequest(request);
    }
  }, [paymentId, orderName, totalAmount, currency, customDataKey]);

  useEffect(() => {
    return () => {
      loadedRef.current = false;
      const el = containerRef.current;
      if (el) el.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="portone-ui-container w-full min-h-[45px]"
      data-portone-ui-type="paypal-spb"
    />
  );
}
