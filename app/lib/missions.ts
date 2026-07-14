import { calculateTotal } from "./math";
import type { Mission } from "./types";

export const missions: readonly Mission[] = [
  {
    id: "zero-depot",
    title: "빈 터미널도 수량이에요",
    total: 0,
    initial: { bundles: 0, loose: 0 },
    goal: { bundles: 0, loose: 0 },
    requiredActions: [],
    checks: [
      { kind: "quantity", prompt: "배송 수량표에 모두 몇 개인지 써 보세요." },
      { kind: "reading", prompt: "0은 어떻게 읽을까요?", options: ["영", "구", "십"], answer: "영" },
    ],
    completion: "아무것도 없는 수량도 0으로 나타내요.",
    reading: "영",
    concept: "0묶음 · 0낱개",
  },
  {
    id: "single-nine",
    title: "낱개 아홉 상자",
    total: 9,
    initial: { bundles: 0, loose: 9 },
    goal: { bundles: 0, loose: 9 },
    requiredActions: [],
    checks: [
      { kind: "quantity", prompt: "배송 수량표에 모두 몇 개인지 써 보세요." },
      { kind: "reading", prompt: "9는 어떻게 읽을까요?", options: ["구", "영", "십구"], answer: "구" },
    ],
    completion: "9는 십 묶음이 없는 한 자리 수예요.",
    reading: "구",
    concept: "0묶음 · 9낱개",
  },
  {
    id: "first-ten",
    title: "처음 만드는 십 묶음",
    total: 10,
    initial: { bundles: 0, loose: 10 },
    goal: { bundles: 1, loose: 0 },
    requiredActions: ["bundle"],
    checks: [{ kind: "quantity", prompt: "묶은 뒤 모두 몇 개인지 써 보세요." }],
    completion: "낱개 10개는 십 묶음 1개와 같아요.",
    reading: "십",
    concept: "1묶음 · 0낱개",
  },
  {
    id: "nineteen",
    title: "열아홉 상자 정리",
    total: 19,
    initial: { bundles: 0, loose: 19 },
    goal: { bundles: 1, loose: 9 },
    requiredActions: ["bundle"],
    checks: [{ kind: "reading", prompt: "19는 어떻게 읽을까요?", options: ["구십", "십구", "이십"], answer: "십구" }],
    completion: "10개를 묶고 낱개 9개가 남아도 모두 19개예요.",
    reading: "십구",
    concept: "1묶음 · 9낱개",
  },
  {
    id: "twenty",
    title: "스무 상자 배송",
    total: 20,
    initial: { bundles: 1, loose: 10 },
    goal: { bundles: 2, loose: 0 },
    requiredActions: ["bundle"],
    checks: [{ kind: "quantity", prompt: "배송 수량표에 모두 몇 개인지 써 보세요." }],
    completion: "십 묶음 2개는 20개이고 낱개는 0개예요.",
    reading: "이십",
    concept: "2묶음 · 0낱개",
  },
  {
    id: "reverse-forty-two",
    title: "마흔두 상자 수량표",
    total: 42,
    initial: { bundles: 4, loose: 2 },
    goal: { bundles: 4, loose: 2 },
    requiredActions: [],
    checks: [
      { kind: "quantity", prompt: "42와 24의 순서를 살펴보고 수량을 써 보세요." },
      { kind: "place", prompt: "십 묶음 4개는 몇 개일까요?", options: [4, 24, 40], answer: 40 },
    ],
    completion: "십 묶음 4개는 40개이고 낱개 2개를 더하면 42개예요.",
    reading: "사십이",
    concept: "4묶음 · 2낱개",
  },
  {
    id: "unpack-forty",
    title: "마흔 상자 풀었다 묶기",
    total: 40,
    initial: { bundles: 4, loose: 0 },
    goal: { bundles: 4, loose: 0 },
    requiredActions: ["unbundle", "bundle"],
    checks: [{ kind: "reading", prompt: "40은 어떻게 읽을까요?", options: ["사십", "사십 영", "십사"], answer: "사십" }],
    completion: "풀었다가 다시 묶어도 전에도 지금도 모두 40개예요.",
    reading: "사십",
    concept: "4묶음 · 0낱개",
  },
  {
    id: "ninety-nine",
    title: "아흔아홉 상자 마감",
    total: 99,
    initial: { bundles: 8, loose: 19 },
    goal: { bundles: 9, loose: 9 },
    requiredActions: ["bundle"],
    checks: [{ kind: "quantity", prompt: "9묶음과 9낱개는 모두 몇 개인가요?" }],
    completion: "90과 9를 합한 99는 구십구라고 읽어요.",
    reading: "구십구",
    concept: "9묶음 · 9낱개",
  },
  {
    id: "hundred-gate",
    title: "백으로 가는 마지막 문",
    total: 100,
    initial: { bundles: 9, loose: 10 },
    goal: { bundles: 10, loose: 0 },
    requiredActions: ["bundle"],
    checks: [{ kind: "quantity", prompt: "십 묶음 10개는 모두 몇 개인가요?" }],
    completion: "십 묶음 10개는 100개이고 백 1개와 같아요. 100은 백·십·일 자리에서 1·0·0이에요.",
    reading: "백",
    concept: "10묶음 · 0낱개",
  },
] as const;

export function validateMissionBank(bank: readonly Mission[]): string[] {
  const errors: string[] = [];
  const expectedTotals = [0, 9, 10, 19, 20, 42, 40, 99, 100];
  if (bank.length !== 9) errors.push("미션은 정확히 9개여야 합니다.");
  if (new Set(bank.map((mission) => mission.id)).size !== bank.length) {
    errors.push("미션 ID가 중복되었습니다.");
  }
  bank.forEach((mission, index) => {
    if (mission.total !== expectedTotals[index]) errors.push(`${mission.id}: 순서 오류`);
    if (calculateTotal(mission.initial) !== mission.total) errors.push(`${mission.id}: 시작 수량 오류`);
    if (calculateTotal(mission.goal) !== mission.total) errors.push(`${mission.id}: 목표 수량 오류`);
    if (mission.initial.loose > 19 || mission.goal.loose > 19) errors.push(`${mission.id}: 작업대 초과`);
    if (mission.checks.length < 1 || mission.checks.length > 2) errors.push(`${mission.id}: 확인 단계 오류`);
  });
  return errors;
}
