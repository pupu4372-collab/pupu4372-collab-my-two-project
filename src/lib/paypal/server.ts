import {
  getAppBaseUrl,
  getPayPalApiBase,
  isPayPalConfigured,
  PREMIUM_PRICE_USD,
} from "./config";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_CLIENT_SECRET!;
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const res = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error("PayPal auth failed.");
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export interface CreateOrderResult {
  orderId: string;
  approvalUrl: string | null;
  demo: boolean;
}

export async function createPremiumOrder(): Promise<CreateOrderResult> {
  if (!isPayPalConfigured()) {
    return {
      orderId: `demo-${Date.now()}`,
      approvalUrl: null,
      demo: true,
    };
  }

  const token = await getAccessToken();
  const base = getAppBaseUrl();

  const res = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: PREMIUM_PRICE_USD.toFixed(2),
          },
          description: "K-Saju Pet Premium Lifetime Report",
        },
      ],
      application_context: {
        return_url: `${base}/saju/premium/success`,
        cancel_url: `${base}/saju/premium`,
        brand_name: "K-Saju Pet",
        user_action: "PAY_NOW",
      },
    }),
  });

  const data = (await res.json()) as {
    id: string;
    links?: Array<{ rel: string; href: string }>;
  };

  if (!res.ok) {
    throw new Error("PayPal create order failed.");
  }

  const approval = data.links?.find((l) => l.rel === "approve")?.href ?? null;

  return {
    orderId: data.id,
    approvalUrl: approval,
    demo: false,
  };
}

export interface CaptureResult {
  captureId: string;
  status: string;
  demo: boolean;
}

export async function capturePremiumOrder(orderId: string): Promise<CaptureResult> {
  if (orderId.startsWith("demo-") || !isPayPalConfigured()) {
    return {
      captureId: `demo-cap-${orderId}`,
      status: "COMPLETED",
      demo: true,
    };
  }

  const token = await getAccessToken();
  const res = await fetch(
    `${getPayPalApiBase()}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = (await res.json()) as {
    status: string;
    purchase_units?: Array<{
      payments?: { captures?: Array<{ id: string }> };
    }>;
  };

  if (!res.ok) {
    throw new Error("PayPal capture failed.");
  }

  const captureId =
    data.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? orderId;

  return {
    captureId,
    status: data.status,
    demo: false,
  };
}
