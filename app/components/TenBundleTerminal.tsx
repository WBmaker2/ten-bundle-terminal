"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { missions, validateMissionBank } from "../lib/missions";
import { initialSession, sessionReducer } from "../lib/session";
import { AccessibleDialog } from "./AccessibleDialog";
import { AppHeader } from "./AppHeader";
import { MissionScreen, StartScreen, TutorialScreen } from "./LearningScreens";
import { SummaryScreen } from "./SummaryScreen";

export function TenBundleTerminal() {
  const [state, dispatch] = useReducer(sessionReducer, initialSession);
  const shellRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const contentErrors = validateMissionBank(missions);
  const restoreTriggerFocus = useCallback(() => {
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  }, []);
  const closeUpdates = useCallback(() => {
    dispatch({ type: "CLOSE_UPDATES" });
    restoreTriggerFocus();
  }, [restoreTriggerFocus]);
  const closeReset = useCallback(() => {
    dispatch({ type: "CLOSE_RESET" });
    restoreTriggerFocus();
  }, [restoreTriggerFocus]);
  const missionNumber = state.view === "mission" ? state.missionIndex + 1 : state.view === "summary" ? 9 : null;

  useEffect(() => {
    if (shellRef.current) shellRef.current.dataset.hydrated = "true";
  }, []);

  useEffect(() => {
    const heading = document.querySelector<HTMLElement>("main h1, main h2");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus();
    }
  }, [state.view, state.tutorialStep, state.missionIndex, state.phase, state.checkIndex]);

  if (contentErrors.length) {
    return (
      <main className="fatal-error">
        <h1>학습 자료를 확인해 주세요.</h1>
        <p>미션 자료를 안전하게 불러오지 못했어요.</p>
        <button type="button" onClick={() => window.location.reload()}>다시 시작</button>
      </main>
    );
  }

  return (
    <div ref={shellRef} className="app-shell" data-hydrated="false">
      <AppHeader
        missionNumber={missionNumber}
        onOpenUpdates={(button) => { returnFocusRef.current = button; dispatch({ type: "OPEN_UPDATES" }); }}
        onOpenReset={(button) => { returnFocusRef.current = button; dispatch({ type: "OPEN_RESET" }); }}
      />
      {state.view === "start" && <StartScreen onStart={() => dispatch({ type: "START_TUTORIAL" })} />}
      {state.view === "tutorial" && <TutorialScreen step={state.tutorialStep} dispatch={dispatch} />}
      {state.view === "mission" && <MissionScreen state={state} mission={missions[state.missionIndex]} dispatch={dispatch} />}
      {state.view === "summary" && <SummaryScreen state={state} dispatch={dispatch} onOpenReset={(button) => {
        returnFocusRef.current = button;
        dispatch({ type: "OPEN_RESET" });
      }} />}

      {state.updateHistoryOpen && (
        <AccessibleDialog title="업데이트 내역" onClose={closeUpdates}>
          <ol className="changelog-list">
            <li>
              <div><strong>v1.2.0</strong><time dateTime="2026-07-15">2026. 7. 15.</time></div>
              <p>파스텔 종이 공예형 색상, 귀여운 상자 로고와 배지, 학습 여정 안내, 카드·버튼·완료 화면을 밝고 친근하게 개선했습니다.</p>
            </li>
            <li>
              <div><strong>v1.1.1</strong><time dateTime="2026-07-15">2026. 7. 15.</time></div>
              <p>3/9를 포함한 묶기·풀기 미션에 지금 할 일과 단계별 순서를 표시하고, 탐색 뒤에도 올바른 마지막 순서로 통과하도록 개선했습니다.</p>
            </li>
            <li>
              <div><strong>v1.1.0</strong><time dateTime="2026-07-15">2026. 7. 15.</time></div>
              <p>밝은 택배 터미널 삽화와 색상 체계, 택배 상자 모형, 화면별 카드 구성을 개선했습니다.</p>
            </li>
            <li>
              <div><strong>v1.0.0</strong><time dateTime="2026-07-14">2026. 7. 14.</time></div>
              <p>첫 공개: 십 묶음·낱개 버튼 조작, 0~100 고정 미션, 배송 수량표 학습을 추가했습니다.</p>
            </li>
          </ol>
          <button type="button" className="primary-button" onClick={closeUpdates}>확인</button>
        </AccessibleDialog>
      )}

      {state.resetDialogOpen && (
        <AccessibleDialog title="처음부터 다시 할까요?" onClose={closeReset}>
          <p>현재 배송 기록은 이 기기에 저장되지 않아요. 처음 화면으로 돌아가면 지금까지의 진행이 사라집니다.</p>
          <div className="dialog-actions">
            <button type="button" className="secondary-button" onClick={closeReset}>계속 학습하기</button>
            <button type="button" className="danger-button" onClick={() => dispatch({ type: "RESTART" })}>처음부터 다시 하기</button>
          </div>
        </AccessibleDialog>
      )}
    </div>
  );
}
