import { describe, expect, it } from "vitest";
import { evaluateBonusAnswer } from "../app/lib/bonus";

describe("보너스 묶음 표현", () => {
  it("3묶음 0낱개를 30의 가장 간단한 모습으로 인정한다", () => {
    expect(evaluateBonusAnswer(30, "3-0", "3-0")).toMatchObject({ isCorrect: true, isPreferred: true });
  });

  it("2묶음 10낱개도 같은 30으로 인정하고 다시 묶기를 안내한다", () => {
    const result = evaluateBonusAnswer(30, "2-10", "3-0");
    expect(result).toMatchObject({ isCorrect: true, isPreferred: false });
    expect(result.message).toContain("2묶음 10낱개도 모두 30개");
    expect(result.message).toContain("3묶음 0낱개");
  });

  it("계산 결과가 다른 표현은 다시 계산하도록 안내한다", () => {
    expect(evaluateBonusAnswer(58, "4-8", "5-8")).toMatchObject({ isCorrect: false });
  });
});
