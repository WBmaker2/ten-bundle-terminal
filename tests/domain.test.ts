import { describe, expect, it } from "vitest";
import {
  applyExchange,
  calculateTotal,
  canonicalizeTotal,
  derivePlaceValue,
  undoLastOperation,
  validateQuantityEntry,
} from "../app/lib/math";
import { missions, validateMissionBank } from "../app/lib/missions";

describe("수량 표현", () => {
  it.each([
    [0, 0, 0], [1, 0, 1], [2, 0, 2], [3, 0, 3], [4, 0, 4],
    [5, 0, 5], [6, 0, 6], [7, 0, 7], [8, 0, 8], [9, 0, 9],
    [10, 1, 0], [19, 1, 9], [20, 2, 0], [40, 4, 0], [42, 4, 2],
    [99, 9, 9], [100, 10, 0],
  ])("%i를 %i묶음 %i낱개로 표준화한다", (total, bundles, loose) => {
    expect(canonicalizeTotal(total)).toEqual({ bundles, loose });
  });

  it.each([
    [0, 0, 0], [0, 9, 9], [1, 0, 10], [1, 9, 19], [2, 0, 20],
    [3, 10, 40], [4, 2, 42], [8, 19, 99], [9, 10, 100],
  ])("%i묶음 %i낱개의 전체는 %i이다", (bundles, loose, total) => {
    expect(calculateTotal({ bundles, loose })).toBe(total);
  });
});

describe("묶기와 풀기", () => {
  it("낱개 10개를 십 묶음 하나로 바꾸며 전체를 보존한다", () => {
    const before = { bundles: 0, loose: 19 };
    const result = applyExchange(before, "bundle");
    expect(result).toEqual({ ok: true, value: { bundles: 1, loose: 9 } });
    expect(calculateTotal(result.ok ? result.value : before)).toBe(19);
  });

  it("십 묶음 하나를 낱개 10개로 풀며 전체를 보존한다", () => {
    const before = { bundles: 4, loose: 0 };
    const result = applyExchange(before, "unbundle");
    expect(result).toEqual({ ok: true, value: { bundles: 3, loose: 10 } });
    expect(calculateTotal(result.ok ? result.value : before)).toBe(40);
  });

  it.each([
    [{ bundles: 0, loose: 9 }, "bundle", "not-enough-loose"],
    [{ bundles: 0, loose: 0 }, "unbundle", "no-ten-bundle"],
    [{ bundles: 1, loose: 19 }, "unbundle", "workspace-capacity"],
    [{ bundles: 10, loose: 10 }, "bundle", "ten-bundle-limit"],
  ] as const)("불가능한 조작은 상태를 바꾸지 않는다", (value, action, error) => {
    const result = applyExchange(value, action);
    expect(result).toEqual({ ok: false, error });
    expect(value).toEqual(value);
  });

  it("마지막 조작을 한 단계 되돌린다", () => {
    expect(undoLastOperation({ bundles: 1, loose: 9 }, [{ bundles: 0, loose: 19 }]))
      .toEqual({ value: { bundles: 0, loose: 19 }, history: [] });
  });
});

describe("수량표", () => {
  it.each([
    ["", 42, "empty"], ["04", 4, "leading-zero"], ["101", 100, "out-of-range"],
    ["-1", 1, "digits-only"], ["4a", 4, "digits-only"], ["24", 42, "mismatch"],
    ["42", 42, "correct"], ["0", 0, "correct"], ["100", 100, "correct"],
  ])("입력 %s를 판정한다", (input, target, status) => {
    expect(validateQuantityEntry(input, target).status).toBe(status);
  });
});

describe("자리값", () => {
  it.each([
    [9, 0, 0, 9, 9], [10, 1, 10, 0, 0], [20, 2, 20, 0, 0],
    [40, 4, 40, 0, 0], [42, 4, 40, 2, 2], [99, 9, 90, 9, 9],
  ])("%i의 십과 일을 구분한다", (total, tensDigit, tensValue, onesDigit, onesValue) => {
    expect(derivePlaceValue(total)).toMatchObject({ tensDigit, tensValue, onesDigit, onesValue });
  });

  it("100은 십 묶음 10개이지만 십의 자리 숫자는 0이다", () => {
    expect(derivePlaceValue(100)).toEqual({
      kind: "hundred-boundary", hundredsDigit: 1, tensDigit: 0, onesDigit: 0,
      bundles: 10,
    });
  });
});

describe("고정 미션", () => {
  it("문제은행 전체가 유효하다", () => {
    expect(validateMissionBank(missions)).toEqual([]);
  });

  it.each([
    ["zero-depot", 0], ["single-nine", 9], ["first-ten", 10],
    ["nineteen", 19], ["twenty", 20], ["unpack-forty", 40],
    ["reverse-forty-two", 42], ["ninety-nine", 99], ["hundred-gate", 100],
  ])("%s 미션의 전체는 %i이다", (id, total) => {
    expect(missions.find((mission) => mission.id === id)?.total).toBe(total);
  });
});
