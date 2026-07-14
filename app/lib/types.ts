export type ExchangeAction = "bundle" | "unbundle";

export interface Representation {
  readonly bundles: number;
  readonly loose: number;
}

export type QuantityReviewStatus =
  | "empty"
  | "leading-zero"
  | "out-of-range"
  | "digits-only"
  | "mismatch"
  | "correct";

export interface QuantityReview {
  readonly status: QuantityReviewStatus;
  readonly message: string;
}

export type MissionCheck =
  | { readonly kind: "quantity"; readonly prompt: string }
  | {
      readonly kind: "reading";
      readonly prompt: string;
      readonly options: readonly string[];
      readonly answer: string;
    }
  | {
      readonly kind: "place";
      readonly prompt: string;
      readonly options: readonly number[];
      readonly answer: number;
    };

export interface Mission {
  readonly id: string;
  readonly title: string;
  readonly total: number;
  readonly initial: Representation;
  readonly goal: Representation;
  readonly requiredActions: readonly ExchangeAction[];
  readonly checks: readonly MissionCheck[];
  readonly completion: string;
  readonly reading: string;
  readonly concept: string;
}
