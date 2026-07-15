"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { missions, validateMissionBank } from "../lib/missions";
import { APP_VERSION, releaseNotes } from "../lib/release";
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
  const closeMissionReset = useCallback(() => {
    dispatch({ type: "CLOSE_MISSION_RESET" });
    restoreTriggerFocus();
  }, [restoreTriggerFocus]);
  const closeTeacherGuide = useCallback(() => {
    dispatch({ type: "CLOSE_TEACHER_GUIDE" });
    restoreTriggerFocus();
  }, [restoreTriggerFocus]);
  const currentMission = state.view === "mission" ? state.missionIndex + 1 : null;
  const hasProgress = state.view !== "start";

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
        currentMission={currentMission}
        completedCount={state.completed.length}
        totalMissions={missions.length}
        hasProgress={hasProgress}
        onOpenUpdates={(button) => { returnFocusRef.current = button; dispatch({ type: "OPEN_UPDATES" }); }}
        onOpenReset={(button) => { returnFocusRef.current = button; dispatch({ type: "OPEN_RESET" }); }}
      />
      {state.view === "start" && <StartScreen
        onStart={() => dispatch({ type: "START_TUTORIAL" })}
        onOpenTeacherGuide={(button) => { returnFocusRef.current = button; dispatch({ type: "OPEN_TEACHER_GUIDE" }); }}
      />}
      {state.view === "tutorial" && <TutorialScreen step={state.tutorialStep} dispatch={dispatch} />}
      {state.view === "mission" && <MissionScreen
        state={state}
        mission={missions[state.missionIndex]}
        dispatch={dispatch}
        onRequestMissionReset={(button) => { returnFocusRef.current = button; dispatch({ type: "OPEN_MISSION_RESET" }); }}
      />}
      {state.view === "summary" && <SummaryScreen state={state} dispatch={dispatch} onOpenReset={(button) => {
        returnFocusRef.current = button;
        dispatch({ type: "OPEN_RESET" });
      }} />}

      {state.updateHistoryOpen && (
        <AccessibleDialog title="업데이트 내역" onClose={closeUpdates}>
          <ol className="changelog-list">
            {releaseNotes.map((note) => (
              <li key={note.version}>
                <div><strong>v{note.version}</strong><time dateTime={note.date}>{note.displayDate}</time></div>
                <p>{note.summary}</p>
              </li>
            ))}
          </ol>
          <p className="current-version">현재 버전 v{APP_VERSION}</p>
          <button type="button" className="primary-button" onClick={closeUpdates}>확인</button>
        </AccessibleDialog>
      )}

      {state.teacherGuideOpen && (
        <AccessibleDialog title="교사용 활동 안내" onClose={closeTeacherGuide}>
          <div className="teacher-guide-content">
            <p><strong>예상 시간</strong><span>10~15분</span></p>
            <p><strong>핵심 질문</strong><span>“모양이 바뀌었는데 모두 몇 개인지는 왜 그대로일까요?”</span></p>
            <p><strong>관찰할 점</strong><span>학생이 십 묶음 수에 10을 곱하고 낱개를 더해 말하는지 살펴보세요.</span></p>
            <p><strong>수업 범위</strong><span>0~100의 수와 십 묶음·낱개 관계만 다루며 점수와 학생 기록은 남기지 않습니다.</span></p>
          </div>
          <button type="button" className="primary-button" onClick={closeTeacherGuide}>확인</button>
        </AccessibleDialog>
      )}

      {state.missionResetDialogOpen && (
        <AccessibleDialog title="이 미션을 다시 시작할까요?" onClose={closeMissionReset}>
          <p>이번 미션의 택배 모습과 답만 처음으로 돌아가요. 앞에서 완료한 미션은 그대로 남습니다.</p>
          <div className="dialog-actions">
            <button type="button" className="secondary-button" onClick={closeMissionReset}>계속 학습하기</button>
            <button type="button" className="mission-reset-confirm" onClick={() => dispatch({ type: "RESET_MISSION" })}>이 미션 다시 시작</button>
          </div>
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
