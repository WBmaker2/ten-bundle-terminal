"use client";

import Image from "next/image";
import { canBundle, canUnbundle, calculateTotal } from "../lib/math";
import type { SessionAction, SessionState } from "../lib/session";
import type { Mission } from "../lib/types";
import { getRequiredActionProgress } from "../lib/actionGuide";
import { ActionGuide } from "./ActionGuide";
import { BundleIcon, UnbundleIcon, UndoIcon } from "./ActionIcons";
import { CheckPanel } from "./CheckPanel";
import { ParcelVisual } from "./ParcelVisual";

export function StartScreen({ onStart, onOpenTeacherGuide }: {
  readonly onStart: () => void;
  readonly onOpenTeacherGuide: (button: HTMLButtonElement) => void;
}) {
  return (
    <main className="screen start-screen">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="hero-kicker"><span aria-hidden="true">📦</span> 오늘의 수학 배송 놀이</p>
          <h1 className="hero-title" aria-label="십 묶음 택배 터미널">
            <span aria-hidden="true">십 묶음</span>
            <span aria-hidden="true">택배 터미널</span>
          </h1>
          <p className="hero-lead"><strong>10개가 모이면 십 묶음 1개</strong>가 돼요.</p>
          <p>택배를 묶거나 풀어도 모두 몇 개인지는 그대로인지 확인해 보세요.</p>
          <div className="learning-route" aria-label="학습 순서: 살펴보기, 묶어 보기, 배송 정리">
            <span><b>1</b> 살펴보기</span><i aria-hidden="true">→</i>
            <span><b>2</b> 묶어 보기</span><i aria-hidden="true">→</i>
            <span><b>3</b> 배송 정리</span>
          </div>
          <button type="button" className="primary-button large" onClick={onStart}>연습 시작 <span aria-hidden="true">→</span></button>
        </div>
        <figure className="hero-visual">
          <span className="hero-sticker" aria-hidden="true">10개가 모이면 출발!</span>
          <Image
            className="hero-art"
            src="/images/parcel-terminal-hero-v1.webp"
            width="1400"
            height="768"
            alt=""
            priority
            sizes="(max-width: 900px) calc(100vw - 60px), 52vw"
            unoptimized
          />
          <figcaption className="hero-demo" role="img" aria-label="낱개 10개와 십 묶음 1개가 같습니다.">
            <div className="demo-group" aria-hidden="true">
              <div className="mini-loose">{Array.from({ length: 10 }, (_, index) => <span key={index} />)}</div>
              <strong>낱개 10개</strong>
            </div>
            <span className="equals" aria-hidden="true">=</span>
            <div className="mini-bundle" aria-hidden="true"><strong>10</strong><span>십 묶음 1개</span></div>
          </figcaption>
        </figure>
      </section>
      <div className="trust-row" aria-label="앱 안내">
        <span><b aria-hidden="true">🧭</b><strong>고정 9개 미션</strong><small>길을 잃지 않아요</small></span>
        <span><b aria-hidden="true">🌱</b><strong>점수 없이 차근차근</strong><small>내 속도로 배워요</small></span>
        <span><b aria-hidden="true">🔒</b><strong>학생 정보 저장 안 함</strong><small>안심하고 연습해요</small></span>
      </div>
      <button type="button" className="teacher-guide-button" onClick={(event) => onOpenTeacherGuide(event.currentTarget)}>
        교사용 활동 안내
      </button>
    </main>
  );
}

interface TutorialProps {
  readonly step: SessionState["tutorialStep"];
  readonly dispatch: React.Dispatch<SessionAction>;
}

export function TutorialScreen({ step, dispatch }: TutorialProps) {
  if (step === "seven") {
    return (
      <main className="screen narrow-screen">
        <p className="eyebrow">짧은 연습 · 1/2</p>
        <h1>낱개를 살펴봐요</h1>
        <p className="screen-lead">낱개가 7개 있어요. 아직 10개가 아니므로 묶을 수 없어요.</p>
        <ParcelVisual value={{ bundles: 0, loose: 7 }} />
        <button type="button" className="primary-button" onClick={() => dispatch({ type: "NEXT_TUTORIAL" })}>10개도 보기</button>
      </main>
    );
  }
  if (step === "ten") {
    return (
      <main className="screen narrow-screen">
        <p className="eyebrow">짧은 연습 · 2/2</p>
        <h1>10개를 한 묶음으로</h1>
        <p className="screen-lead">낱개가 딱 10개 모였어요. 버튼을 눌러 한 묶음으로 정리해 보세요.</p>
        <ParcelVisual value={{ bundles: 0, loose: 10 }} />
        <button type="button" className="primary-button" onClick={() => dispatch({ type: "BUNDLE_TUTORIAL" })}>낱개 10개 묶기</button>
      </main>
    );
  }
  return (
    <main className="screen narrow-screen celebration-screen">
      <p className="eyebrow">연습 완료</p>
      <h1>같은 수, 다른 모습!</h1>
      <ParcelVisual value={{ bundles: 1, loose: 0 }} />
      <p className="success-copy">낱개 10개와 십 묶음 1개는 같은 수예요. 모두 10개예요.</p>
      <button type="button" className="primary-button" onClick={() => dispatch({ type: "START_MISSIONS" })}>배송 시작</button>
    </main>
  );
}

interface MissionScreenProps {
  readonly state: SessionState;
  readonly mission: Mission;
  readonly dispatch: React.Dispatch<SessionAction>;
  readonly onRequestMissionReset: (button: HTMLButtonElement) => void;
}

export function MissionScreen({ state, mission, dispatch, onRequestMissionReset }: MissionScreenProps) {
  if (state.phase === "intro") {
    return (
      <main className="screen narrow-screen mission-intro">
        <p className="eyebrow">{state.isReplay ? `미션 복습 · ${state.missionIndex + 1}번째` : `배송 미션 ${state.missionIndex + 1}`}</p>
        <h1>{mission.title}</h1>
        <p className="mission-total"><span>배송할 택배</span><strong>{mission.total}개</strong></p>
        <ParcelVisual value={mission.initial} compact />
        <div className="mission-brief">
          <span>이번 목표</span>
          <strong>{mission.requiredActions.length ? mission.requiredActions.map((action) => action === "bundle" ? "10개 묶기" : "1묶음 풀기").join(" → ") : "현재 모습을 그대로 읽고 쓰기"}</strong>
        </div>
        <button type="button" className="primary-button" onClick={() => dispatch({ type: "OPEN_MISSION" })}>미션 열기</button>
      </main>
    );
  }

  if (state.phase === "exchange") {
    const bundleDisabled = !canBundle(state.current);
    const unbundleDisabled = !canUnbundle(state.current);
    const actionProgress = getRequiredActionProgress(state.actionHistory, mission.requiredActions);
    const nextAction = mission.requiredActions[actionProgress];
    return (
      <main className="screen board-screen">
        <div className="board-heading">
          <div><p className="eyebrow">택배 작업대</p><h1>{mission.title}</h1></div>
          <div className="board-tools">
            <span className="locked-total">전체 {mission.total}개 · 수량 잠금</span>
            <button type="button" className="mission-reset-button" onClick={(event) => onRequestMissionReset(event.currentTarget)}>이 미션 다시 시작</button>
          </div>
        </div>
        <ActionGuide required={mission.requiredActions} history={state.actionHistory} />
        <div className="exchange-controls" aria-label="택배 묶기와 풀기 조작" aria-describedby="action-guide-status">
          <button type="button" className={`exchange-button bundle-button ${nextAction === "bundle" ? "next-action-button" : ""}`} onClick={() => dispatch({ type: "APPLY_EXCHANGE", action: "bundle" })} disabled={bundleDisabled}><BundleIcon /> 낱개 10개 묶기</button>
          <button type="button" className={`exchange-button unbundle-button ${nextAction === "unbundle" ? "next-action-button" : ""}`} onClick={() => dispatch({ type: "APPLY_EXCHANGE", action: "unbundle" })} disabled={unbundleDisabled}><UnbundleIcon /> 십 묶음 1개 풀기</button>
          <button type="button" className="secondary-button undo-button" onClick={() => dispatch({ type: "UNDO_EXCHANGE" })} disabled={!state.history.length}><UndoIcon /> 한 단계 되돌리기</button>
        </div>
        <div className="availability-notes">
          {bundleDisabled && <span>묶기: 낱개 10개가 있어야 해요.</span>}
          {unbundleDisabled && <span>풀기: 묶음이 있고 낱개 자리가 넉넉해야 해요.</span>}
        </div>
        {state.feedback && <p id="mission-feedback" className="feedback" role="status" aria-live="polite" aria-atomic="true">{state.feedback}</p>}
        <details className="parcel-disclosure" open>
          <summary>현재 택배 모습 <strong>모두 {calculateTotal(state.current)}개</strong></summary>
          <ParcelVisual value={state.current} />
        </details>
        <div className="relation-sentence">
          <strong>{state.current.bundles}묶음 × 10 + {state.current.loose}낱개 = {calculateTotal(state.current)}개</strong>
          <span>십 묶음 {state.current.bundles}개는 {state.current.bundles * 10}개예요. 낱개 {state.current.loose}개를 더해도 전체는 그대로예요.</span>
        </div>
        <button type="button" className="primary-button" onClick={() => dispatch({ type: "CHECK_EXCHANGE" })}>묶음 확인</button>
      </main>
    );
  }

  if (state.phase === "check") {
    const check = mission.checks[state.checkIndex];
    return (
      <main className="screen split-screen">
        <div className="screen-utility-bar">
          <span>{state.isReplay ? "복습 중" : `배송 미션 ${state.missionIndex + 1}`}</span>
          <button type="button" className="mission-reset-button" onClick={(event) => onRequestMissionReset(event.currentTarget)}>이 미션 다시 시작</button>
        </div>
        <div className="sticky-summary"><ParcelVisual value={state.current} compact /></div>
        <CheckPanel
          mission={mission}
          check={check}
          numericInput={state.numericInput}
          selection={state.selection}
          feedback={state.feedback}
          onNumericChange={(value) => dispatch({ type: "SET_NUMERIC", value })}
          onSelectionChange={(value) => dispatch({ type: "SET_SELECTION", value })}
          onSubmit={() => dispatch({ type: "SUBMIT_CHECK" })}
        />
      </main>
    );
  }

  return (
    <main className="screen narrow-screen completion-screen">
      <p className="eyebrow">배송 준비 완료</p>
      <h1>{mission.total}개를 정확히 정리했어요</h1>
      <ParcelVisual value={mission.goal} compact />
      <div className="completion-card">
        <p>{mission.completion}</p>
        <div><span>숫자</span><strong>{mission.total}</strong></div>
        <div><span>읽기</span><strong>{mission.reading}</strong></div>
        {mission.total === 100 && <div className="hundred-card"><span>백 · 십 · 일</span><strong>1 · 0 · 0</strong></div>}
      </div>
      <button type="button" className="primary-button" onClick={() => dispatch({ type: "NEXT_MISSION" })}>
        {state.isReplay ? "정리표로 돌아가기" : state.missionIndex === 8 ? "배송 정리표 보기" : "다음 배송"}
      </button>
    </main>
  );
}
