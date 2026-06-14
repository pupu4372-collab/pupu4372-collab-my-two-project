import { renderHumanPremiumReportPdf } from "./pdf";
import {
  downloadHumanPremiumPdf,
  uploadHumanPremiumPdf,
} from "./storage";
import type {
  HumanPremiumReportPayload,
  HumanPremiumReportRow,
} from "./types";

const inFlight = new Map<string, Promise<void>>();

export function humanPremiumPdfNeedsPrewarm(row: HumanPremiumReportRow): boolean {
  return !row.pdf_storage_path;
}

export async function getOrRenderHumanPremiumPdf(
  row: HumanPremiumReportRow,
  payload: HumanPremiumReportPayload
): Promise<Buffer> {
  if (row.pdf_storage_path) {
    try {
      return await downloadHumanPremiumPdf(row.pdf_storage_path);
    } catch (error) {
      console.error("Cached PDF download failed, regenerating", error);
    }
  }

  const pdf = await renderHumanPremiumReportPdf(payload);
  uploadHumanPremiumPdf(row.id, pdf).catch((error) => {
    console.error("PDF cache upload failed", error);
  });
  return pdf;
}

export function scheduleHumanPremiumPdfPrewarm(
  row: HumanPremiumReportRow,
  payload: HumanPremiumReportPayload
): void {
  if (!humanPremiumPdfNeedsPrewarm(row)) return;
  if (inFlight.has(row.id)) return;

  const job = getOrRenderHumanPremiumPdf(row, payload)
    .then(() => undefined)
    .finally(() => {
      inFlight.delete(row.id);
    });

  inFlight.set(row.id, job);
  void job.catch((error) => {
    console.error("PDF prewarm failed", error);
  });
}
