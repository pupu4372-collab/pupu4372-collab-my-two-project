export type WithdrawalCooldown = {
  daysRemaining: number;
  availableAt: string;
};

export class WithdrawalCooldownError extends Error {
  readonly code = "withdrawal_cooldown" as const;
  readonly daysRemaining: number;
  readonly availableAt: string;

  constructor(cooldown: WithdrawalCooldown) {
    super("WITHDRAWAL_COOLDOWN");
    this.name = "WithdrawalCooldownError";
    this.daysRemaining = cooldown.daysRemaining;
    this.availableAt = cooldown.availableAt;
  }
}
