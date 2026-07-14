import type {
  ExchangeAction,
  QuantityReview,
  Representation,
} from "./types";

export function calculateTotal(value: Representation): number {
  return value.bundles * 10 + value.loose;
}

export function canonicalizeTotal(total: number): Representation {
  if (!Number.isInteger(total) || total < 0 || total > 100) {
    throw new RangeError("전체 수는 0부터 100까지의 정수여야 합니다.");
  }
  return { bundles: Math.floor(total / 10), loose: total % 10 };
}

export function canBundle(value: Representation): boolean {
  return value.loose >= 10 && value.bundles < 10;
}

export function canUnbundle(value: Representation): boolean {
  return value.bundles > 0 && value.loose + 10 <= 19;
}

type ExchangeResult =
  | { readonly ok: true; readonly value: Representation }
  | {
      readonly ok: false;
      readonly error:
        | "not-enough-loose"
        | "no-ten-bundle"
        | "workspace-capacity"
        | "ten-bundle-limit";
    };

export function applyExchange(
  value: Representation,
  action: ExchangeAction,
): ExchangeResult {
  if (action === "bundle") {
    if (value.bundles >= 10) return { ok: false, error: "ten-bundle-limit" };
    if (value.loose < 10) return { ok: false, error: "not-enough-loose" };
    return {
      ok: true,
      value: { bundles: value.bundles + 1, loose: value.loose - 10 },
    };
  }

  if (value.bundles === 0) return { ok: false, error: "no-ten-bundle" };
  if (value.loose + 10 > 19) {
    return { ok: false, error: "workspace-capacity" };
  }
  return {
    ok: true,
    value: { bundles: value.bundles - 1, loose: value.loose + 10 },
  };
}

export function undoLastOperation(
  current: Representation,
  history: readonly Representation[],
): { value: Representation; history: Representation[] } {
  const previous = history.at(-1);
  if (!previous) return { value: current, history: [] };
  return { value: previous, history: history.slice(0, -1) };
}

export function validateQuantityEntry(
  input: string,
  target: number,
): QuantityReview {
  if (input === "") {
    return { status: "empty", message: "수량표에 숫자를 써 보세요." };
  }
  if (!/^\d+$/.test(input)) {
    return { status: "digits-only", message: "0부터 9까지 숫자만 써요." };
  }
  if (input.length > 1 && input.startsWith("0")) {
    return {
      status: "leading-zero",
      message: `${input}는 ${Number(input)}로 써요. 앞의 0을 지워 보세요.`,
    };
  }
  const numeric = Number(input);
  if (numeric < 0 || numeric > 100) {
    return { status: "out-of-range", message: "0부터 100까지 쓸 수 있어요." };
  }
  if (numeric !== target) {
    return {
      status: "mismatch",
      message:
        target === 42 && numeric === 24
          ? "십 묶음 수부터 살펴보세요. 4묶음은 40개예요."
          : "십 묶음과 낱개를 다시 세어 보세요.",
    };
  }
  return { status: "correct", message: `맞아요. 모두 ${target}개예요.` };
}

export function derivePlaceValue(total: number) {
  if (total === 100) {
    return {
      kind: "hundred-boundary" as const,
      hundredsDigit: 1,
      tensDigit: 0,
      onesDigit: 0,
      bundles: 10,
    };
  }
  const tensDigit = Math.floor(total / 10);
  const onesDigit = total % 10;
  return {
    kind: "ones-tens" as const,
    tensDigit,
    tensValue: tensDigit * 10,
    onesDigit,
    onesValue: onesDigit,
  };
}
