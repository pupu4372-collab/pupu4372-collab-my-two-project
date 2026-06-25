interface ResendEmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface ResendEmailResult {
  id: string;
}

function getReportEmailFrom(): string {
  return process.env.REPORT_EMAIL_FROM ?? "K-Saju Pet <jungho@ksajupet.com>";
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendResendEmail({
  to,
  subject,
  html,
  text,
  from,
  replyTo,
}: ResendEmailRequest): Promise<ResendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: from ?? getReportEmailFrom(),
      to,
      subject,
      html,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  const data = (await res.json().catch(() => null)) as
    | { id?: string; message?: string; name?: string }
    | null;

  if (!res.ok || !data?.id) {
    throw new Error(data?.message ?? data?.name ?? "Resend email failed.");
  }

  return { id: data.id };
}
