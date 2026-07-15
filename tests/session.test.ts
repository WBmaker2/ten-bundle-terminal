import { describe, expect, it } from "vitest";
import { getRequiredActionProgress, hasCompletedRequiredActions } from "../app/lib/actionGuide";
import { initialSession, sessionReducer } from "../app/lib/session";

describe("학습 세션", () => {
  it("연습 시작 시 7개 비교 단계가 열린다", () => {
    expect(sessionReducer(initialSession, { type: "START_TUTORIAL" })).toMatchObject({
      view: "tutorial", tutorialStep: "seven",
    });
  });

  it("연습은 7개에서 10개 묶기 단계로 이동한다", () => {
    const state = sessionReducer(initialSession, { type: "START_TUTORIAL" });
    expect(sessionReducer(state, { type: "NEXT_TUTORIAL" }).tutorialStep).toBe("ten");
  });

  it("첫 미션은 고정 순서의 0 미션이다", () => {
    expect(sessionReducer(initialSession, { type: "START_MISSIONS" })).toMatchObject({
      view: "mission", missionIndex: 0, phase: "intro",
    });
  });

  it("조작이 없는 미션은 바로 확인 단계로 연다", () => {
    const state = sessionReducer(initialSession, { type: "START_MISSIONS" });
    const opened = sessionReducer(state, { type: "OPEN_MISSION" });
    expect(opened.phase).toBe("check");
  });

  it("미완료 미션은 다음 배송으로 넘어가지 않는다", () => {
    const state = sessionReducer(initialSession, { type: "START_MISSIONS" });
    expect(sessionReducer(state, { type: "NEXT_MISSION" })).toEqual(state);
  });

  it("업데이트 내역을 열어도 학습 상태가 유지된다", () => {
    const state = sessionReducer(initialSession, { type: "OPEN_UPDATES" });
    expect(state).toMatchObject({ view: "start", updateHistoryOpen: true });
  });

  it("세션 다시 시작은 모든 진행을 초기화한다", () => {
    const state = { ...initialSession, view: "summary" as const, completed: ["zero-depot"] };
    expect(sessionReducer(state, { type: "RESTART" })).toEqual(initialSession);
  });

  it("탐색 뒤 마지막 조작이 필요한 순서이면 완료로 본다", () => {
    const history = ["bundle", "unbundle", "bundle"] as const;
    expect(getRequiredActionProgress(history, ["bundle"])).toBe(1);
    expect(hasCompletedRequiredActions(history, ["bundle"])).toBe(true);
  });

  it("두 단계 조작은 마지막 풀기와 묶기 순서를 모두 확인한다", () => {
    expect(getRequiredActionProgress(["bundle", "unbundle"], ["unbundle", "bundle"])).toBe(1);
    expect(hasCompletedRequiredActions(["bundle", "unbundle", "bundle"], ["unbundle", "bundle"])).toBe(true);
  });
});
