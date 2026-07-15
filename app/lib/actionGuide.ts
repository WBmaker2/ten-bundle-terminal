import type { ExchangeAction } from "./types";

export const exchangeActionLabels: Readonly<Record<ExchangeAction, string>> = {
  bundle: "낱개 10개 묶기",
  unbundle: "십 묶음 1개 풀기",
};

export function getRequiredActionProgress(
  history: readonly ExchangeAction[],
  required: readonly ExchangeAction[],
): number {
  const maximum = Math.min(history.length, required.length);
  for (let length = maximum; length > 0; length -= 1) {
    const start = history.length - length;
    const matches = required.slice(0, length).every((action, index) => history[start + index] === action);
    if (matches) return length;
  }
  return 0;
}

export function hasCompletedRequiredActions(
  history: readonly ExchangeAction[],
  required: readonly ExchangeAction[],
): boolean {
  return required.length === 0 || getRequiredActionProgress(history, required) === required.length;
}

export function describeRequiredActions(required: readonly ExchangeAction[]): string {
  return required.map((action, index) => `${index + 1}번 '${exchangeActionLabels[action]}'`).join(" → ");
}
