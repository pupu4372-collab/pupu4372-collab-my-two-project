export function isLlmDebugEnabled(): boolean {
  return process.env.LLM_DEBUG === "1";
}

export function llmDebugLog(label: string, data?: Record<string, unknown>): void {
  if (!isLlmDebugEnabled()) return;
  if (data) {
    console.log(label, data);
    return;
  }
  console.log(label);
}
