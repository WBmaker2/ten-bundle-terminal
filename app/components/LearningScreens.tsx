"use client";

import Image from "next/image";
import { canBundle, canUnbundle, calculateTotal } from "../lib/math";
import type { SessionAction, SessionState } from "../lib/session";
import type { Mission } from "../lib/types";
import { getRequiredActionProgress } from "../lib/actionGuide";
import { ActionGuide } from "./ActionGuide";
import { CheckPanel } from "./CheckPanel";
import { ParcelVisual } from "./ParcelVisual";

export function StartScreen({ onStart }: { readonly onStart: () => void }) {
  return (
    <main className="screen start-screen">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">오늘의 수학 배송</p>
          <h1 className="hero-title" aria-label="십 묶음 택배 터미널">
            <span aria-hidden="true">십 묶음</span>
            <span aria-hidden="true">택배 터미널</span>
          </h1>
          <p className="hero-lead"><strong>10개가 모이면 십 묶음 1개</strong>가 돼요.</p>
          <p>택배를 묶거나 풀어도 모두 몇 개인지는 그대로인지 확인해 보세요.</p>
          <button type="button" className="primary-button large" onClick={onStart}>연습 시작</button>
        </div>
        <figure className="hero-visual">
          <Image
            className="hero-art"
            src="/images/parcel-terminal-hero-v1.jpg"
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
        <span><b aria-hidden="true">🧭</b> 고정 9개 미션</span>
        <span><b aria-hidden="true">🌱</b> 점수 없이 차근차근</span>
        <span><b aria-hidden="true">🔒</b> 학생 정보 저장 안 함</span>
      </div>
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
}

export function MissionScreen({ state, mission, dispatch }: MissionScreenProps) {
  if (state.phase === "intro") {
    return (
      <main className="screen narrow-screen mission-intro">
        <p className="eyebrow">배송 미션 {state.missionIndex + 1}</p>
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
          <span className="locked-total">전체 {mission.total}개 · 수량 잠금</span>
        </div>
        <ParcelVisual value={state.current} />
        <div className="relation-sentence">십 묶음 {state.current.bundles}개는 {state.current.bundles * 10}개예요. 낱개 {state.current.loose}개를 더하면 모두 {calculateTotal(state.current)}개예요.</div>
        <ActionGuide required={mission.requiredActions} history={state.actionHistory} />
        <div className="exchange-controls" aria-label="택배 묶기와 풀기 조작" aria-describedby="action-guide-status">
          <button type="button" className={nextAction === "bundle" ? "next-action-button" : undefined} onClick={() => dispatch({ type: "APPLY_EXCHANGE", action: "bundle" })} disabled={bundleDisabled}>낱개 10개 묶기</button>
          <button type="button" className={nextAction === "unbundle" ? "next-action-button" : undefined} onClick={() => dispatch({ type: "APPLY_EXCHANGE", action: "unbundle" })} disabled={unbundleDisabled}>십 묶음 1개 풀기</button>
          <button type="button" className="secondary-button" onClick={() => dispatch({ type: "UNDO_EXCHANGE" })} disabled={!state.history.length}>한 단계 되돌리기</button>
        </div>
        <div className="availability-notes">
          {bundleDisabled && <span>묶기: 낱개 10개가 있어야 해요.</span>}
          {unbundleDisabled && <span>풀기: 묶음이 있고 낱개 자리가 넉넉해야 해요.</span>}
        </div>
        {state.feedback && <p id="mission-feedback" className="feedback" role="status" aria-live="polite" aria-atomic="true">{state.feedback}</p>}
        <button type="button" className="primary-button" onClick={() => dispatch({ type: "CHECK_EXCHANGE" })}>묶음 확인</button>
      </main>
    );
  }

  if (state.phase === "check") {
    const check = mission.checks[state.checkIndex];
    return (
      <main className="screen split-screen">
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
      <button type="button" className="primary-button" onClick={() => dispatch({ type: "NEXT_MISSION" })}>{state.missionIndex === 8 ? "배송 정리표 보기" : "다음 배송"}</button>
    </main>
  );
}
